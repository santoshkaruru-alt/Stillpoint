import type { SegmentContent } from '../../src/models/types';

/** BREATHE: slow the breath to calm the nervous system. */
export const breath: SegmentContent = {
  id: 'breath',
  title: 'Breathe',
  subtitle: 'Slow, deep, easy breathing',
  ambient: { bed: 'drift', level: 0.75, binaural: 'alpha' },
  scripts: {
    short: `
Bring your attention to your breath.

Breathe in slowly through your nose, letting your belly rise.
[pause 4s]
And breathe out, long and slow, a little longer than the breath in.
[pause 6s]
Again. In through the nose, filling low and wide.
[pause 4s]
And a long, unhurried breath out.
[pause 6s]
Each breath out tells your body that it is safe. That it can let go.
[pause 6s]
Keep this rhythm on your own now. Slow in. Slower out.
[silence]
Let the breath find its own easy pace.
`,
    medium: `
Now bring your attention to your breathing.

Don't change anything yet. Just notice it. The cool air entering. The warm air leaving. The gentle rise and fall.
[pause 10s]
Now let's deepen it. Breathe in slowly through your nose, and let the breath sink all the way down, so your belly expands first, then your ribs.
[pause 5s]
Pause for a moment at the top.
[pause 2s]
And breathe out slowly, softly, letting the belly fall.
[pause 7s]
Again. Breathing in, low and wide.
[pause 5s]
Resting at the top.
[pause 2s]
And a long, smooth breath out, as if you were breathing out through a straw.
[pause 7s]
With every breath out, feel your body grow a little heavier and a little quieter.
[pause 8s]
Continue on your own now. In for a slow count of four. Out for a slow count of six.
[silence]
Let the breath become effortless. You don't need to manage it any more. Just let it breathe you.
`,
    long: `
Now bring your attention to your breathing.

To begin, don't change it at all. Simply notice it, the way you might watch waves arriving at a shore.

Notice where you feel it most. Perhaps the cool air at the tip of your nose. Perhaps the movement in your chest, or your belly.
[pause 15s]
Now, let's guide it gently. Breathe in slowly through your nose, and let the breath travel all the way down, so that your belly softens and rises first, then your lower ribs widen, then your chest.
[pause 5s]
Hold it softly at the top.
[pause 3s]
And let it go slowly, emptying from the top down. Chest. Ribs. Belly.
[pause 8s]
Again. Breathing in, low and slow, filling from the bottom up.
[pause 5s]
Resting at the top.
[pause 3s]
And a long, unhurried breath out.
[pause 8s]
One more like this. In, filling completely.
[pause 5s]
Pause.
[pause 3s]
And out, slowly, all the way to the end of the breath.
[pause 8s]
Notice how even three slow breaths have changed something. The body has received the message. It is safe to slow down.
[pause 10s]
Now keep this rhythm on your own. Breathing in for a slow count of four. Breathing out for a slow count of six or seven. The breath out always a little longer than the breath in.
[pause 30s]
With each breath out, let a little more tension leave your body. From your face. From your neck and shoulders. From your hands.
[pause 25s]
If your mind wanders, that's fine. That's what minds do. Each time you notice, simply return to the next breath. Returning is the practice.
[silence]
Now let go of any counting. Let the breath return to its own natural rhythm. Slow, soft, and easy, all on its own.
`,
  },
};
