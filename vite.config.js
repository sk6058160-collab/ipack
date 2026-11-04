import { defineConfig } from 'vite';
const BASE = process.env.VITE_BASE ?? '/ipack/';
function sw() { return { name: 'sw', apply: 'build', generateBundle(_, bundle) {
  const assets = [BASE, BASE + 'index.html', BASE + 'manifest.webmanifest', BASE + 'icons/icon-192.png', BASE + 'icons/icon-512.png', BASE + 'icons/apple-touch-icon.png', ...Object.keys(bundle).map(f => BASE + f)];
  const v = Date.now().toString(36);
  this.emitFile({ type: 'asset', fileName: 'sw.js', source: `const C='wp-${v}',P=${JSON.stringify(assets)};
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(P)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
e.respondWith(caches.match(e.request,{ignoreSearch:e.request.mode==='navigate'}).then(r=>r||fetch(e.request).catch(()=>caches.match('${BASE}index.html'))));});` });
  this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: JSON.stringify({ name: 'iPack', short_name: "iPack", id: BASE, start_url: BASE, scope: BASE, display: 'standalone', orientation: 'portrait', background_color: '#000000', theme_color: '#000000',
    icons: [192, 512].map(s => ({ src: BASE + `icons/icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png', purpose: 'any maskable' })) }, null, 2) });
} }; }
export default defineConfig({ base: BASE, plugins: [sw()] });
