import type { SegmentContent } from '../../src/models/types';

/** RETURN: gratitude, integration and coming back. */
export const closing: SegmentContent = {
  id: 'closing',
  title: 'Return',
  subtitle: 'Bring it with you',
  ambient: { bed: 'drift', level: 0.6, binaural: 'off' },
  scripts: {
    short: `
Now let the images fade, and keep the feeling.
[pause 4s]
Take a deeper breath in.
[pause 3s]
And let it go.
[pause 3s]
Begin to notice your body again. Your hands. Your feet. The surface beneath you.
[pause 5s]
Gently move your fingers and toes.
[silence]
When you are ready, open your eyes, and carry this with you into your day.
`,
    medium: `
Now slowly let the scene fade, but keep the feeling. It belongs to you now.
[pause 6s]
Give thanks, in your own words, for this time you have given yourself. And for the future that is already on its way.
[pause 10s]
Begin to come back. Take a slightly deeper breath in.
[pause 4s]
And let it go with a sigh.
[pause 5s]
Notice your body again. The weight of your hands. The contact of your feet. The sounds of the room around you.
[pause 6s]
Gently move your fingers and your toes. Roll your shoulders. Stretch in any way that feels good.
[silence]
And when you are ready, open your eyes. Take one moment to look around before you move on. You can return to this feeling whenever you choose.
`,
    long: `
Now slowly let the images fade. You don't need to hold on to them. The feeling stays with you.
[pause 8s]
Take a moment to give thanks. For this time you have given yourself. For your body, which has carried you here. For the future that is already on its way.
[pause 15s]
Set a quiet intention to come back to this feeling, again and again, throughout your day. When you notice old habits arising, you can simply remember. Breathe into your heart, and choose again.
[pause 12s]
Now begin to return.

Take a slightly deeper breath in.
[pause 4s]
And let it go with a sigh.
[pause 6s]
Another deeper breath in, filling all the way.
[pause 4s]
And let it go.
[pause 6s]
Notice the weight of your body. The surface beneath you. The temperature of the air on your skin.
[pause 8s]
Notice the sounds around you, growing a little clearer.
[pause 8s]
Begin to move. Your fingers. Your toes. Gently turn your head from side to side.
[pause 8s]
Stretch in any way your body asks for.
[silence]
And when you are ready, slowly open your eyes. Let them adjust to the light. Take a moment before you move on.

Welcome back. Carry this with you.
`,
  },
};
