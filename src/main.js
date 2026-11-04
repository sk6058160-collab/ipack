import { paint, islandGeom, DEVICES, CATS, PALS, HERO_PALS } from './draw.js';
import { drawIcon, GLYPHS, ICON_STYLES } from './icons.js';
import { zipSync } from 'fflate';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DESC = { Gradients: 'Soft mesh gradients', Patterns: 'Geometric tiles', Abstract: 'Blobs & waves', Text: 'Your quote, your font', Dark: 'True-black AMOLED', Cars: 'Synthwave roads & speed', '3D': 'Spheres, terrain, depth', Heroes: 'Comic energy & halftone', Island: 'Built around the Dynamic Island' };
const VARIANTS = ['Halo', 'Ripples', 'Creature', 'Black hole', 'Drip'];
const FONTS = [['Serif', 'Georgia, serif'], ['Sans', '-apple-system, Helvetica, sans-serif'], ['Rounded', 'ui-rounded, -apple-system, sans-serif'], ['Mono', 'ui-monospace, Menlo, monospace'], ['Bold', 'Impact, sans-serif']];
const st = { cat: 'Gradients', seed: 12345, pal: PALS[0].slice(), dev: 0, amoled: false, variant: 0, mode: 'Lock', font: FONTS[0][1], iconStyle: 'Glass', islandOutline: true };
const cv = $('#cv');
const opts = () => ({ ...st, text: $('#txt').value, variant: st.cat === 'Island' ? st.variant : undefined });
const size = () => { if (st.dev) return DEVICES[st.dev].slice(1); const d = devicePixelRatio || 1; return [Math.round(Math.min(screen.width, screen.height) * d), Math.round(Math.max(screen.width, screen.height) * d)]; };

function seg(el, items, cur, on) { el.innerHTML = items.map(([l, v]) => `<button data-v="${v}" class="${v == cur ? 'on' : ''}">${l}</button>`).join(''); el.onclick = e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); on(b.dataset.v); }; }

function overlay(W, H) {
  const ov = $('#ov'); ov.setAttribute('viewBox', `0 0 ${W} ${H}`); const s = W >= 1000 ? 3 : 2, ig = islandGeom(W, H);
  $('#ovIsland').innerHTML = ig && st.islandOutline ? `<rect x="${ig.x - ig.w / 2}" y="${ig.y - ig.h / 2}" width="${ig.w}" height="${ig.h}" rx="${ig.h / 2}" fill="#000" stroke="#ff3b30" stroke-width="${s * 1.2}" stroke-dasharray="${s * 4} ${s * 3}"/>` : '';
  const d = new Date(), f = `font-family="-apple-system,system-ui,sans-serif" fill="#fff" text-anchor="middle"`;
  let g = '';
  if (st.mode === 'Lock') {
    g = `<text x="${W / 2}" y="${s * 108}" ${f} font-size="${s * 19}" font-weight="600" opacity=".9">${d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</text>
    <text x="${W / 2}" y="${s * 200}" ${f} font-size="${s * 96}" font-weight="700" letter-spacing="${-s * 2}">${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}</text>
    <circle cx="${s * 60}" cy="${H - s * 70}" r="${s * 25}" fill="#fff3"/><circle cx="${W - s * 60}" cy="${H - s * 70}" r="${s * 25}" fill="#fff3"/>`;
  } else if (st.mode === 'Home') {
    const cols = 4, ic = s * 62, gapX = (W - cols * ic) / (cols + 1);
    for (let r = 0; r < 6; r++) for (let c = 0; c < cols; c++) g += `<rect x="${gapX + c * (ic + gapX)}" y="${s * 70 + r * s * 100}" width="${ic}" height="${ic}" rx="${ic * .225}" fill="#fff" fill-opacity=".28"/>`;
    g += `<rect x="${s * 12}" y="${H - s * 110}" width="${W - s * 24}" height="${s * 92}" rx="${s * 34}" fill="#fff" fill-opacity=".2"/>`;
    for (let c = 0; c < 4; c++) g += `<rect x="${gapX + c * (ic + gapX)}" y="${H - s * 95}" width="${ic}" height="${ic}" rx="${ic * .225}" fill="#fff" fill-opacity=".35"/>`;
  }
  $('#ovClock').innerHTML = g;
}
function render() {
  const [W, H] = size(); paint(cv, W, H, opts()); overlay(W, H);
  $('#res').textContent = `${W} × ${H} px` + (islandGeom(W, H) ? ' · Dynamic Island' : '');
  $('#textOpts').style.display = st.cat === 'Text' ? '' : 'none';
  $('#variant').style.display = $('#islandNote').style.display = st.cat === 'Island' ? '' : 'none';
  $$('#chips button').forEach(b => b.classList.toggle('on', b.dataset.c === st.cat));
}
function paletteUI() { $('#pal').innerHTML = ''; st.pal.forEach((c, i) => { const e = document.createElement('input'); e.type = 'color'; e.value = c; e.oninput = () => { st.pal[i] = e.value; render(); }; $('#pal').append(e); }); }
const rpick = a => a[Math.floor(Math.random() * a.length)];
function shuffle() { st.seed = Math.floor(Math.random() * 1e9); st.pal = (st.cat === 'Heroes' ? rpick(HERO_PALS) : rpick(PALS)).slice(); paletteUI(); render(); }
function setCat(c) { st.cat = c; if (c === 'Island') st.variant = Math.floor(Math.random() * 5), seg($('#variant'), VARIANTS.map((v, i) => [v, i]), st.variant, v => { st.variant = +v; render(); }); shuffle(); }

// views
function show(v) { $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v)); $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); document.body.classList.remove('immersive');
  if (v === 'icons') icons(); if (v === 'favs') gallery(); if (v === 'explore') explore(); if (v === 'create') render(); history.replaceState(null, '', '#' + v); }
$('#tabbar').onclick = e => { const b = e.target.closest('button'); if (b) show(b.dataset.v); };
let explored = false;
function explore() { if (explored) return; explored = true; const L = $('#catList');
  L.innerHTML = CATS.map(c => `<div class="cat" data-c="${c}"><canvas></canvas><div><b>${c}</b><small>${DESC[c]}</small></div></div>`).join('');
  $$('#catList .cat').forEach((el, i) => { const c = el.dataset.c; paint(el.querySelector('canvas'), 138, 300, { cat: c, seed: 777 + i * 97, pal: (c === 'Heroes' ? HERO_PALS[0] : PALS[i % PALS.length]).slice(), text: 'Be you.', font: FONTS[0][1], variant: c === 'Island' ? 0 : undefined }); el.onclick = () => { setCat(c); show('create'); }; }); }

// create controls
$('#chips').innerHTML = CATS.map(c => `<button data-c="${c}">${c}</button>`).join('');
$('#chips').onclick = e => { const c = e.target.dataset.c; if (c) setCat(c); };
seg($('#mode'), [['Lock Screen', 'Lock'], ['Home Screen', 'Home'], ['Clean', 'Clean']], st.mode, v => { st.mode = v; render(); });
seg($('#font'), FONTS, st.font, v => { st.font = v; render(); });
$('#device').innerHTML = DEVICES.map((d, i) => `<option value="${i}">${i ? d[0] : 'This iPhone (auto)'}</option>`).join('');
$('#device').onchange = e => { st.dev = +e.target.value; render(); };
$('#amoled').onchange = e => { st.amoled = e.target.checked; render(); };
$('#islandT').onchange = e => { st.islandOutline = e.target.checked; render(); };
$('#txt').oninput = render; $('#rand').onclick = shuffle;
$('#grab').onclick = () => $('#sheet').classList.toggle('open');
cv.onclick = () => document.body.classList.toggle('immersive');
$('#howBtn').onclick = () => $('#how').classList.remove('hidden'); $('#howClose').onclick = () => $('#how').classList.add('hidden');
async function shareBlob(b, name) {
  const f = new File([b], name, { type: b.type });
  try { if (navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
$('#save').onclick = () => cv.toBlob(b => shareBlob(b, `ipack-${st.cat.toLowerCase()}-${st.seed}.png`), 'image/png');

// favorites
const favs = () => JSON.parse(localStorage.getItem('ipack-favs') || '[]');
$('#fav').onclick = () => { const t = document.createElement('canvas'); t.width = 200; t.height = 200 * cv.height / cv.width; t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height);
  const a = favs(); a.unshift({ st: { ...st, pal: st.pal.slice() }, txt: $('#txt').value, thumb: t.toDataURL('image/jpeg', .7) }); localStorage.setItem('ipack-favs', JSON.stringify(a.slice(0, 40))); $('#fav').textContent = '♥'; setTimeout(() => $('#fav').textContent = '♡', 900); };
function gallery() { const g = $('#gallery'), f = favs(); g.innerHTML = f.length ? '' : '<p class="sub">Tap ♡ in Create to save favorites. Long-press one to remove.</p>';
  f.forEach((x, i) => { const im = new Image(); im.src = x.thumb; im.onclick = () => { Object.assign(st, x.st); $('#txt').value = x.txt || ''; $('#amoled').checked = st.amoled; paletteUI(); show('create'); };
    im.oncontextmenu = e => { e.preventDefault(); if (confirm('Remove from Favorites?')) { const a = favs(); a.splice(i, 1); localStorage.setItem('ipack-favs', JSON.stringify(a)); gallery(); } }; g.append(im); }); }

// icons
seg($('#iconStyle'), ICON_STYLES.map(s => [s, s]), st.iconStyle, v => { st.iconStyle = v; icons(); });
function icons() { const G = $('#iconGrid'); G.innerHTML = '';
  for (const n of GLYPHS) { const f = document.createElement('figure'), c = document.createElement('canvas'); drawIcon(c, n, st.iconStyle, st.pal, 240); f.append(c); f.insertAdjacentHTML('beforeend', `<figcaption>${n}</figcaption>`);
    f.onclick = () => { const big = document.createElement('canvas'); drawIcon(big, n, st.iconStyle, st.pal, 1024); big.toBlob(b => shareBlob(b, `ipack-${n.toLowerCase()}-${st.iconStyle.toLowerCase()}.png`), 'image/png'); }; G.append(f); } }
$('#zip').onclick = async () => { $('#zip').textContent = 'Preparing…'; const files = {};
  for (const n of GLYPHS) { const c = document.createElement('canvas'); drawIcon(c, n, st.iconStyle, st.pal, 1024); const b = await new Promise(r => c.toBlob(r, 'image/png')); files[`${n.toLowerCase()}.png`] = [new Uint8Array(await b.arrayBuffer()), { level: 0 }]; }
  await shareBlob(new Blob([zipSync(files)], { type: 'application/zip' }), `ipack-icons-${st.iconStyle.toLowerCase()}.zip`); $('#zip').textContent = 'Save all (ZIP)'; };

// boot
const q = new URLSearchParams(location.search);
if (CATS.includes(q.get('cat'))) setCat(q.get('cat')); else { paletteUI(); }
if (q.get('variant')) { st.variant = +q.get('variant'); seg($('#variant'), VARIANTS.map((v, i) => [v, i]), st.variant, v => { st.variant = +v; render(); }); }
if (q.get('dev')) { st.dev = +q.get('dev'); $('#device').value = st.dev; }
if (q.get('mode')) st.mode = q.get('mode');
if (q.get('sheet')) $('#sheet').classList.add('open');
if (q.get('istyle')) st.iconStyle = q.get('istyle'), seg($('#iconStyle'), ICON_STYLES.map(s => [s, s]), st.iconStyle, v => { st.iconStyle = v; icons(); });
setInterval(() => $('#v-create').classList.contains('on') && overlay(cv.width, cv.height), 15000);
setTimeout(() => $('#hint').style.opacity = 0, 3000);
show((location.hash.slice(1) || 'explore').split('?')[0]);
if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js');
