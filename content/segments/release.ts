import type { SegmentContent } from '../../src/models/types';

/**
 * RELEASE: unlearning the old self. Recognise a familiar feeling or habit,
 * observe it without becoming it, decide you are done with it, and let it
 * go, leaving room for the new self rehearsed later.
 *
 * {{letGo}} comes from the intention builder ("What are you ready to let
 * go of?") and falls back to a gentle default when empty.
 */
export const release: SegmentContent = {
  id: 'release',
  title: 'Release',
  subtitle: 'Let go of the old self',
  ambient: { bed: 'deep', level: 0.7, binaural: 'theta' },
  scripts: {
    short: `
Now bring to mind something you are ready to leave behind. {{letGo}}.
[pause 4s]
Notice how familiar it is. Where do you feel it in your body? Your chest, your stomach, your shoulders?
[pause 6s]
Notice the thoughts that usually come with it. You know them well.
[pause 5s]
You are not this feeling. You are the one who is quietly watching it.
[pause 5s]
Say gently to yourself: I see you. I am done living this way.
[pause 4s]
Now let it go. Imagine handing it to something far greater than you, and watch it dissolve into open space.
[silence]
Feel the room where it used to be. Space for something new.
`,
    medium: `
Now, from this quiet and open place, bring to mind something you are ready to leave behind. {{letGo}}.
[pause 6s]
Remember the last time it took hold of you. Where were you? What happened just before?
[pause 8s]
Notice how it feels in your body when it arrives. A tightness. A heaviness. A rush. Just notice where it lives.
[pause 10s]
And notice the thoughts that travel with it. The familiar story it tells you, again and again.
[pause 8s]
You have practised this feeling for a long time. So long that it began to feel like who you are.
[pause 6s]
But it is not who you are. It is a habit you learned. And anything learned can be unlearned.
[pause 8s]
Now watch it from a little distance, the way you might watch clouds crossing the sky. You are the sky. Not the cloud.
[pause 12s]
Gently, and honestly, make a decision. Say to yourself: I am done with this. I no longer need it.
[pause 8s]
Now surrender it. Hand it over to something larger than you, whatever that means to you. Let it be taken. You do not need to carry it any more.
[pause 10s]
Feel it loosen. Feel it dissolve, like ink in clear water.
[silence]
Notice the open space where it used to be. Light. Quiet. Ready for something new to grow.
`,
    long: `
Now, from this quiet and open place, we will gently unlearn something old, so there is room for something new.

Bring to mind something you are ready to leave behind. {{letGo}}.
[pause 10s]
Let yourself remember the last time it took hold of you. Where were you? Who was there? What happened just before?
[pause 15s]
Notice what it feels like in your body when it arrives. Perhaps a tightness in the chest. A knot in the stomach. Heat in the face. Tension in the shoulders. Just notice where it lives.
[pause 15s]
Now notice the thoughts that travel with it. The familiar story. The same few sentences you have heard in your mind many, many times.
[pause 15s]
Notice how automatic it has become. How quickly it arrives, before you have even chosen it.
[pause 10s]
You have practised this feeling for a long time. So long that it began to feel like part of who you are. Like your personality.
[pause 10s]
But it is not who you are. It is a pattern you learned, often for good reasons, at a time when you needed it. And anything that was learned can be unlearned.
[pause 15s]
Now, instead of becoming the feeling, simply watch it. Observe it from a little distance, the way you might watch weather pass across a valley.
[pause 15s]
You are the awareness that notices the feeling. Wide, still and untouched. The feeling moves through you. It is not you.
[pause 20s]
Ask yourself, honestly and kindly: what has this cost me? In my body. In my relationships. In my days.
[pause 15s]
And now, make a clear decision. Say to yourself, quietly and firmly: I see you. I know you well. And I am done with you. I choose not to live this way any more.
[pause 15s]
Now surrender it. Hand it over to something far greater than you, whatever that means to you. Life. Nature. The vast intelligence that beats your heart and breathes your breath.
[pause 10s]
You do not need to work out how. Simply let it be taken.
[pause 15s]
Feel it loosening. Softening. Dissolving, like ink spreading out into clear water, until there is nothing left but clear water.
[pause 20s]
Breathe out, long and slow, and let the last of it go.
[pause 10s]
Notice how much lighter you feel. Notice the open space where it used to be.
[silence]
This space is not empty. It is room. Room for a new way of feeling, which you are about to rehearse.
`,
  },
};
