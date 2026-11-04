import { paint, islandGeom, DEVICES, CATS, PALS, HERO_PALS } from './draw.js';
import { drawIcon, GLYPHS, ICON_STYLES, ICON_SHAPES, PACK_NAMES, PACKS, glyphsFor } from './icons.js';
import { zipSync } from 'fflate';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DESC = { Gradients: 'Soft mesh gradients', Patterns: 'Geometric tiles', Abstract: 'Blobs & waves', Text: 'Your quote, your font', Dark: 'True-black AMOLED', Cars: 'Synthwave roads & speed', '3D': 'Spheres, terrain, depth', Heroes: 'Comic energy & halftone', Island: 'Built around the Dynamic Island' };
const VARIANTS = ['Halo', 'Ripples', 'Creature', 'Black hole', 'Drip'];
const FONTS = [['Serif', 'Georgia, serif'], ['Sans', '-apple-system, Helvetica, sans-serif'], ['Rounded', 'ui-rounded, -apple-system, sans-serif'], ['Mono', 'ui-monospace, Menlo, monospace'], ['Bold', 'Impact, sans-serif']];
const st = { cat: 'Gradients', seed: 12345, pal: PALS[0].slice(), dev: 0, amoled: false, variant: 0, mode: 'Lock', font: FONTS[0][1], iconStyle: 'Colorful', iconShape: 'Circle', islandOutline: true };
const cv = $('#cv');
const opts = () => ({ ...st, scale: scale(), text: TXT, variant: st.cat === 'Island' ? st.variant : undefined });
const scale = () => st.dev ? DEVICES[st.dev][3] : (devicePixelRatio || 1);
const size = () => { if (st.dev) return DEVICES[st.dev].slice(1, 3); const d = devicePixelRatio || 1; return [Math.round(Math.min(screen.width, screen.height) * d), Math.round(Math.max(screen.width, screen.height) * d)]; };

function seg(el, items, cur, on) { el.innerHTML = items.map(([l, v]) => `<button data-v="${v}" class="${v == cur ? 'on' : ''}">${l}</button>`).join(''); el.onclick = e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); on(b.dataset.v); }; }

const BASE = import.meta.env.BASE_URL;
const CFONTS = [['System', '-apple-system,system-ui,sans-serif'], ['Rounded', 'ui-rounded,-apple-system,sans-serif'], ['Serif', 'ui-serif,"New York",Georgia,serif'], ['Mono', 'ui-monospace,Menlo,monospace'], ['Condensed', '"Avenir Next Condensed","Arial Narrow",sans-serif'], ['Didot', 'Didot,"Bodoni 72",serif']];
const FILTERS = ['Natural', 'B&W', 'Duotone', 'Color Wash', 'Vibrant'];
const DATEF = [{ weekday: 'long', month: 'long', day: 'numeric' }, { weekday: 'short', day: 'numeric', month: 'short' }, { month: 'numeric', day: 'numeric', year: 'numeric' }];
Object.assign(st, { src: null, filter: 'Natural', depth: false, clk: { font: CFONTS[0][1], weight: 700, color: '#ffffff', size: 1 }, dateF: 0, widgets: true, pan: { x: 0, y: 0, z: 1 }, page: 0, base: st.seed });
const fg = document.createElement('canvas'); fg.id = 'fg';
const imgCache = {}; const loadImg = u => imgCache[u] ||= new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = u; });
function clockGeom(W, H) { const s = scale(), z = st.clk.size; return { s, dateY: s * 108, clockY: s * (128 + 74 * z), fs: s * 96 * z, wY: s * (150 + 74 * z) }; }
const timeStr = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
const dateStr = () => new Date().toLocaleDateString([], DATEF[st.dateF]);
function overlay(W, H) {
  const ov = $('#ov'); ov.setAttribute('viewBox', `0 0 ${W} ${H}`); const g = clockGeom(W, H), s = g.s, ig = islandGeom(W, H, st.dev, s);
  $('#ovIsland').innerHTML = ig && st.islandOutline && st.cat === 'Island' && !st.src ? `<rect x="${ig.x - ig.w / 2}" y="${ig.y - ig.h / 2}" width="${ig.w}" height="${ig.h}" rx="${ig.h / 2}" fill="#000" stroke="#ff3b30" stroke-width="${s * 1.2}" stroke-dasharray="${s * 4} ${s * 3}"/>` : '';
  const f = `fill="${st.clk.color}" text-anchor="middle"`;
  $('#ovDate').innerHTML = `<rect x="${W * .2}" y="${g.dateY - s * 22}" width="${W * .6}" height="${s * 30}" fill="transparent"/><text x="${W / 2}" y="${g.dateY}" ${f} font-family="-apple-system,system-ui,sans-serif" font-size="${s * 19}" font-weight="600" opacity=".9">${dateStr()}</text>`;
  $('#ovClock').innerHTML = `<rect x="${W * .1}" y="${g.clockY - g.fs * .8}" width="${W * .8}" height="${g.fs * .9}" fill="transparent"/><text x="${W / 2}" y="${g.clockY}" ${f} font-family='${st.clk.font}' font-size="${g.fs}" font-weight="${st.clk.weight}" letter-spacing="${-s * 2}">${timeStr()}</text>`;
  const ww = s * 62, gap = s * 12, x0 = W / 2 - (4 * ww + 3 * gap) / 2;
  $('#ovWidgets').innerHTML = st.widgets ? [0, 1, 2, 3].map(i => `<rect x="${x0 + i * (ww + gap)}" y="${g.wY}" width="${ww}" height="${ww}" rx="${ww / 2}" fill="#fff" fill-opacity=".16" stroke="#fff" stroke-opacity=".25" stroke-width="${s}"/><text x="${x0 + i * (ww + gap) + ww / 2}" y="${g.wY + ww * .62}" fill="#fff" fill-opacity=".6" text-anchor="middle" font-size="${s * 24}" font-family="-apple-system">+</text>`).join('') : '';
  depthLayer(W, H);
}
function depthLayer(W, H) { if (!st.depth) { fg.style.display = 'none'; return; } fg.style.display = ''; fg.width = W; fg.height = H; const x = fg.getContext('2d'), g = clockGeom(W, H);
  x.drawImage(cv, 0, 0); x.globalCompositeOperation = 'destination-in'; const m = x.createLinearGradient(0, g.clockY - g.fs * .45, 0, g.clockY - g.fs * .1); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, '#000'); x.fillStyle = m; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }
function applyFilter(c, f, pal) { if (f === 'Natural') return; const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = hx(pal[0]).map(v => v * .18), B = hx(pal[1]), T = hx(pal[0]);
  for (let i = 0; i < p.length; i += 4) { const r = p[i], g = p[i + 1], b = p[i + 2], l = (.299 * r + .587 * g + .114 * b) / 255;
    if (f === 'B&W') { const v = Math.min(255, Math.max(0, (l - .5) * 1.15 * 255 + 128)); p[i] = p[i + 1] = p[i + 2] = v; }
    else if (f === 'Duotone') { for (let k = 0; k < 3; k++) p[i + k] = A[k] + (B[k] - A[k]) * l; }
    else if (f === 'Color Wash') { for (let k = 0; k < 3; k++) p[i + k] = p[i + k] * .6 + T[k] * l * .55 + 10; }
    else { const m = (r + g + b) / 3; for (let k = 0; k < 3; k++) p[i + k] = Math.min(255, Math.max(0, ((p[i + k] - m) * 1.45 + m - 128) * 1.08 + 128)); } }
  x.putImageData(d, 0, 0); }
function drawCover(c, im, W, H, pan = { x: 0, y: 0, z: 1 }) { c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, W, H); if (!im) return;
  const sc = Math.max(W / im.naturalWidth, H / im.naturalHeight) * pan.z, w = im.naturalWidth * sc, h = im.naturalHeight * sc;
  const mx = (w - W) / 2, my = (h - H) / 2; pan.x = Math.max(-mx, Math.min(mx, pan.x)); pan.y = Math.max(-my, Math.min(my, pan.y));
  x.imageSmoothingQuality = 'high'; x.drawImage(im, (W - w) / 2 + pan.x, (H - h) / 2 + pan.y, w, h); }
let rjob = 0;
async function render() { const job = ++rjob, [W, H] = size();
  if (st.src) { const im = await loadImg(st.src.url); if (job !== rjob) return; drawCover(cv, im, W, H, st.pan); } else paint(cv, W, H, opts());
  applyFilter(cv, st.filter, st.pal); overlay(W, H); dots();
  $('#res').textContent = `${W} × ${H} px` + (() => { const g = islandGeom(W, H, st.dev, scale()); return g ? ' · Dynamic Island' + (g.est ? ' (estimated size)' : g.approx ? ' (approx., unknown model)' : '') : ''; })();
  $('#depthB').classList.toggle('on', st.depth); }
function exportCanvas(withClock) { const [W, H] = [cv.width, cv.height], c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(cv, 0, 0);
  if (withClock) { const g = clockGeom(W, H); x.fillStyle = st.clk.color; x.textAlign = 'center'; x.font = `600 ${g.s * 19}px -apple-system,system-ui,sans-serif`; x.globalAlpha = .9; x.fillText(dateStr(), W / 2, g.dateY); x.globalAlpha = 1;
    x.font = `${st.clk.weight} ${g.fs}px ${st.clk.font}`; x.fillText(timeStr(), W / 2, g.clockY); if (st.depth) { depthLayer(W, H); x.drawImage(fg, 0, 0); } }
  return c; }
// pages (swipe to cycle)
function siblings() { if (!st.src) return null; return st.src.list || [st.src]; }
function dots() { const sib = siblings(), n = sib ? Math.min(sib.length, 12) : 5, i = sib ? sib.indexOf(sib.find(x => x.url === st.src.url)) : st.page;
  $('#dots').innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k === i % n ? 'on' : ''}"></i>`).join(''); }
function page(d) { const sib = siblings(); $('#cv').classList.remove('swl', 'swr'); void cv.offsetWidth; cv.classList.add(d > 0 ? 'swl' : 'swr');
  if (sib) { const i = sib.findIndex(x => x.url === st.src.url); const nx = sib[(i + d + sib.length) % sib.length]; st.src = { ...nx, list: sib }; st.pan = { x: 0, y: 0, z: 1 }; }
  else { st.page = (st.page + d + 5) % 5; st.seed = st.base + st.page * 7919; if (st.cat === 'Island') st.variant = st.page; }
  render(); }
const rpick = a => a[Math.floor(Math.random() * a.length)];
function shuffle() { st.seed = st.base = Math.floor(Math.random() * 1e9); st.page = 0; st.pal = (st.cat === 'Heroes' ? rpick(HERO_PALS) : rpick(PALS)).slice(); render(); }
function setCat(c) { st.cat = c; st.src = null; if (c === 'Island') st.variant = Math.floor(Math.random() * 5); shuffle(); }
// gestures
{ const P = new Map(); let start = null, pinch0 = null, moved = false;
  const stage = $('#stage'); stage.append(fg);
  stage.addEventListener('pointerdown', e => { P.set(e.pointerId, e); stage.setPointerCapture(e.pointerId); moved = false; start = { x: e.clientX, y: e.clientY, px: st.pan.x, py: st.pan.y, t: Date.now() };
    if (P.size === 2) { const [a, b] = [...P.values()]; pinch0 = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: st.pan.z }; } });
  stage.addEventListener('pointermove', e => { if (!P.has(e.pointerId)) return; P.set(e.pointerId, e); const k = devicePixelRatio || 1;
    if (Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) > 8) moved = true;
    if (P.size === 2 && pinch0 && st.src) { const [a, b] = [...P.values()]; st.pan.z = Math.max(1, Math.min(4, pinch0.z * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch0.d)); render(); }
    else if (P.size === 1 && st.src && st.pan.z > 1.01) { st.pan.x = start.px + (e.clientX - start.x) * k * cv.width / (innerWidth * k); st.pan.y = start.py + (e.clientY - start.y) * k * cv.height / (innerHeight * k); render(); } });
  const up = e => { const was = P.size; P.delete(e.pointerId); if (was !== 1 || pinch0) { if (!P.size) pinch0 = null; return; }
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!moved) return tapAt(e); if (!(st.src && st.pan.z > 1.01) && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) page(dx < 0 ? 1 : -1); };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', e => P.delete(e.pointerId)); }
function tapAt(e) { for (const id of ['ovClock', 'ovDate', 'ovWidgets']) { const r = $('#' + id).getBoundingClientRect(); if (r.width && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 6 && e.clientY <= r.bottom + 6) return openSheet({ ovClock: 'clock', ovDate: 'date', ovWidgets: 'widgets' }[id]); }
  closeSheet(); document.body.classList.toggle('immersive'); }
// bottom sheet editors
function closeSheet() { $('#csheet').classList.remove('open'); }
function openSheet(kind) { const B = $('#csBody'); let h = '';
  if (kind === 'clock') h = `<h3>Clock</h3><div class="fonts">${CFONTS.map(([n, f]) => `<button data-f='${f}' class="${f === st.clk.font ? 'on' : ''}" style='font-family:${f};font-weight:${st.clk.weight}'>12<small>${n}</small></button>`).join('')}</div>
    <div class="sw">${['#ffffff', '#f5e6c8', '#ffd60a', '#ff9f0a', '#ff375f', '#bf5af2', '#64d2ff', '#30d158', ...st.pal].map(c => `<button data-c="${c}" style="background:${c}" class="${c === st.clk.color ? 'on' : ''}"></button>`).join('')}</div>
    <label class="sl">Hue<input type="range" id="hue" min="0" max="360" value="0"></label><label class="sl">Weight<input type="range" id="wt" min="100" max="900" step="100" value="${st.clk.weight}"></label><label class="sl">Size<input type="range" id="sz" min="70" max="140" value="${st.clk.size * 100}"></label>`;
  else if (kind === 'date') h = `<h3>Date</h3><div class="list">${DATEF.map((f, i) => `<button data-d="${i}" class="${i === st.dateF ? 'on' : ''}">${new Date().toLocaleDateString([], f)}</button>`).join('')}</div>`;
  else if (kind === 'widgets') h = `<h3>Widgets</h3><p class="sub">Placeholders show where iOS widgets sit. Add real widgets in iOS after setting the wallpaper.</p><label class="cell">Show placeholders<input type="checkbox" class="tog" id="wT" ${st.widgets ? 'checked' : ''}></label>`;
  else if (kind === 'filter') h = `<h3>Style</h3><div class="list row">${FILTERS.map(f => `<button data-fl="${f}" class="${f === st.filter ? 'on' : ''}">${f}</button>`).join('')}</div>`;
  else if (kind === 'palette') h = `<h3>Palette</h3><div class="sw">${PALS.concat(HERO_PALS).slice(0, 12).map((p, i) => `<button data-p="${i}" style="background:linear-gradient(135deg,${p.join(',')})"></button>`).join('')}</div><div class="cell">Custom<span id="pal"></span></div><label class="cell">AMOLED black<input type="checkbox" class="tog" id="amoled" ${st.amoled ? 'checked' : ''}></label>`;
  else if (kind === 'pick') h = `<h3>Wallpaper</h3><div class="list row">${['Art', 'Photos', ...CATS].map(c => `<button data-k="${c}" class="${(st.src ? st.src.kind === 'art' ? 'Art' : 'Photos' : st.cat) === c ? 'on' : ''}">${c}</button>`).join('')}</div>
    <div id="pickGrid" class="pgrid"></div><label class="cell">Device<select id="device">${DEVICES.map((d, i) => `<option value="${i}" ${i === st.dev ? 'selected' : ''}>${i ? d[0] : 'This iPhone (auto)'}</option>`).join('')}</select></label><div class="cell muted">${$('#res').textContent}</div>
    ${st.cat === 'Island' && !st.src ? '<label class="cell">Island outline<input type="checkbox" class="tog" id="islandT" ' + (st.islandOutline ? 'checked' : '') + '></label><p class="sub">The Dynamic Island itself can\'t be changed; outline is approximate for the chosen model.</p>' : ''}
    ${st.cat === 'Text' && !st.src ? '<div class="cell"><input id="txt" value="' + TXT.replace(/"/g, '&quot;') + '"></div>' : ''}`;
  B.innerHTML = h; $('#csheet').classList.add('open'); B.dataset.k = kind;
  if (kind === 'palette') paletteUI();
  if (kind === 'pick') pickGrid(st.src ? (st.src.kind === 'art' ? 'Art' : 'Photos') : st.cat); }
let TXT = 'Stay hungry. Stay foolish.';
$('#csBody').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
  if (d.f) st.clk.font = d.f; if (d.c) st.clk.color = d.c; if (d.d) st.dateF = +d.d; if (d.fl) st.filter = d.fl; if (d.p) { st.pal = PALS.concat(HERO_PALS)[+d.p].slice(); paletteUI(); }
  if (d.k) { $$('#csBody [data-k]').forEach(x => x.classList.toggle('on', x === b)); return pickGrid(d.k); }
  if (d.item) { const it = JSON.parse(d.item); if (it.kind === 'gen') { setCat(it.cat); } else { const L = it.kind === 'art' ? ART : PHOTOS; st.src = { ...it, list: L.filter(x => it.all || x.category === it.category).map(x => itemOf(x, it.kind)) }; st.pan = { x: 0, y: 0, z: 1 }; render(); } return; }
  b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); render(); });
$('#csBody').addEventListener('input', e => { const t = e.target;
  if (t.id === 'hue') { st.clk.color = `hsl(${t.value},90%,${t.value == 0 ? 100 : 72}%)`; } if (t.id === 'wt') { st.clk.weight = +t.value; $$('.fonts button').forEach(b => b.style.fontWeight = t.value); } if (t.id === 'sz') st.clk.size = t.value / 100;
  if (t.id === 'txt') TXT = t.value; render(); });
$('#csBody').addEventListener('change', e => { const t = e.target; if (t.id === 'wT') st.widgets = t.checked; if (t.id === 'amoled') st.amoled = t.checked; if (t.id === 'islandT') st.islandOutline = t.checked; if (t.id === 'device') st.dev = +t.value; render(); });
$('#csheet .grab').onclick = closeSheet;
function pickGrid(k) { const G = $('#pickGrid'); let L;
  if (k === 'Art') L = ART.map(x => itemOf(x, 'art')); else if (k === 'Photos') L = PHOTOS.map(x => itemOf(x, 'photo')); else L = [{ kind: 'gen', cat: k, thumb: genThumb(k, 0) }, ...ART.filter(x => x.category === k).map(x => itemOf(x, 'art')), ...PHOTOS.filter(x => x.category === k).map(x => itemOf(x, 'photo'))];
  G.innerHTML = L.map(it => `<button data-item='${JSON.stringify({ ...it, all: k === 'Art' || k === 'Photos' }).replace(/'/g, '&#39;')}' style="background-image:url('${it.thumb}')"></button>`).join(''); }
function paletteUI() { const P = $('#pal'); if (!P) return; P.innerHTML = ''; st.pal.forEach((c, i) => { const e = document.createElement('input'); e.type = 'color'; e.value = c; e.oninput = () => { st.pal[i] = e.value; render(); }; P.append(e); }); }
$('#ctool').onclick = e => { const b = e.target.closest('button'); if (!b) return; const t = b.dataset.t; tick();
  if (t === 'depth') { st.depth = !st.depth; render(); } else if (t === 'shuffle') { if (st.src) page(1 + Math.floor(Math.random() * 5)); else shuffle(); } else openSheet(t); };
$('#cCancel').onclick = () => show('explore');
$('#cDone').onclick = () => $('#doneM').classList.remove('hidden');
$('#doneClose').onclick = () => $('#doneM').classList.add('hidden');
const fname = () => st.src ? `ipack-${st.src.file.replace('.webp', '')}` : `ipack-${st.cat.toLowerCase()}-${st.seed}`;
$('#saveClock').onclick = () => { $('#doneM').classList.add('hidden'); exportCanvas(true).toBlob(b => shareBlob(b, fname() + '-lock.png'), 'image/png'); saveFav(); };
$('#savePlain').onclick = () => { $('#doneM').classList.add('hidden'); exportCanvas(false).toBlob(b => shareBlob(b, fname() + '.png'), 'image/png'); };
$('#howBtn').onclick = () => { $('#doneM').classList.add('hidden'); $('#how').classList.remove('hidden'); }; $('#howClose').onclick = () => $('#how').classList.add('hidden');
async function shareBlob(b, name) {
  const f = new File([b], name, { type: b.type });
  try { if (navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f] }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// views
function show(v) { $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v)); $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); document.body.classList.remove('immersive'); document.body.classList.toggle('creating', v === 'create'); closeSheet();
  if (v === 'icons') icons(); if (v === 'favs') gallery(); if (v === 'explore') explore(); if (v === 'create') render(); history.replaceState(null, '', location.search + '#' + v); }
$('#tabbar').onclick = e => { const b = e.target.closest('button'); if (b) show(b.dataset.v); };

// ---- Explore (console-style home) ----
let ART = [], PHOTOS = [];
const itemOf = (x, kind) => ({ kind, file: x.file, category: x.category, title: x.title.replace(/\.\w+$/, '').replace(/_/g, ' '), url: `${BASE}${kind === 'art' ? 'art' : 'photos'}/${x.file}`, thumb: `${BASE}${kind === 'art' ? 'art' : 'photos'}/thumbs/${x.file}`, credit: x });
const gthumbs = {};
function genThumb(cat, i) { const k = cat + i; if (gthumbs[k]) return gthumbs[k]; const c = document.createElement('canvas'), ci = CATS.indexOf(cat);
  paint(c, 180, 390, { cat, seed: 777 + ci * 97 + i * 7919, pal: (cat === 'Heroes' ? HERO_PALS[i % HERO_PALS.length] : PALS[(ci + i) % PALS.length]).slice(), text: 'Be you.', font: FONTS[0][1], variant: cat === 'Island' ? i % 5 : undefined, scale: .4 });
  return gthumbs[k] = c.toDataURL('image/jpeg', .8); }
const TABS = ['Art', 'Photos', ...CATS];
let tab = 'Art', items = [], focus = 0, sound = localStorage.ipackSnd !== '0', ac;
function actx() { ac ||= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; }
function tone(f, d, v, t0 = 0, type = 'sine', f2) { const a = actx(), t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .003); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02); }
function tick() { if (!sound) return; try { tone(2100, .032, .05); } catch {} }
function pop() { if (!sound) return; try { tone(880, .06, .09, 0, 'sine', 520); tone(1760, .035, .04, .012, 'triangle'); } catch {} }
function whoosh() { if (!sound) return; try { const a = actx(), n = a.sampleRate * .22, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n) ** 2; const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime; s.buffer = b; f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2600, t + .2); g.gain.value = .06; s.connect(f).connect(g).connect(a.destination); s.start(); } catch {} }
addEventListener('touchstart', () => { if (sound) { const a = actx(); const s = a.createBufferSource(); s.buffer = a.createBuffer(1, 1, 22050); s.connect(a.destination); s.start(); } }, { once: true, passive: true });
addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.closest('#tiles,#ctabs,#iconPack') && b.id !== 'snd') pop(); }, true);
function setVH() { const sa = navigator.standalone || matchMedia('(display-mode: standalone)').matches; let h = Math.max(innerHeight, document.documentElement.clientHeight); if (sa && screen.height > h && Math.abs(screen.width - innerWidth) < 2) h = screen.height; document.documentElement.style.setProperty('--app-h', h + 'px'); }
setVH(); addEventListener('resize', setVH); addEventListener('orientationchange', () => setTimeout(setVH, 300)); visualViewport?.addEventListener('resize', setVH);
setTimeout(() => { $('#snd').textContent = sound ? '♪' : '♪̸'; $('#snd').classList.toggle('on', sound); });
$('#snd').onclick = () => { sound = !sound; localStorage.ipackSnd = sound ? '1' : '0'; $('#snd').textContent = sound ? '♪' : '♪̸'; $('#snd').classList.toggle('on', sound); tick(); };
function itemsFor(t) { if (t === 'Art') return ART.map(x => itemOf(x, 'art')); if (t === 'Photos') return PHOTOS.map(x => itemOf(x, 'photo'));
  const ci = CATS.indexOf(t); return [...ART.filter(x => x.category === t).map(x => itemOf(x, 'art')), ...Array.from({ length: 8 }, (_, i) => ({ kind: 'gen', cat: t, i, title: `${t} · Style ${i + 1}`, thumb: genThumb(t, i), seed: 777 + ci * 97 + i * 7919, pal: (t === 'Heroes' ? HERO_PALS[i % HERO_PALS.length] : PALS[(ci + i) % PALS.length]).slice() })), ...PHOTOS.filter(x => x.category === t).map(x => itemOf(x, 'photo'))]; }
let loaded = null;
async function explore() { loaded ||= Promise.all([fetch(BASE + 'art/art.json').then(r => r.json()).catch(() => []), fetch(BASE + 'photos/credits.json').then(r => r.json()).catch(() => [])]).then(([a, p]) => { ART = a; PHOTOS = p; });
  await loaded; if ($('#ctabs').children.length) return;
  $('#ctabs').innerHTML = TABS.map(t => `<button data-t="${t}" class="${t === tab ? 'on' : ''}">${t === 'Art' ? 'Featured Art' : t}</button>`).join(''); setTab(tab); }
$('#ctabs').onclick = e => { const b = e.target.closest('button'); if (b) { whoosh(); setTab(b.dataset.t); b.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' }); } };
function setTab(t) { tab = t; $$('#ctabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); items = itemsFor(t);
  $('#tiles').innerHTML = items.map((it, i) => `<button class="tile" data-i="${i}"><span style="background-image:url('${it.thumb}')"></span><b>${it.title}</b></button>`).join('') + '<div class="tail"></div>';
  $('#tiles').scrollLeft = 0; setFocus(0); $('#ctabs button.on')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }
$('#tiles').onclick = e => { const b = e.target.closest('.tile'); if (!b) return; if (+b.dataset.i === focus) return heroEdit(); setFocus(+b.dataset.i); b.scrollIntoView({ inline: 'start', behavior: 'smooth', block: 'nearest' }); };
let st0; $('#tiles').addEventListener('scroll', () => { clearTimeout(st0); st0 = setTimeout(() => { const T = $('#tiles'), w = T.querySelector('.tile')?.offsetWidth + 12 || 1; const i = Math.round(T.scrollLeft / w); if (i !== focus && items[i]) setFocus(i); }, 90); });
let ambFlip = false;
function setFocus(i) { focus = i; const it = items[i]; if (!it) return; tick(); $$('#tiles .tile').forEach((b, k) => b.classList.toggle('f', k === i));
  const L = $$('#amb .l'), on = L[ambFlip ? 0 : 1], off = L[ambFlip ? 1 : 0]; ambFlip = !ambFlip; on.style.backgroundImage = `url('${it.thumb}')`; on.classList.add('on'); off.classList.remove('on');
  const hp = $('.hp'); hp.classList.remove('in'); void hp.offsetWidth; hp.classList.add('in');
  $('#heroKind').textContent = it.kind === 'art' ? 'iPack Original Art' : it.kind === 'photo' ? 'Free photo · ' + it.credit.license : 'Generated · unique every time';
  $('#heroTitle').textContent = it.title; $('#heroSub').textContent = it.kind === 'photo' ? 'by ' + it.credit.author : it.kind === 'art' ? it.category + ' collection' : (DESC[it.cat] || '');
  if (it.kind === 'gen') { $('#heroImg').style.display = 'none'; const c = $('#heroCv'); c.style.display = ''; paint(c, 430, 932, { cat: it.cat, seed: it.seed, pal: it.pal, text: 'Be you.', font: FONTS[0][1], variant: it.cat === 'Island' ? it.i % 5 : undefined, scale: 1 }); }
  else { $('#heroCv').style.display = 'none'; const im = $('#heroImg'); im.style.display = ''; im.src = it.thumb; loadImg(it.url).then(x => { if (items[focus] === it && x) im.src = it.url; }); } }
function loadIntoCreate(it) { st.filter = 'Natural'; st.pan = { x: 0, y: 0, z: 1 };
  if (it.kind === 'gen') { st.src = null; st.cat = it.cat; st.seed = st.base = it.seed; st.page = 0; st.pal = it.pal.slice(); if (it.cat === 'Island') st.variant = it.i % 5; }
  else st.src = { ...it, list: items.filter(x => x.kind === it.kind) }; }
function heroEdit() { loadIntoCreate(items[focus]); show('create'); }
$('#heroEdit').onclick = heroEdit; $('.hp').onclick = heroEdit;
$('#heroSet').onclick = async () => { const it = items[focus], [W, H] = size(), c = document.createElement('canvas');
  if (it.kind === 'gen') paint(c, W, H, { cat: it.cat, seed: it.seed, pal: it.pal, text: TXT, font: FONTS[0][1], variant: it.cat === 'Island' ? it.i % 5 : undefined, scale: scale() }); else drawCover(c, await loadImg(it.url), W, H);
  c.toBlob(b => shareBlob(b, `ipack-${it.kind === 'gen' ? it.cat.toLowerCase() + '-' + it.seed : it.file.replace('.webp', '')}-${W}x${H}.png`), 'image/png'); };
$('#heroShuf').onclick = () => { const i = Math.floor(Math.random() * items.length); setFocus(i); $$('#tiles .tile')[i]?.scrollIntoView({ inline: 'start', behavior: 'smooth', block: 'nearest' }); };
$('#heroInfo').onclick = () => { const it = items[focus], esc = s => String(s).replace(/</g, '&lt;');
  $('#infoBody').innerHTML = it.kind === 'photo' ? `<h2>${esc(it.title)}</h2><p>by ${esc(it.credit.author)}<br>License: <b>${esc(it.credit.license)}</b></p><p><a href="${it.credit.source}" target="_blank" rel="noopener">View source on Wikimedia Commons</a></p>`
    : it.kind === 'art' ? `<h2>${esc(it.title)}</h2><p>Original iPack artwork (AI-generated for iPack). Free to use as your wallpaper.</p>` : `<h2>${esc(it.title)}</h2><p>Drawn live on your device at full resolution — every shuffle is unique. Tap Customize to change palette, style and clock.</p>`;
  $('#info').classList.remove('hidden'); };
$('#infoClose').onclick = () => $('#info').classList.add('hidden');
$('#heroFav').onclick = () => { const it = items[focus]; const a = favs(); a.unshift({ item: it.kind === 'gen' ? { ...it, thumb: it.thumb } : it, thumb: it.thumb }); localStorage.setItem('ipack-favs', JSON.stringify(a.slice(0, 60))); $('#heroFav').textContent = '♥'; setTimeout(() => $('#heroFav').textContent = '♡', 900); };

// favorites
const favs = () => JSON.parse(localStorage.getItem('ipack-favs') || '[]');
function saveFav() { const t = document.createElement('canvas'); t.width = 180; t.height = 390; t.getContext('2d').drawImage(cv, 0, 0, 180, 390);
  const a = favs(); a.unshift({ st: { ...st, pal: st.pal.slice(), src: st.src && { ...st.src, list: undefined } }, thumb: t.toDataURL('image/jpeg', .7) }); localStorage.setItem('ipack-favs', JSON.stringify(a.slice(0, 60))); }
function gallery() { const g = $('#gallery'), f = favs(); g.innerHTML = f.length ? '' : '<p class="sub">Tap ♡ in Explore (or save from Create) to keep favorites. Long-press one to remove.</p>';
  f.forEach((x, i) => { const im = new Image(); im.src = x.thumb; im.onclick = () => { if (x.item) { items = [x.item]; loadIntoCreate(x.item); } else Object.assign(st, x.st); show('create'); };
    im.oncontextmenu = e => { e.preventDefault(); if (confirm('Remove from Favorites?')) { const a = favs(); a.splice(i, 1); localStorage.setItem('ipack-favs', JSON.stringify(a)); gallery(); } }; g.append(im); }); }

// icons
// icons
const packSeg = () => seg($('#iconPack'), PACK_NAMES.map(p => [p.replace('iPack ', '') + ' Pack', p]), st.iconPack, v => { st.iconPack = v; tick(); icons(); });
const styleSeg = () => seg($('#iconStyle'), ICON_STYLES.map(s => [s, s]), st.iconStyle, v => { st.iconStyle = v; icons(); });
st.iconPack = 'iPack Original'; packSeg(); styleSeg();
const shapeSeg = () => seg($('#iconShape'), ICON_SHAPES.map(s => [s, s]), st.iconShape, v => { st.iconShape = v; icons(); }); shapeSeg();
let iconJob = 0;
async function icons() { const job = ++iconJob, G = $('#iconGrid'); G.innerHTML = ''; const pack = st.iconPack;
  $('#packInfo').innerHTML = pack === 'iPack Original' ? 'Original iPack glyphs · free to use' : `${pack} · ${PACKS[pack].license} license · <a href="${PACKS[pack].url}" target="_blank" rel="noopener">${PACKS[pack].url.replace('https://', '')}</a>`;
  for (const n of glyphsFor(pack)) { if (job !== iconJob) return; const f = document.createElement('figure'), c = document.createElement('canvas'); f.append(c); f.insertAdjacentHTML('beforeend', `<figcaption>${n}</figcaption>`); G.append(f);
    drawIcon(c, n, st.iconStyle, st.pal, 180, pack, st.iconShape);
    f.onclick = async () => { const big = document.createElement('canvas'); await drawIcon(big, n, st.iconStyle, st.pal, 1024, pack, st.iconShape); big.toBlob(b => shareBlob(b, `ipack-${pack.split(' ').pop().toLowerCase()}-${n.toLowerCase().replace(/\W+/g, '-')}-${st.iconStyle.toLowerCase()}.png`), 'image/png'); }; } }
$('#zip').onclick = async () => { const pack = st.iconPack, L = glyphsFor(pack); const files = {};
  let i = 0; for (const n of L) { $('#zip').textContent = `Preparing ${++i}/${L.length}…`; const c = document.createElement('canvas'); await drawIcon(c, n, st.iconStyle, st.pal, 1024, pack, st.iconShape); const b = await new Promise(r => c.toBlob(r, 'image/png')); files[`${n.toLowerCase().replace(/\W+/g, '-')}.png`] = [new Uint8Array(await b.arrayBuffer()), { level: 0 }]; }
  files['LICENSE.txt'] = new TextEncoder().encode(pack === 'iPack Original' ? 'Original iPack glyphs. Free to use.' : `Glyphs from ${pack} (${PACKS[pack].url}), ${PACKS[pack].license} license. Rendered by iPack.\n\n${PACKS[pack].licenseText}`);
  $('#zip').textContent = 'Save all (ZIP)'; await shareBlob(new Blob([zipSync(files)], { type: 'application/zip' }), `ipack-${pack.split(' ').pop().toLowerCase()}-${st.iconStyle.toLowerCase()}.zip`); };
$('#creditsBtn').onclick = () => { $('#creditsBody').innerHTML = `<p class="sub">Icon packs are open source; no brand logos are included — all glyphs are generic symbols.</p>` + Object.entries(PACKS).map(([k, P]) => `<details><summary><b>${k}</b> · ${P.license} · ${Object.keys(P.icons).length} icons</summary><a href="${P.url}" target="_blank" rel="noopener">${P.url}</a><pre>${P.licenseText.replace(/</g, '&lt;')}</pre></details>`).join('') + `<p class="sub">Photos: Wikimedia Commons, public domain / CC0 only. Per-photo credits are shown in the photo viewer.</p>`; $('#credits').classList.remove('hidden'); };
$('#creditsClose').onclick = () => $('#credits').classList.add('hidden');

// boot
const q = new URLSearchParams(location.search);
if (CATS.includes(q.get('cat'))) setCat(q.get('cat'));
if (q.get('variant')) st.variant = +q.get('variant');
if (q.get('dev')) st.dev = +q.get('dev');
if (q.get('filter')) st.filter = q.get('filter');
if (q.get('depth')) st.depth = true;
if (q.get('istyle')) st.iconStyle = q.get('istyle'), styleSeg();
if (q.get('shape')) st.iconShape = q.get('shape'), shapeSeg();
if (q.get('pack')) st.iconPack = q.get('pack'), packSeg();
if (q.get('tab')) tab = q.get('tab');
if (q.get('art')) { loaded = null; explore().then(() => { const it = itemsFor('Art')[+q.get('art')]; if (it) { items = itemsFor('Art'); loadIntoCreate(it); show('create'); if (q.get('sheet')) setTimeout(() => openSheet(q.get('sheet')), 300); } }); }
setInterval(() => $('#v-create').classList.contains('on') && overlay(cv.width, cv.height), 15000);
setTimeout(() => $('#hint').style.opacity = 0, 3500);
show((location.hash.slice(1) || 'explore').split('?')[0]);
if (q.get('sheet') && !q.get('art')) setTimeout(() => openSheet(q.get('sheet')), 300);
if ('serviceWorker' in navigator && import.meta.env.PROD) { const had = !!navigator.serviceWorker.controller; navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').then(r => r.update()); navigator.serviceWorker.addEventListener('controllerchange', () => had && location.reload()); }
