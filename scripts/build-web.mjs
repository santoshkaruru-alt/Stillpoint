#!/usr/bin/env node
/**
 * Builds Stillpoint as an installable web app (PWA) into ./docs
 *
 *   npm run build:web
 *
 * GitHub Pages serves ./docs from main, so the default base path is the
 * repository name, with the exact capitals GitHub uses (paths are
 * case-sensitive there):  https://<user>.github.io/Stillpoint/
 * Host it elsewhere by setting STILLPOINT_BASE_URL, e.g.
 *   STILLPOINT_BASE_URL=/ npm run build:web        (site root)
 *
 * Steps: expo export for web, then add the home-screen metadata to
 * index.html and generate an offline service worker (sw.js).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs');
const base = (process.env.STILLPOINT_BASE_URL ?? '/Stillpoint').replace(/\/$/, '');
const prefix = `${base}/`;

console.log(`Building web app for ${prefix}`);
rmSync(out, { recursive: true, force: true });
const res = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'docs'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, STILLPOINT_BASE_URL: base || '/' },
  shell: process.platform === 'win32',
});
if (res.status !== 0) process.exit(res.status ?? 1);

// ------------------------------------------------------------ index.html
const indexPath = join(out, 'index.html');
let html = readFileSync(indexPath, 'utf8');

html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
);

// Visitors who type the address with other capitals (e.g. /stillpoint/)
// are sent to the exact path, otherwise the app's files would not load.
const caseGuard = base
  ? `
    <script>
      (function () {
        var b = ${JSON.stringify(prefix)}, p = location.pathname;
        if (p.indexOf(b) !== 0 && (p + '/').toLowerCase().indexOf(b.toLowerCase()) === 0) {
          location.replace(b + p.slice(b.length) + location.search + location.hash);
        }
      })();
    </script>`
  : '';

// iOS home-screen apps can draw the page from the very top of the screen
// while reporting a viewport one status bar shorter, with the status bar
// painted over the top as an opaque strip and a top safe area of 0.
// When we detect that (a gap of up to 100px and no safe-area inset):
//   - size the app to the full screen (no strip under the tab bar), and
//   - push the content down by the gap (nothing hidden under the clock).
// Normal browsing, split view and correctly reported insets are untouched.
const fullHeight = `
    <script>
      (function () {
        var standalone = navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
        if (!standalone) return;
        function envTop() {
          var d = document.createElement('div');
          d.style.cssText = 'position:fixed;top:0;left:0;width:0;padding-top:env(safe-area-inset-top);visibility:hidden';
          (document.body || document.documentElement).appendChild(d);
          var v = parseFloat(getComputedStyle(d).paddingTop) || 0;
          d.remove();
          return v;
        }
        function fit() {
          var portrait = innerHeight >= innerWidth;
          var full = portrait ? Math.max(screen.height, screen.width) : Math.min(screen.height, screen.width);
          var gap = full - innerHeight;
          var root = document.documentElement;
          if (gap > 0 && gap <= 100) {
            root.style.setProperty('--app-height', full + 'px');
            if (envTop() < 1) root.style.setProperty('--status-gap', gap + 'px');
            else root.style.removeProperty('--status-gap');
          } else {
            root.style.removeProperty('--app-height');
            root.style.removeProperty('--status-gap');
          }
        }
        fit();
        addEventListener('DOMContentLoaded', fit);
        addEventListener('resize', fit);
        addEventListener('orientationchange', function () { setTimeout(fit, 300); });
      })();
    </script>`;

const head = `${caseGuard}${fullHeight}
    <link rel="manifest" href="${prefix}manifest.webmanifest" />
    <link rel="apple-touch-icon" href="${prefix}icons/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Stillpoint" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <style>
      html, body { background: #EDF3F6; color-scheme: light dark; }
      @media (prefers-color-scheme: dark) { html, body { background: #091925; } }
      body { -webkit-tap-highlight-color: transparent; overscroll-behavior: none; }
      input, textarea { font-size: 16px; } /* stops iOS zooming into fields */
      html, body, #root { height: var(--app-height, 100%); }
      #root { box-sizing: border-box; padding-top: var(--status-gap, 0px); }
    </style>
  </head>`;
html = html.replace('</head>', head);

const register = `
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('${prefix}sw.js', { scope: '${prefix}' }).catch(function () {});
      });
    }
  </script>
</body>`;
html = html.replace('</body>', register);
writeFileSync(indexPath, html);

// ------------------------------------------------- calendar reminders
// Browsers cannot schedule daily notifications, so the web app offers a
// repeating calendar event instead: one tiny .ics file per 15 minutes of
// the day. The time has no time zone ("floating"), so it stays at the
// same local time wherever the phone is.
const site = process.env.STILLPOINT_SITE_URL ?? `https://santoshkaruru-alt.github.io${prefix}`;
mkdirSync(join(out, 'reminders'), { recursive: true });
// RFC 5545: lines longer than 75 bytes continue on the next line after a space.
const fold = (line) => {
  const parts = [];
  let rest = Buffer.from(line, 'utf8');
  let limit = 75;
  while (rest.length > limit) {
    let cut = limit;
    while (cut > 0 && (rest[cut] & 0xc0) === 0x80) cut--; // never split a UTF-8 character
    parts.push(rest.subarray(0, cut).toString('utf8'));
    rest = rest.subarray(cut);
    limit = 74; // continuation lines start with a space
  }
  parts.push(rest.toString('utf8'));
  return parts.join('\r\n ');
};
for (let m = 0; m < 24 * 60; m += 15) {
  const hhmm = `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Stillpoint//Daily reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:stillpoint-daily-${hhmm}@stillpoint.app`,
    'DTSTAMP:20260101T000000Z',
    `DTSTART:20260101T${hhmm}00`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Stillpoint · a few quiet minutes',
    `DESCRIPTION:Time to breathe. Open Stillpoint: ${site}`,
    `URL:${site}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Time for a few quiet minutes',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ]
    .map(fold)
    .join('\r\n');
  writeFileSync(join(out, 'reminders', `stillpoint-${hhmm}.ics`), ics);
}

// --------------------------------------------------------------- sw.js
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(out)
  .map((p) => relative(out, p).split(sep).join('/'))
  .filter((f) => f !== 'metadata.json' && f !== 'sw.js' && f !== '.nojekyll');

const hash = createHash('sha256');
for (const f of files.sort()) hash.update(f).update(readFileSync(join(out, f)));
const version = hash.digest('hex').slice(0, 12);

// Large ambient loops are cached the first time they play, not up front.
const isLarge = (f) => /\/(bed|binaural)-[^/]+\.wav$/.test(f) || f.startsWith('reminders/');
const precache = ['', ...files.filter((f) => !isLarge(f))].map((f) => prefix + f);

const sw = `// Stillpoint service worker (generated by scripts/build-web.mjs)
const VERSION = 'stillpoint-${version}';
const MEDIA = 'stillpoint-media-v1'; // ambient sounds, kept across updates
const PREFIX = ${JSON.stringify(prefix)};
const PRECACHE = ${JSON.stringify(precache, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== VERSION && k !== MEDIA) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(PREFIX)) return;

  // App routes (e.g. /meditate) all load the single-page app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => (res.ok ? res : caches.match(PREFIX)))
        .catch(() => caches.match(PREFIX)),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && /\\.wav$/.test(url.pathname)) {
            const copy = res.clone();
            caches.open(MEDIA).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
`;
writeFileSync(join(out, 'sw.js'), sw);
// GitHub Pages runs Jekyll by default, which would hide the _expo folder.
writeFileSync(join(out, '.nojekyll'), '');

const size = files.reduce((s, f) => s + statSync(join(out, f)).size, 0);
console.log(`\nWeb app ready in ./docs (${(size / 1024 / 1024).toFixed(1)} MB, ${precache.length} files precached, version ${version})`);
console.log(`Preview locally: npm run preview:web`);
