import type { SegmentContent } from '../../src/models/types';

/**
 * FUTURE SELF: rehearse the intention as if it is already happening.
 *
 * Placeholders are filled from the Intention builder:
 *   {{identity}}  who you are becoming   (reads after "you are becoming")
 *   {{emotion}}   the feeling            (reads after "you feel")
 *   {{scene}}     one future scene       (reads as its own sentence)
 * Empty answers fall back to the defaults in content/intention.ts.
 */
export const future: SegmentContent = {
  id: 'future',
  title: 'Future Self',
  subtitle: 'Feel your intention as if it is already real',
  ambient: { bed: 'drift', level: 0.8, binaural: 'theta' },
  scripts: {
    short: `
Now, from this open and grateful place, bring to mind the person you are becoming.

You are becoming {{identity}}.
[pause 6s]
Notice how this version of you breathes. How you hold your shoulders. How you look out at the world.
[pause 6s]
And feel it now. You feel {{emotion}}.
[pause 8s]
Now picture this scene, as if it is happening right now. {{scene}}
[pause 6s]
See it through your own eyes. Hear it. Feel it in your body.
[pause 8s]
This is not a wish. This is a rehearsal. Your body is learning, right now, what this future feels like.
[silence]
Stay with this feeling. Let it become familiar.
`,
    medium: `
Now, from this open and grateful place, let's turn towards the future you are choosing.

Bring to mind the person you are becoming.

You are becoming {{identity}}.
[pause 8s]
Notice what is different about this version of you. How do you sit? How do you breathe? What does your face look like when you are at ease?
[pause 10s]
How do you speak to the people around you? What do you no longer need to worry about?
[pause 10s]
Now bring the feeling into your body, as if it is already true. You feel {{emotion}}.
[pause 8s]
Let it fill your chest, just as gratitude did. Breathe into it.
[pause 12s]
Now step into this scene, as if it is happening right now.

{{scene}}
[pause 8s]
You are not watching it from the outside. You are there. See it through your own eyes. Notice the light, the sounds, the people, the small details.
[pause 12s]
Feel how natural it is. How familiar. As if you have lived this many times before.
[pause 12s]
Your body doesn't know the difference between a memory and a rehearsal felt this deeply. So let it feel real. Let your body begin to remember a future that has already happened.
[pause 10s]
You are becoming {{identity}}. You feel {{emotion}}.
[silence]
Stay here, living this future, now.
`,
    long: `
Now, from this open, grateful place, we will turn towards the future you are choosing.

There is no need to force anything. Simply let it unfold, the way a picture slowly comes into focus.

Bring to mind the person you are becoming.

You are becoming {{identity}}.
[pause 10s]
Let this version of you come closer. Notice how they sit. How they breathe. How they hold their head and their shoulders. Notice the ease in their face.
[pause 15s]
Notice what they no longer carry. The old worries. The old habits. The old ways of reacting. They have simply been set down, and not picked up again.
[pause 15s]
Notice how this version of you treats people. How you listen. How you speak. How you make decisions. Calmly. Clearly. From the heart.
[pause 15s]
Now step forward, and let this version of you and your body become one. Breathe as they breathe. Sit as they sit.
[pause 15s]
And now feel it. Not as an idea, but as a sensation, as real as the warmth of gratitude a moment ago.

You feel {{emotion}}.
[pause 10s]
Breathe that feeling in through your heart. Let it settle into your chest, your belly, your hands.
[pause 20s]
Now let's step into a moment from this future, as if it is happening right now.

{{scene}}
[pause 10s]
You are not watching from the outside. You are there, inside the scene, looking out through your own eyes.

What do you see around you? Notice the light. The colours. The space.
[pause 15s]
What do you hear? Voices, sounds, the quality of the air.
[pause 15s]
What are you doing with your hands? How does your body feel as you move through this moment?
[pause 15s]
Who is with you? Notice how they respond to you, to who you have become.
[pause 15s]
And notice how natural it all feels. How ordinary, even. As though this is simply your life now. As though it has always been this way.
[pause 20s]
Stay inside this moment. Let it play out on its own. You don't need to direct every detail. Just keep feeling it.
[pause 30s]
Your body is learning, right now, what this future feels like. Every time you rehearse it with this much feeling, the path becomes more familiar. Your choices begin to lean towards it. Your body starts to expect it.
[pause 15s]
So let it be real now. You are becoming {{identity}}.
[pause 6s]
You feel {{emotion}}.
[pause 6s]
And it is already beginning.
[silence]
Rest here, in this future, as if it is now. There is nothing to wait for.
`,
  },
};
