#!/usr/bin/env node
/**
 * Serves the built web app (./docs) at the same path GitHub Pages uses, so
 * you can try it before publishing:   npm run build:web && npm run preview:web
 * Then open the printed URL. On a phone on the same Wi-Fi, use your
 * computer's IP address instead of localhost (offline mode and "Add to
 * Home Screen" need HTTPS, so test those on the published site).
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const base = (process.env.STILLPOINT_BASE_URL ?? '/Stillpoint').replace(/\/$/, '');
const port = Number(process.env.PORT ?? 8090);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.css': 'text/css',
  '.ttf': 'font/ttf',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error('No build found. Run: npm run build:web');
  process.exit(1);
}

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  if (!path.startsWith(`${base}/`)) {
    res.writeHead(302, { Location: `${base}/` });
    return res.end();
  }
  let file = normalize(join(root, path.slice(base.length)));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    return res.end();
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html'); // SPA routes
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Stillpoint web: http://localhost:${port}${base}/`));
