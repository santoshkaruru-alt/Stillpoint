import { describe, expect, it } from '@jest/globals';

import { intentionDefaults } from '@content/intention';
import { segments } from '@content/segments';
import { planFor, sessionPlans } from '@content/sessionPlans';

import type { SegmentContent, SessionPlan } from '@/models/types';

import { allocateDurations, assembleSession, fitSegment, MIN_ELASTIC_SEC } from '../assemble';
import { estimateSpeechSec, PARAGRAPH_PAUSE_SEC, parseScript } from '../script';
import { fillTemplate, hasPlaceholders, resolveIntention, toSecondPerson } from '../template';

describe('parseScript', () => {
  it('splits speech, fixed pauses and elastic silence', () => {
    const tokens = parseScript('Hello there.\n[pause 5s]\nBreathe in.\n[silence]\nGood.');
    expect(tokens).toEqual([
      { kind: 'speech', text: 'Hello there.' },
      { kind: 'pause', sec: 5 },
      { kind: 'speech', text: 'Breathe in.' },
      { kind: 'silence' },
      { kind: 'speech', text: 'Good.' },
    ]);
  });

  it('accepts decimals, missing "s" and any case', () => {
    expect(parseScript('[Pause 2.5s][pause 3][SILENCE]')).toEqual([{ kind: 'pause', sec: 5.5 }, { kind: 'silence' }]);
  });

  it('adds a short pause between paragraphs and collapses whitespace', () => {
    const tokens = parseScript('One   line\nwrapped.\n\nSecond paragraph.');
    expect(tokens).toEqual([
      { kind: 'speech', text: 'One line wrapped.' },
      { kind: 'pause', sec: PARAGRAPH_PAUSE_SEC },
      { kind: 'speech', text: 'Second paragraph.' },
    ]);
  });
});

describe('estimateSpeechSec', () => {
  it('scales with word count and voice rate', () => {
    const text = Array.from({ length: 175 }, () => 'word').join(' ') + '.';
    expect(estimateSpeechSec(text, 1)).toBeCloseTo(60.35, 1);
    expect(estimateSpeechSec(text, 0.5)).toBeCloseTo(120.35, 1);
    expect(estimateSpeechSec('', 1)).toBe(0);
  });
});

describe('templates', () => {
  it('fills intention placeholders', () => {
    const out = fillTemplate('You are becoming {{identity}}. You feel {{emotion}}. {{scene}}', {
      identity: 'a patient, present parent',
      emotion: 'calm and safe',
      scene: 'We are laughing at dinner',
    });
    expect(out).toBe('You are becoming a patient, present parent. You feel calm and safe. We are laughing at dinner.');
  });

  it('uses defaults for empty fields and drops unknown placeholders', () => {
    const out = fillTemplate('{{identity}}|{{emotion}}|{{nope}}', { identity: '  ', emotion: '' });
    expect(out).toBe(`${intentionDefaults.identity}|${intentionDefaults.emotion}|`);
  });

  it('turns first-person writing into second person', () => {
    expect(toSecondPerson("I walk on stage and I'm at ease. My hands are steady.")).toBe(
      "You walk on stage and you're at ease. Your hands are steady.",
    );
    expect(toSecondPerson('They hug me and I am happy with myself.')).toBe('They hug you and you are happy with yourself.');
  });

  it('cleans user input for inline use', () => {
    const r = resolveIntention({ identity: 'Someone calm.', emotion: 'Grateful!', scene: 'I wake up rested' });
    expect(r.identity).toBe('someone calm');
    expect(r.emotion).toBe('grateful');
    expect(r.scene).toBe('You wake up rested.');
  });

  it('future uses identity, emotion and scene; release uses letGo; nothing else is personal', () => {
    for (const seg of Object.values(segments)) {
      for (const script of Object.values(seg.scripts)) {
        if (seg.id === 'future') {
          expect(script).toContain('{{identity}}');
          expect(script).toContain('{{emotion}}');
          expect(script).toContain('{{scene}}');
        } else if (seg.id === 'release') {
          expect(script).toContain('{{letGo}}');
        } else {
          expect(hasPlaceholders(script)).toBe(false);
        }
      }
    }
  });

  it('fills the let-go placeholder, with a gentle default', () => {
    expect(fillTemplate('Leave behind. {{letGo}}.', { letGo: 'impatience.' })).toBe('Leave behind. Impatience.');
    expect(fillTemplate('{{letGo}}.', {})).toBe(`${intentionDefaults.letGo}.`);
    expect(intentionDefaults.letGo[0]).toBe(intentionDefaults.letGo[0].toUpperCase());
  });
});

describe('allocateDurations', () => {
  it('splits the total by weight and sums exactly', () => {
    for (const plan of sessionPlans) {
      const d = allocateDurations(plan);
      expect(d.reduce((a, b) => a + b, 0)).toBe(plan.lengthMin * 60);
      expect(d).toHaveLength(plan.segments.length);
    }
    const plan: SessionPlan = {
      id: 'test',
      lengthMin: 10,
      name: 't',
      description: '',
      segments: [
        { id: 'settle', variant: 'short', weight: 1 },
        { id: 'closing', variant: 'short', weight: 3 },
      ],
    };
    expect(allocateDurations(plan)).toEqual([150, 450]);
  });
});

describe('fitSegment', () => {
  const content: SegmentContent = {
    id: 'settle',
    title: 'T',
    subtitle: '',
    ambient: { bed: 'drift', level: 1, binaural: 'off' },
    scripts: {
      short: 'Hello and welcome.\n[pause 10s]\nBreathe.\n[silence]\nGood.',
      medium: 'One.\n[pause 10s]\nTwo.\n[pause 20s]\nThree.',
      long: 'x',
    },
  };

  it('gives leftover time to elastic silence and hits the target', () => {
    const seg = fitSegment(content, 'short', 120, { voiceRate: 1 });
    expect(seg.plannedSec).toBeCloseTo(120, 0);
    const elastic = seg.steps.find((s) => s.kind === 'pause' && s.elastic);
    expect(elastic && elastic.kind === 'pause' && elastic.sec).toBeGreaterThan(100);
  });

  it('applies the pause setting to fixed pauses only', () => {
    const seg = fitSegment(content, 'short', 120, { voiceRate: 1, pauseScale: 1.5 });
    const fixed = seg.steps.find((s) => s.kind === 'pause' && !s.elastic);
    expect(fixed && fixed.kind === 'pause' && fixed.sec).toBe(15);
    expect(seg.plannedSec).toBeCloseTo(120, 0);
  });

  it('scales fixed pauses when there is no elastic silence', () => {
    const seg = fitSegment(content, 'medium', 120, { voiceRate: 1 });
    expect(seg.plannedSec).toBeCloseTo(120, 0);
    const pauses = seg.steps.filter((s) => s.kind === 'pause').map((s) => (s.kind === 'pause' ? s.sec : 0));
    expect(pauses[1] / pauses[0]).toBeCloseTo(2, 1); // proportions kept
  });

  it('shrinks pauses (to a floor) when time is short', () => {
    const seg = fitSegment(content, 'short', 10, { voiceRate: 1 });
    const elastic = seg.steps.find((s) => s.kind === 'pause' && s.elastic);
    expect(elastic && elastic.kind === 'pause' && elastic.sec).toBe(MIN_ELASTIC_SEC);
    const fixed = seg.steps.find((s) => s.kind === 'pause' && !s.elastic);
    expect(fixed && fixed.kind === 'pause' && fixed.sec).toBeGreaterThanOrEqual(3.5);
    expect(fixed && fixed.kind === 'pause' && fixed.sec).toBeLessThan(10);
  });

  it('gives speech steps stable ids for recorded audio', () => {
    const seg = fitSegment(content, 'short', 120);
    expect(seg.steps.map((s) => s.id)).toEqual(['settle.short.0', 'settle.short.1', 'settle.short.2', 'settle.short.3', 'settle.short.4']);
  });
});

describe('assembleSession (real content)', () => {
  const intention = {
    identity: 'someone who feels at home in their body',
    emotion: 'joyful and free',
    scene: 'I walk along the beach at sunrise and I feel completely alive.',
  };

  const ids = sessionPlans.map((p) => p.id);

  it.each(ids)('"%s" lands within 2%% of its length at default settings', (id) => {
    const plan = planFor(id)!;
    const s = assembleSession(plan, segments, { voiceRate: 0.82, pauseScale: 1, intention, now: 1 });
    expect(s.planId).toBe(id);
    expect(Math.abs(s.totalSec - plan.lengthMin * 60)).toBeLessThanOrEqual(plan.lengthMin * 60 * 0.02);
  });

  it.each(ids)('"%s" still fits with a slow voice and long pauses', (id) => {
    const plan = planFor(id)!;
    const s = assembleSession(plan, segments, { voiceRate: 0.6, pauseScale: 1.5, intention });
    expect(Math.abs(s.totalSec - plan.lengthMin * 60)).toBeLessThanOrEqual(plan.lengthMin * 60 * 0.03);
  });

  it('guided sessions release the old self before rehearsing the new one', () => {
    for (const id of ['reset', 'return', 'deep', 'journey']) {
      const order = planFor(id)!.segments.map((x) => x.id);
      // Now, then release the old, then open the heart, then rehearse the new.
      const at = (x: (typeof order)[number]) => order.indexOf(x);
      expect(at('present')).toBeGreaterThan(-1);
      expect(at('release')).toBe(at('present') + 1);
      expect(at('heart')).toBe(at('release') + 1);
      expect(at('future')).toBe(at('heart') + 1);
      expect(order[0]).toBe('settle');
      expect(order[order.length - 1]).toBe('closing');
    }
    // The longer sessions keep the body and space practice.
    for (const id of ['return', 'deep', 'journey']) expect(planFor(id)!.segments.map((x) => x.id)).toContain('body');
    expect(planFor('centres')!.segments.map((x) => x.id)).toContain('centres');
  });

  it('finds plans by id or, for older links, by length', () => {
    expect(planFor('return')?.lengthMin).toBe(20);
    expect(planFor('20')?.id).toBe('return');
    expect(planFor(45)?.id).toBe('deep');
    expect(planFor('nope')).toBeUndefined();
  });

  it('every segment keeps some open silence at default settings', () => {
    for (const plan of sessionPlans) {
      const s = assembleSession(plan, segments, { voiceRate: 0.82 });
      for (const seg of s.segments) {
        const elastic = seg.steps.filter((x) => x.kind === 'pause' && x.elastic);
        expect(elastic.length).toBeGreaterThan(0);
        for (const e of elastic) if (e.kind === 'pause') expect(e.sec).toBeGreaterThan(MIN_ELASTIC_SEC);
      }
    }
  });

  it('weaves the intention into the future segment, in second person', () => {
    const s = assembleSession(planFor('return')!, segments, { voiceRate: 0.82, intention: { ...intention, letGo: 'I always rush.' } });
    const text = s.segments
      .find((x) => x.id === 'future')!
      .steps.map((x) => (x.kind === 'speech' ? x.text : ''))
      .join(' ');
    expect(text).toContain('You are becoming someone who feels at home in their body.');
    expect(text).toContain('You feel joyful and free.');
    expect(text).toContain('You walk along the beach at sunrise and you feel completely alive.');
    expect(text).not.toMatch(/\{\{|\}\}|\[/);
    const releaseText = s.segments.find((x) => x.id === 'release')!.steps.map((x) => (x.kind === 'speech' ? x.text : '')).join(' ');
    expect(releaseText).toContain('You always rush.');
  });

  it('never reads markers aloud', () => {
    for (const plan of sessionPlans) {
      const s = assembleSession(plan, segments, {});
      for (const seg of s.segments)
        for (const step of seg.steps) if (step.kind === 'speech') expect(step.text).not.toMatch(/\[|\]|\{\{/);
    }
  });
});
