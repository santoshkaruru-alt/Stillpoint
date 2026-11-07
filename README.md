# Stillpoint

A guided meditation and breathwork app for iPhone. Long-form "change your state"
sessions take you from settling the body, through slow breathing, body and space
awareness, the present moment and heart-centred gratitude, to rehearsing your
future self, then gently back. All scripts, names and sounds are original.

- **Meditate**: 10, 20, 45 and 60 minute sessions, assembled from seven editable
  segments, spoken by your iPhone's voice over ambient sound
- **Intention**: who you are becoming, the feeling, and one future scene, woven into
  the Future Self part of every session
- **Breathe**: Box, 4-7-8, Coherent, Physiological sigh, Rising breath and Power
  rounds, plus your own patterns. Animated orb, haptics, sound cues and a
  retention timer that logs each hold
- **Journal**: mood before and after, notes, streaks, minutes, a calendar and a
  breath-hold trend chart
- **Reminders**: optional morning and evening nudges
- **Safety first**: an acknowledgement on first launch and before intense
  breathwork, and a large Stop button on every breath screen

Everything is stored on your phone. No account, no network, no tracking.

---

## Run it on your iPhone (free, no Mac needed)

You need: a computer (Windows, Mac or Linux) with [Node.js 20+](https://nodejs.org),
and your iPhone on the **same Wi-Fi** network.

1. On your iPhone, install **Expo Go** from the App Store.
2. On your computer:

   ```bash
   git clone https://github.com/santoshkaruru-alt/Build-learn-exp.git
   cd Build-learn-exp/stillpoint
   npm install
   npx expo start
   ```

3. A QR code appears in the terminal. Open the iPhone **Camera** app, point it at
   the code and tap the banner. Stillpoint opens inside Expo Go.

Tips:

- If the phone cannot connect (office or hotel Wi-Fi often blocks it), run
  `npx expo start --tunnel` instead and scan the new code.
- Edit any file and save: the app reloads on your phone in a second or two.
- Shake the phone to open the Expo developer menu (reload, performance monitor).
- Turn the ringer switch off? Sound still plays: the app opts in to playing in
  silent mode.

### What works in Expo Go, and what needs a real build

| | Expo Go (free) | Development or App Store build |
|---|---|---|
| Everything in the app | Yes | Yes |
| Spoken guidance (device voice) | Yes, keep the screen on* | Yes |
| Ambient and binaural sound | Yes | Yes |
| Haptics, reminders, journal | Yes | Yes |
| Lock-screen "now playing" controls | No | Possible, not wired up yet (see *Not built yet*) |
| Your own app icon on the home screen | No (runs inside Expo Go) | Yes |

\* During a session Stillpoint keeps the screen awake and dims it after 20 seconds
(tap to wake). Device speech is driven by timers in the app, and iOS may pause
those if the screen locks. Recorded voice files (see *Voice* below) remove this
limit.

### Building a standalone app later (EAS)

Installing your own build on an iPhone needs an
[Apple Developer Program](https://developer.apple.com/programs/) membership
($99 a year). There is no Mac requirement: Expo's cloud service, EAS, builds
for you.

```bash
npm install -g eas-cli
eas login                     # free Expo account
eas build:configure           # once
npx expo install expo-dev-client   # once, needed for the development profile
eas device:create             # register your iPhone (opens a link on the phone)
eas build --profile development --platform ios   # dev build with fast refresh
eas build --profile preview --platform ios       # standalone, installed via link
eas build --profile production --platform ios && eas submit -p ios  # TestFlight / App Store
```

The profiles are in `eas.json`. A development build behaves like Expo Go (scan
the QR code from `npx expo start`) but with Stillpoint's own name, icon and
background-audio settings.

---

## Editing content (no code needed)

Everything spoken or shown as guidance lives in **`content/`**. Change the text,
save, and the app reloads.

| File | What it controls |
|---|---|
| `content/segments/*.ts` | The seven segment scripts, each in `short`, `medium` and `long` versions, plus each segment's title, ambient bed, level and binaural tone |
| `content/sessionPlans.ts` | Which segments and versions each session length uses, and how the time is shared (`weight`) |
| `content/intention.ts` | Intention builder prompts, examples and the fallbacks used for empty answers |
| `content/breathPresets.ts` | Breathing presets: timings, rounds and on-screen cues |
| `content/safety.ts` | Safety wording |

### Script markers

Scripts are calm, second-person, present tense. Inside a script:

- `[pause 10s]` a fixed silence. Scaled by the *Pauses* setting.
- `[silence]` an open, flexible silence. It stretches or shrinks so the segment
  fills its share of the session. Put at least one in every script.
- A blank line between paragraphs adds a short, natural 1.5 second pause.
- `{{identity}}`, `{{emotion}}`, `{{scene}}` are filled from the intention
  builder (only used in `future.ts`). They read after "You are becoming…",
  "You feel…", and as a sentence of their own. First-person answers ("I walk
  in…") are turned into "you walk in…" automatically.

After editing, run `npm test`: the tests check that every session still lands
within 2% of its length and that no marker would be read aloud.

---

## Voice

v1 uses the iPhone's built-in speech (`expo-speech`). In **Settings** you can
change the speaking pace, pitch and pause length, and pick a voice. For a much more
natural sound, download an *Enhanced* or *Premium* English voice in **iPhone
Settings > Accessibility > Spoken Content > Voices**, then choose it in Stillpoint.

The voice sits behind one interface, `src/audio/voice/VoiceProvider.ts`:

- `DeviceTTSProvider` speaks with the device voice (default).
- `RecordedVoiceProvider` plays audio files keyed by line id (for example
  `future.long.4`), and falls back to the device voice for any missing line.

To make a recorded or AI voice pack (for example with ElevenLabs):

1. `npm run export:scripts` writes every spoken line with its id to
   `exports/voice-lines.json` and `.csv`.
2. Record or generate one file per line, named by id.
3. Map the ids to files and pass the map to `RecordedVoiceProvider` in
   `src/app/session/[length].tsx`.

Lines marked `personal` contain the user's intention, so they stay on device
speech (or a live TTS call at session start).

## Sound

All audio is synthesised by `scripts/generate-audio.mjs` (`npm run generate:audio`),
so there is nothing to license: soft cue tones, a closing bell, four 30 second
seamless ambient beds (Drift, Tide, Rain, Deep) and three binaural loops
(alpha 10 Hz, theta 6 Hz, delta 3 Hz). Replace any file in `assets/audio/` with
your own recording of the same name.

Binaural tones are off by default. Turning them on shows a headphones notice.

---

## Project structure

```
stillpoint/
├── content/             Editable scripts, session plans, presets, safety copy
├── assets/audio/        Generated sounds (cues, beds, binaural)
├── scripts/             generate-audio.mjs, export-scripts.ts
└── src/
    ├── app/             Screens (Expo Router): tabs, players, modals
    ├── engine/          Pure logic, unit-tested: script parsing, templating,
    │                    session assembly, meditation runner, breath timer, stats
    ├── audio/           Audio session, cue sounds, ambient mixer, voice providers
    ├── db/              SQLite history: practices, journal, breath holds
    ├── store/           Zustand stores (settings, custom patterns), persisted
    ├── services/        Haptics, notifications
    ├── components/      UI building blocks
    ├── models/types.ts  Session, Segment, BreathPattern, JournalEntry, ...
    └── theme/           Colours, type scale, spacing
```

How a meditation plays:

1. `assembleSession()` splits the session length across segments by weight,
   fills the intention placeholders, estimates speaking time from word count and
   voice pace, and sizes the silences so each segment hits its target.
2. `MeditationRunner` walks through the steps against the clock. Each silence
   ends at its *planned* point in the session, so if the voice runs slower or
   faster than estimated the following silences absorb the difference, and a
   20 minute session still ends at about 20 minutes.
3. The player screen carries out the runner's actions: speak a line, crossfade
   the ambience, ring the bell and fade out at the end.

## Scripts

```bash
npm start               # Expo dev server (scan with Expo Go)
npm test                # unit tests (assembly, runner, breath timer, stats)
npm run typecheck       # TypeScript
npm run generate:audio  # rebuild assets/audio
npm run export:scripts  # export spoken lines for a voice pack
```

## Accessibility

- Text follows the iPhone *Text Size* setting (large titles cap their growth so
  layouts hold).
- VoiceOver labels on every control. Breath phases are announced. Steppers are
  adjustable (swipe up or down). The hold chart has a list view.
- *Reduce motion* (System, On, Off): the breathing orb stays still and shows a
  progress ring instead, and glows stop pulsing.
- Haptics let you follow breathwork with your eyes closed.

## Not built yet (and how it would fit)

- **Subscription (RevenueCat)**: wrap the session and preset lists with an
  entitlement check. Needs a development build.
- **Cloud sync**: the SQLite tables have string ids and timestamps, ready to sync.
- **Recorded voice packs**: `RecordedVoiceProvider` and `npm run export:scripts` are
  already in place.
- **Lock-screen controls**: `expo-audio` players support `setActiveForLockScreen`;
  attach it to the ambient player and route play/pause to the runner. Needs a
  development build.
- **Apple Health mindful minutes**: write each `PracticeLog` from `savePractice()`.
  Needs a development build.

## Safety

Stillpoint is a wellbeing tool, not medical treatment. Don't practise while
driving, in or near water, or standing. Stop if you feel dizzy or unwell. Check
with a doctor first if you are pregnant or have a heart condition, blood pressure
problems, epilepsy or a respiratory condition.
