# Stillpoint

A guided meditation and breathwork app. It runs as a **web app** you add to your
iPhone home screen (no App Store, no Expo Go), and the same code can later be
built as a native iPhone app. Long-form "change your state"
sessions take you from settling the body, through slow breathing, body and space
awareness, the present moment and heart-centred gratitude, to rehearsing your
future self, then gently back. All scripts, names and sounds are original.

- **Meditate**: 10, 20, 45 and 60 minute sessions, assembled from seven editable
  segments, spoken by your phone's voice over ambient sound
- **Intention**: who you are becoming, the feeling, and one future scene, woven into
  the Future Self part of every session
- **Breathe**: Box, 4-7-8, Coherent, Physiological sigh, Rising breath and Power
  rounds, plus your own patterns. Animated orb, haptics, sound cues and a
  retention timer that logs each hold
- **Journal**: mood before and after, notes, streaks, minutes, a calendar and a
  breath-hold trend chart
- **Reminders** (native app only): optional morning and evening nudges
- **Safety first**: an acknowledgement on first launch and before intense
  breathwork, and a large Stop button on every breath screen

Everything is stored on your phone, in the browser or the app. No account, no
server, no tracking.

---


## Use it on your iPhone: the web app

**Live at:** https://santoshkaruru-alt.github.io/stillpoint/
(once GitHub Pages is on, see below)

1. Open the link in **Safari** on your iPhone.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Open Stillpoint from its home-screen icon. It runs full screen, works
   offline after the first visit, and keeps your history on the phone.

### Turning on GitHub Pages (once)

The built app is committed in `docs/`, so Pages only needs to serve that folder:

1. On GitHub: **Settings > Pages > Build and deployment**: Source *Deploy from a
   branch*, Branch `main`, folder **`/docs`**. Save.
2. After a minute or two, open the link above.

### What the web app can and can't do

| | Web app (iPhone Safari) | Native app (later) |
|---|---|---|
| Meditations, intention, breathwork, journal | Yes | Yes |
| Spoken guidance | Yes, with the device's voices | Yes |
| Ambient sound, binaural tones, cues | Yes | Yes |
| Works offline, own home-screen icon | Yes | Yes |
| Haptic breath cues | Limited: Android yes; iPhone may give light taps on iOS 18+, not guaranteed | Yes |
| Daily reminders | No: browsers can't schedule local notifications | Yes |
| Keeps going with the screen locked | No: the session pauses; tap Resume | Partly (see below) |

During a session the app keeps the screen awake and dims it (tap to wake).
If you lock the phone or switch apps, the session pauses itself instead of
skipping ahead. On iOS 17 and later, sound plays even with the silent switch
on; on older versions, flip the switch if you hear nothing.

### Updating the web app after you change something

```bash
npm install            # first time only
npm run build:web      # rebuilds docs/
npm run preview:web    # optional: try it at http://localhost:8090/stillpoint/
git add docs && git commit -m "Rebuild web app" && git push
```

The base path is set for this repository's GitHub Pages address. To host it
somewhere else, build with `STILLPOINT_BASE_URL=/your/path npm run build:web`
(or `/` for a site root).

### Developing in the browser

`npx expo start --web` runs the app in your desktop browser with live reload.
Use your browser's device toolbar for a phone-sized view.

---

## Native iPhone app (optional, later)

The same code builds as a native app with haptics, reminders and better
background audio. Two ways to run it:

### Try it with Expo Go (free, no Mac needed)

You need: a computer (Windows, Mac or Linux) with [Node.js 20+](https://nodejs.org),
and your iPhone on the **same Wi-Fi** network.

1. On your iPhone, install **Expo Go** from the App Store.
2. On your computer:

   ```bash
   git clone https://github.com/santoshkaruru-alt/stillpoint.git
   cd stillpoint
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

#### What works in Expo Go, and what needs a real build

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

### Building a standalone app (EAS)

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

---

## Editing content (no code needed)

Everything spoken or shown as guidance lives in **`content/`**. Change the text,
save, and the dev app reloads. For the published web app, run
`npm run build:web` and commit `docs/` afterwards.

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
├── scripts/             generate-audio, export-scripts, build-web, preview-web
├── public/              Web app manifest and icons (copied into the build)
├── docs/                Built web app for GitHub Pages (npm run build:web)
└── src/
    ├── app/             Screens (Expo Router): tabs, players, modals
    ├── engine/          Pure logic, unit-tested: script parsing, templating,
    │                    session assembly, meditation runner, breath timer, stats
    ├── audio/           Audio session, cue sounds, ambient mixer, voice providers
    ├── db/              History: SQLite on native, localStorage on web
    ├── store/           Zustand stores (settings, custom patterns), persisted
    ├── services/        Haptics, notifications
    ├── components/      UI building blocks
    ├── models/types.ts  Session, Segment, BreathPattern, JournalEntry, ...
    └── theme/           Colours, type scale, spacing
```

Web and native share all screens and logic. Where a platform needs something
different, a `*.web.ts(x)` file sits next to the native one and the bundler
picks the right one: storage (`db/index.web.ts`, `store/kv.web.ts`), audio
(`audio/ambient.web.ts`, `cues.web.ts`, built on Web Audio because iPhone
browsers ignore volume changes on normal audio elements), icons
(`components/Icon.web.tsx`), the tab bar (`AppTabs.web.tsx`) and reminders
(stubbed on web).

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
npm run build:web       # build the web app into ./docs
npm run preview:web     # serve ./docs locally at the GitHub Pages path
npm start               # Expo dev server (Expo Go, or press w for web)
npm test                # unit tests (assembly, runner, breath timer, stats)
npm run typecheck       # TypeScript
npm run generate:audio  # rebuild assets/audio
npm run export:scripts  # export spoken lines for a voice pack
```

## Accessibility

- Native: text follows the iPhone *Text Size* setting (large titles cap their
  growth so layouts hold). Web: pinch-zoom and Safari's text size work.
- VoiceOver labels on every control. Breath phases are announced. Steppers are
  adjustable (swipe up or down). The hold chart has a list view.
- *Reduce motion* (System, On, Off): the breathing orb stays still and shows a
  progress ring instead, and glows stop pulsing.
- Haptics let you follow breathwork with your eyes closed (reliable in the
  native app; limited in iPhone browsers, so keep Sound cues on there).

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
