// オフライン用（Service Worker）。初回に全部のファイルを端末に保存し、以降は通信なしで動く。
// ファイル一覧とバージョンは tools/update-sw.mjs が書き換える（手で直さない）
const VERSION = 'v-15bbbe2cf1';
const FILES = [
  // FILES-START
  './',
  './index.html',
  './manifest.webmanifest',
  './src/art/animals.js',
  './src/art/coloring.js',
  './src/art/scenes.js',
  './src/art/things.js',
  './src/core/crayon.js',
  './src/core/drag.js',
  './src/core/feedback.js',
  './src/core/level.js',
  './src/core/palette.js',
  './src/core/settings.js',
  './src/core/sound.js',
  './src/core/speech.js',
  './src/core/words.js',
  './src/games/candles.js',
  './src/games/colors.js',
  './src/games/drawing.js',
  './src/games/lengths.js',
  './src/games/peekaboo.js',
  './src/games/shapes.js',
  './src/games/sizes.js',
  './src/main.js',
  './src/parent/guide.js',
  './src/parent/panel.js',
  './src/style.css',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon.svg',
  // FILES-END
];
const CACHE = 'crayon-no-mori-' + VERSION;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('crayon-no-mori-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true })
      || (req.mode === 'navigate' ? await cache.match('./index.html') || await cache.match('./') : null);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      return new Response('', { status: 504 });
    }
  })());
});
