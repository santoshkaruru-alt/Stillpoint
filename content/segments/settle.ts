import type { SegmentContent } from '../../src/models/types';

/**
 * ARRIVE: settle the body and posture.
 *
 * Markers:  [pause 8s] fixed silence · [silence] flexible silence that
 * stretches or shrinks so the segment fits the session length.
 * A blank line between sentences adds a short natural pause.
 */
export const settle: SegmentContent = {
  id: 'settle',
  title: 'Arrive',
  subtitle: 'Settle your body and posture',
  ambient: { bed: 'drift', level: 0.8, binaural: 'alpha' },
  scripts: {
    short: `
Welcome. Find a position where your body can be still and supported.

Sit tall but easy, or lie down if you prefer.
[pause 4s]
Let your eyes close, or rest them softly on the floor in front of you.
[pause 4s]
There is nothing to do right now, and nowhere else to be. For these few minutes, your only task is to be here.
[pause 5s]
Let your shoulders drop. Unclench your jaw. Soften the small space between your eyebrows.
[silence]
Good. Let's begin.
`,
    medium: `
Welcome. Take a moment to arrive.

Find a position where your body can be still and supported. If you are sitting, let your spine rise tall without stiffness, as if a thread were drawing the top of your head gently upward. If you are lying down, let the ground take all of your weight.
[pause 6s]
Let your hands rest wherever they are comfortable.
[pause 4s]
When you are ready, let your eyes close.
[pause 5s]
Notice that you have already done something important. You have stopped. The day can wait for a little while. Whatever needs your attention later will still be there, and you will meet it better for this time.
[pause 8s]
Let your shoulders fall away from your ears.

Let your jaw hang loose, your tongue resting softly.

Let the muscles around your eyes go slack.
[pause 8s]
Feel the places where your body meets the surface beneath you. The weight of you, held.
[silence]
Good. You are here. Let's begin.
`,
    long: `
Welcome. Take your time to arrive.

Find a position where your body can be completely still and fully supported. If you are sitting, let your sit bones settle evenly, and let your spine rise tall without effort, as if the top of your head were being drawn softly upward. If you are lying down, let the floor or the bed take all of your weight.
[pause 8s]
Make any small adjustments you need now, so that you won't need to move for a while.
[pause 8s]
Let your hands rest, palms up or palms down, whichever feels more open.
[pause 5s]
And when you are ready, let your eyes close.
[pause 8s]
Notice that you have already done the hardest part. You have stopped. You have chosen to give yourself this time.

Everything that is waiting for you will still be there afterwards. You don't need to hold any of it right now. Imagine setting it all down beside you, like a bag you have been carrying all day.
[pause 12s]
Now let your body follow.

Let your shoulders sink, a little further than you think they can.
[pause 5s]
Let your jaw unclench. Let your lips part slightly. Let your tongue rest.
[pause 5s]
Let the tiny muscles around your eyes go soft, and the forehead smooth and wide.
[pause 5s]
Let your hands become heavy and still.
[pause 8s]
Feel all the places where you are being held. The backs of your legs. Your hips. Your back. The ground is doing the work of holding you up, so you don't have to.
[pause 10s]
Notice the sounds around you, near and far. You don't need to name them or push them away. Let them come and go, like weather passing.
[silence]
Good. You have arrived. Let's begin.
`,
  },
};
