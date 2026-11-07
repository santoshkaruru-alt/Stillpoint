#!/usr/bin/env node
/**
 * Generates every sound Stillpoint uses, from scratch, so there are no
 * licensing questions: breath cue tones, a closing bell, four seamless
 * ambient beds and three binaural tone loops.
 *
 *   npm run generate:audio
 *
 * Output: assets/audio/*.wav (16-bit PCM). Deterministic: the same code
 * always produces the same files. Replace any file with your own recording
 * of the same name to change a sound.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'audio');
const SR = 22050;
const TAU = Math.PI * 2;

mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- helpers

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function writeWav(name, channels) {
  const numCh = channels.length;
  const len = channels[0].length;
  const buf = Buffer.alloc(44 + len * numCh * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + len * numCh * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numCh, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * numCh * 2, 28);
  buf.writeUInt16LE(numCh * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(len * numCh * 2, 40);
  let o = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i]));
      buf.writeInt16LE(Math.round(v * 32767), o);
      o += 2;
    }
  }
  writeFileSync(join(OUT, name), buf);
  console.log(`  ${name}  ${(buf.length / 1024).toFixed(0)} KB`);
}

function normalize(x, peak = 0.7) {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  if (m === 0) return x;
  const g = peak / m;
  for (let i = 0; i < x.length; i++) x[i] *= g;
  return x;
}

/** Make a buffer loop seamlessly: render `extra` seconds more, then crossfade the tail into the head. */
function loopify(x, loopSec, fadeSec) {
  const n = Math.round(loopSec * SR);
  const f = Math.round(fadeSec * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = x[i];
  for (let i = 0; i < f; i++) {
    const t = i / f;
    const a = Math.sqrt(t);
    const b = Math.sqrt(1 - t);
    out[i] = x[i] * a + x[n + i] * b;
  }
  return out;
}

function onePoleLP(x, cutoff) {
  const a = Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y = (1 - a) * x[i] + a * y;
    x[i] = y;
  }
  return x;
}

function onePoleHP(x, cutoff) {
  const a = Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  let prev = 0;
  for (let i = 0; i < x.length; i++) {
    y = a * (y + x[i] - prev);
    prev = x[i];
    x[i] = y;
  }
  return x;
}

function pinkNoise(n, rand) {
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = rand() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return out;
}

function brownNoise(n, rand) {
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = rand() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    out[i] = last * 3.5;
  }
  return out;
}

// -------------------------------------------------------------- one-shots

function tone(sec, fn) {
  const n = Math.round(sec * SR);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = fn(i / SR, sec);
  return x;
}

/** Soft gliding tone with a gentle bell-like envelope. */
function glide(f0, f1, sec) {
  let phase = 0;
  let phase2 = 0;
  return tone(sec, (t, d) => {
    const p = t / d;
    const f = f0 + (f1 - f0) * (p * p * (3 - 2 * p));
    phase += (TAU * f) / SR;
    phase2 += (TAU * f * 2) / SR;
    const env = Math.min(1, t / 0.04) * Math.pow(1 - p, 1.6);
    return (Math.sin(phase) + 0.18 * Math.sin(phase2)) * env;
  });
}

/** Singing-bowl style bell: inharmonic partials with long decays. */
function bell(base, sec, partials = [[1, 1, 1], [2.76, 0.45, 1.6], [5.4, 0.22, 2.4], [8.93, 0.1, 3.4]]) {
  return tone(sec, (t) => {
    let v = 0;
    for (const [ratio, amp, decayMul] of partials) {
      const wobble = 1 + 0.002 * Math.sin(TAU * 4.7 * t);
      v += amp * Math.sin(TAU * base * ratio * wobble * t) * Math.exp((-t * decayMul * 2.2) / sec * 3);
    }
    return v * Math.min(1, t / 0.008);
  });
}

console.log('Cue tones');
writeWav('cue-in.wav', [normalize(glide(392, 523.25, 0.7), 0.5)]);
writeWav('cue-out.wav', [normalize(glide(523.25, 349.23, 0.9), 0.5)]);
writeWav('cue-hold.wav', [normalize(bell(659.25, 1.2), 0.38)]);
writeWav('cue-done.wav', [normalize(bell(523.25, 2.2), 0.5)]);
writeWav('bell.wav', [normalize(bell(196, 7), 0.6)]);

// ---------------------------------------------------------- ambient beds
// Frequencies are multiples of 1/30 Hz so sustained tones complete whole
// cycles in the 30 s loop; noise layers are crossfaded at the seam.

const LOOP = 30;
const FADE = 3;
const N = Math.round((LOOP + FADE) * SR);

function drift() {
  // Warm open pad (A, E, A, C#, E) with slow independent swells.
  const voices = [
    [110, 0.5, 30], [110 + 4 / 30, 0.35, 15],
    [164.8, 0.32, 10], [220, 0.28, 15], [220 - 3 / 30, 0.2, 30],
    [277.2, 0.16, 7.5], [329.6, 0.12, 10],
  ];
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let v = 0;
    for (const [f, a, lfo] of voices) {
      const swell = 0.55 + 0.45 * Math.sin(TAU * t / lfo + f);
      v += a * swell * (Math.sin(TAU * f * t) + 0.08 * Math.sin(TAU * f * 3 * t));
    }
    x[i] = v;
  }
  const air = onePoleLP(pinkNoise(N, mulberry32(7)), 900);
  for (let i = 0; i < N; i++) x[i] += air[i] * 0.25;
  return normalize(loopify(x, LOOP, FADE), 0.55);
}

function tide() {
  // Slow ocean swells: brown noise body + brighter wash at each crest.
  const rand = mulberry32(11);
  const body = onePoleLP(brownNoise(N, rand), 700);
  const wash = onePoleHP(onePoleLP(pinkNoise(N, rand), 3500), 300);
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const s1 = 0.5 - 0.5 * Math.cos(TAU * t / 7.5);
    const s2 = 0.5 - 0.5 * Math.cos(TAU * t / 10 + 1.3);
    const swell = 0.25 + 0.75 * Math.pow(0.6 * s1 + 0.4 * s2, 1.8);
    x[i] = body[i] * (0.45 + 0.55 * swell) + wash[i] * swell * 0.9;
  }
  return normalize(loopify(x, LOOP, FADE), 0.55);
}

function rain() {
  // Soft steady rain with sparse droplets.
  const rand = mulberry32(23);
  const hiss = onePoleHP(onePoleLP(pinkNoise(N, rand), 5000), 500);
  const low = onePoleLP(brownNoise(N, rand), 400);
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = hiss[i] * 0.8 + low[i] * 0.35;
  const drops = Math.round(LOOP * 9);
  for (let d = 0; d < drops; d++) {
    const start = Math.floor(rand() * (N - SR * 0.1));
    const f = 1800 + rand() * 2600;
    const amp = 0.04 + rand() * 0.08;
    for (let k = 0; k < SR * 0.06; k++) {
      const t = k / SR;
      x[start + k] += amp * Math.sin(TAU * f * t * (1 - t * 3)) * Math.exp(-t * 90);
    }
  }
  return normalize(loopify(x, LOOP, FADE), 0.5);
}

function deep() {
  // Low, grounding drone with a slow breathing motion.
  const voices = [[55, 0.6, 15], [82.5, 0.3, 10], [110, 0.25, 30], [165, 0.08, 7.5]];
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let v = 0;
    for (const [f, a, lfo] of voices) {
      v += a * (0.6 + 0.4 * Math.sin(TAU * t / lfo)) * Math.sin(TAU * f * t);
    }
    x[i] = v;
  }
  const rumble = onePoleLP(brownNoise(N, mulberry32(31)), 250);
  for (let i = 0; i < N; i++) x[i] += rumble[i] * 0.4;
  return normalize(loopify(x, LOOP, FADE), 0.55);
}

console.log('Ambient beds (30 s seamless loops)');
writeWav('bed-drift.wav', [drift()]);
writeWav('bed-tide.wav', [tide()]);
writeWav('bed-rain.wav', [rain()]);
writeWav('bed-deep.wav', [deep()]);

// --------------------------------------------------------------- binaural
// Left and right ears get slightly different pure tones; the brain hears
// the difference as a slow beat. Needs headphones. 10 s loops, all
// frequencies whole numbers so every cycle completes at the seam.

function binaural(left, right, sec = 10) {
  const n = Math.round(sec * SR);
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    l[i] = 0.35 * Math.sin(TAU * left * t);
    r[i] = 0.35 * Math.sin(TAU * right * t);
  }
  return [l, r];
}

console.log('Binaural loops');
writeWav('binaural-alpha.wav', binaural(180, 190)); // 10 Hz: relaxed, alert
writeWav('binaural-theta.wav', binaural(170, 176)); // 6 Hz: deep meditation
writeWav('binaural-delta.wav', binaural(150, 153)); // 3 Hz: very deep rest

console.log(`Done -> ${OUT}`);
