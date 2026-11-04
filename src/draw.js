// Rendering engine: all wallpapers are drawn on-device with canvas 2D.
export const ISLAND_PT = { w: 126, h: 37, top: 11 }; // approx. Dynamic Island size/offset in points
export function islandGeom(W, H) {
  const s = 3; const ptW = W / s, ptH = H / s;
  if (!(ptH >= 852 && ptW >= 393 && ptH / ptW > 2.1)) return null; // only 14 Pro / 15 / 16 class phones
  const top = ptW >= 402 ? 14 : ISLAND_PT.top; // 16 Pro / Pro Max sit slightly lower
  return { x: W / 2, y: (top + ISLAND_PT.h / 2) * s, w: ISLAND_PT.w * s, h: ISLAND_PT.h * s };
}
const DEVICES = [['Auto',0,0],['iPhone 16 Pro Max',1320,2868],['iPhone 16 Pro',1206,2622],['iPhone 16 Plus / 15 Plus / 14 Pro Max',1290,2796],['iPhone 16 / 15 / 15 Pro / 14 Pro',1179,2556],['iPhone 14 / 13 / 12',1170,2532],['iPhone 13 mini / 12 mini',1080,2340],['iPhone 11 / XR',828,1792],['iPhone 11 Pro Max / XS Max',1242,2688],['iPhone SE (2nd/3rd)',750,1334]];
const CATS = ['Gradients','Patterns','Abstract','Text','Dark','Cars','3D','Heroes','Island'];
const PALS = [['#7c5cff','#ff5c9a','#ffb86b'],['#00c6ff','#0072ff','#00ffa3'],['#ff512f','#f09819','#dd2476'],['#11998e','#38ef7d','#0f3443'],['#fc466b','#3f5efb','#1b1b3a'],['#f7971e','#ffd200','#23074d'],['#00f5d4','#9b5de5','#f15bb5']];
const HERO_PALS = [['#c8102e','#ffc72c','#0a0a14'],['#1e3a8a','#fbbf24','#0b1020'],['#0f172a','#facc15','#020617'],['#7f1d1d','#f59e0b','#111827']];
let ctx, cv, O;
let R; const rng = s => () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
const rr = (a, b) => a + R() * (b - a), pick = a => a[Math.floor(R() * a.length)];
const hex = (h, a = 1) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; };

function lin(W, H, cols, ang = rr(0, 6.28)) { const g = ctx.createLinearGradient(W / 2 - Math.cos(ang) * W, H / 2 - Math.sin(ang) * H, W / 2 + Math.cos(ang) * W, H / 2 + Math.sin(ang) * H); cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c)); return g; }
function blob(x, y, r, c, a = 1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hex(c, a)); g.addColorStop(1, hex(c, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); }
function bg(W, H, c) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
function grain(W, H, a = .04) { for (let i = 0; i < W * H / 400; i++) { ctx.fillStyle = `rgba(255,255,255,${R() * a})`; ctx.fillRect(R() * W, R() * H, 2, 2); } }

const draw = {
  Gradients(W, H, p) {
    ctx.fillStyle = lin(W, H, p); ctx.fillRect(0, 0, W, H);
    if (R() < .7) for (let i = 0; i < 5; i++) blob(rr(0, W), rr(0, H), rr(.4, .9) * W, pick(p), .7); // mesh
    grain(W, H);
  },
  Patterns(W, H, p) {
    bg(W, H, p[2]); const s = W / Math.floor(rr(5, 12)), t = Math.floor(rr(0, 4));
    for (let y = 0; y < H + s; y += s) for (let x = 0; x < W + s; x += s) {
      ctx.fillStyle = pick(p.slice(0, 2)); ctx.globalAlpha = rr(.4, 1); ctx.beginPath();
      if (t == 0) { ctx.moveTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(R() < .5 ? x : x + s, y + s); }
      else if (t == 1) ctx.arc(x + s / 2, y + s / 2, s * rr(.15, .45), 0, 7);
      else if (t == 2) { ctx.arc(x + (R() < .5 ? 0 : s), y + (R() < .5 ? 0 : s), s, 0, 7); }
      else { ctx.rect(x + s * .1, y + s * .1, s * .8, s * .8 * rr(.2, 1)); }
      ctx.fill();
    } ctx.globalAlpha = 1;
  },
  Abstract(W, H, p) {
    bg(W, H, p[2]); blob(W * .3, H * .3, W, p[0], .6);
    for (let k = 0; k < 7; k++) { const y0 = H * (.3 + k * .1); ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += W / 40) ctx.lineTo(x, y0 + Math.sin(x / W * rr(2, 6) + k) * H * .04);
      ctx.lineTo(W, H); ctx.fillStyle = hex(p[k % 2], .25 + k * .05); ctx.fill(); }
    for (let i = 0; i < 4; i++) { ctx.beginPath(); const cx = rr(0, W), cy = rr(0, H * .6), r = rr(.1, .3) * W;
      for (let a = 0; a <= 6.3; a += .3) { const rad = r * (1 + .25 * Math.sin(a * 3 + i)); ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
      ctx.fillStyle = hex(pick(p), .55); ctx.fill(); }
    grain(W, H);
  },
  Text(W, H, p) {
    if (O.amoled) bg(W, H, '#000'); else { ctx.fillStyle = lin(W, H, [p[2], p[0]]); ctx.fillRect(0, 0, W, H); }
    const t = O.text || ' ', f = O.font, fs = W * .085; ctx.font = `600 ${fs}px ${f}`;
    ctx.fillStyle = O.amoled ? p[0] : '#fff'; ctx.textAlign = 'center';
    const lines = []; let cur = ''; for (const w of t.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > W * .8) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, H * .62 + (i - lines.length / 2) * fs * 1.3));
  },
  Dark(W, H, p) {
    bg(W, H, '#000'); const t = Math.floor(rr(0, 3));
    if (t == 0) { ctx.strokeStyle = hex(p[0], .8); ctx.lineWidth = W * .004; for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.arc(W / 2, H * .55, W * .03 * i, 0, 7); ctx.globalAlpha = 1 - i / 30; ctx.stroke(); } ctx.globalAlpha = 1; }
    else if (t == 1) for (let i = 0; i < 400; i++) { ctx.fillStyle = hex(pick(p), rr(.2, 1)); ctx.fillRect(rr(0, W), rr(0, H), W * .003, W * .003); }
    else { blob(W * .5, H, W * .9, p[0], .7); blob(W * .2, H * .9, W * .5, p[1], .5); }
  },
  Cars(W, H, p) {
    const hz = H * .55; ctx.fillStyle = lin(W, H, ['#0b0221', p[1], p[0]], Math.PI / 2); ctx.fillRect(0, 0, W, hz);
    // sun
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, hz, W * .3, Math.PI, 0); ctx.fillStyle = lin(W, H, [p[2] || '#ffd200', p[0]], Math.PI / 2); ctx.fill();
    ctx.fillStyle = '#0b0221'; for (let i = 0; i < 7; i++) ctx.fillRect(0, hz - W * .3 * (i / 7), W, W * .006 * (7 - i) * .6); ctx.restore();
    // mountains
    ctx.beginPath(); ctx.moveTo(0, hz); for (let x = 0; x <= W; x += W / 12) ctx.lineTo(x, hz - rr(0, H * .08)); ctx.lineTo(W, hz); ctx.fillStyle = '#12052e'; ctx.fill();
    bg2(0, hz, W, H - hz, '#0b0221');
    ctx.strokeStyle = hex(p[1], .9); ctx.lineWidth = W * .003;
    for (let i = 1; i < 20; i++) { const y = hz + (H - hz) * Math.pow(i / 20, 2); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(W / 2, hz); ctx.lineTo(W / 2 + i * W * .25, H); ctx.stroke(); }
    // speed lines
    for (let i = 0; i < 40; i++) { ctx.strokeStyle = hex(pick(p), rr(.2, .7)); ctx.lineWidth = rr(1, W * .004); const y = rr(hz * .9, H * .85), x = rr(-W * .2, W); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rr(.1, .4) * W, y); ctx.stroke(); }
    // stylized sports car silhouette (original shape)
    const cw = W * .78, cx = (W - cw) / 2, cy = H * .78, u = cw / 100;
    ctx.save(); ctx.shadowColor = p[0]; ctx.shadowBlur = W * .05; ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + 2 * u, cy - 9 * u); ctx.quadraticCurveTo(cx + 20 * u, cy - 13 * u, cx + 32 * u, cy - 14 * u);
    ctx.quadraticCurveTo(cx + 45 * u, cy - 25 * u, cx + 60 * u, cy - 24 * u); ctx.quadraticCurveTo(cx + 75 * u, cy - 22 * u, cx + 88 * u, cy - 13 * u);
    ctx.lineTo(cx + 100 * u, cy - 9 * u); ctx.lineTo(cx + 100 * u, cy); ctx.closePath(); ctx.fillStyle = '#05010f'; ctx.fill();
    ctx.strokeStyle = p[0]; ctx.lineWidth = W * .004; ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(cx + 38 * u, cy - 15 * u); ctx.quadraticCurveTo(cx + 48 * u, cy - 22 * u, cx + 58 * u, cy - 21.5 * u); ctx.lineTo(cx + 72 * u, cy - 15 * u); ctx.closePath(); ctx.fillStyle = hex(p[1], .5); ctx.fill();
    for (const wx of [20, 80]) { ctx.beginPath(); ctx.arc(cx + wx * u, cy, 8 * u, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.strokeStyle = p[1]; ctx.lineWidth = W * .005; ctx.stroke(); ctx.beginPath(); ctx.arc(cx + wx * u, cy, 4 * u, 0, 7); ctx.strokeStyle = hex(p[0], .8); ctx.stroke(); }
    ctx.fillStyle = '#ff2a4a'; ctx.fillRect(cx, cy - 8 * u, 3 * u, 2 * u); ctx.fillStyle = '#fff6c0'; ctx.fillRect(cx + 97 * u, cy - 8 * u, 3 * u, 2 * u);
  },
  '3D'(W, H, p) {
    const t = Math.floor(rr(0, 3));
    if (t == 1) { // extruded wireframe terrain
      bg(W, H, '#05050a'); blob(W / 2, H * .3, W * .8, p[0], .5);
      const rows = 40, cols = 30, hz = H * .35; const z = (r, c) => Math.sin(c * .4 + O.seed % 7) * Math.cos(r * .3) + Math.sin(c * .17 + r * .23) * 1.5;
      for (let r = rows; r > 0; r--) { const d = r / rows, y = hz + (H - hz) * (1 - d) ** 1.6, sc = 1 / (d * 3 + .3);
        ctx.beginPath(); for (let c = 0; c <= cols; c++) { const x = W / 2 + (c - cols / 2) * W * .09 * sc, yy = y - z(r, c) * H * .03 * sc; c ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
        ctx.lineTo(W * 3, H * 2); ctx.lineTo(-W * 2, H * 2); ctx.closePath(); ctx.fillStyle = '#05050a'; ctx.fill(); ctx.strokeStyle = hex(p[1], 1 - d * .8); ctx.lineWidth = W * .0025; ctx.stroke(); }
      return;
    }
    ctx.fillStyle = lin(W, H, [p[2], '#000'], Math.PI / 2); ctx.fillRect(0, 0, W, H);
    if (t == 2) { // parallax layers
      for (let L = 0; L < 6; L++) { const y0 = H * (.35 + L * .11); ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += W / 30) ctx.lineTo(x, y0 - Math.abs(Math.sin(x / W * (3 + L) + L)) * H * .12); ctx.lineTo(W, H);
        ctx.save(); ctx.shadowColor = '#000'; ctx.shadowBlur = W * .05; ctx.shadowOffsetY = -W * .02; ctx.fillStyle = lin(W, H, [p[L % 2], p[2]], Math.PI / 2); ctx.globalAlpha = .5 + L * .1; ctx.fill(); ctx.restore(); }
      return;
    }
    // lit spheres + glass
    const n = Math.floor(rr(4, 8)); const lx = -.5, ly = -.6;
    for (let i = 0; i < n; i++) { const r = rr(.1, .3) * W, x = rr(0, W), y = rr(H * .15, H * .95), c = pick(p.slice(0, 2));
      ctx.save(); ctx.shadowColor = '#000c'; ctx.shadowBlur = r * .5; ctx.shadowOffsetY = r * .3;
      const g = ctx.createRadialGradient(x + lx * r * .5, y + ly * r * .5, r * .05, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(.25, c); g.addColorStop(1, '#000');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.globalAlpha = R() < .3 ? .55 : 1; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(x, y, r * .97, 0, 7); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = r * .03; ctx.stroke(); }
  },

  Island(W, H, p) {
    const g = islandGeom(W, H) || { x: W / 2, y: W * .074, w: W * .32, h: W * .094 };
    const { x, y, w, h } = g, t = O.variant ?? Math.floor(rr(0, 5));
    bg(W, H, '#000');
    const pill = (dx = 0, dy = 0, sc = 1) => { ctx.beginPath(); ctx.roundRect(x - w * sc / 2 + dx, y - h * sc / 2 + dy, w * sc, h * sc, h * sc / 2); };
    if (t == 0) { // neon halo
      for (let i = 8; i > 0; i--) { ctx.save(); ctx.shadowColor = p[i % 2]; ctx.shadowBlur = W * .03 * i; ctx.strokeStyle = hex(p[i % 2], .9 / i); ctx.lineWidth = W * .006; pill(0, 0, 1 + i * .06); ctx.stroke(); ctx.restore(); }
      blob(x, y, W * .7, p[0], .35); blob(W / 2, H, W, p[1], .4);
    } else if (t == 1) { // ripples
      blob(x, y, H * .8, p[0], .25);
      for (let i = 1; i < 26; i++) { ctx.strokeStyle = hex(p[i % 3], Math.max(0, .8 - i * .03)); ctx.lineWidth = W * .004; pill(0, 0, 1 + i * .55); ctx.stroke(); }
    } else if (t == 2) { // creature peeking: pill = eye mask
      ctx.fillStyle = lin(W, H, [p[0], p[1]], Math.PI / 2); ctx.beginPath(); ctx.ellipse(x, y + h * .6, w * 1.6, h * 2.6, 0, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x, y + h * .6, w * 1.6, h * 1.2, 0, 0, Math.PI); ctx.fill();
      for (const s of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x + s * w * .8, y - h * .2, h * .75, h * .9, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x + s * w * .8, y + h * .1, h * .4, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#fff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * w * .25, y + h * 1.6); ctx.lineTo(x + s * w * .15, y + h * 2.3); ctx.lineTo(x + s * w * .05, y + h * 1.6); ctx.fill(); }
      for (let i = 0; i < 120; i++) { ctx.fillStyle = hex(pick(p), rr(.1, .6)); ctx.beginPath(); ctx.arc(rr(0, W), rr(H * .25, H), rr(1, W * .006), 0, 7); ctx.fill(); }
      pill(); ctx.fillStyle = '#000'; ctx.fill();
    } else if (t == 3) { // black hole
      for (let i = 0; i < 600; i++) { ctx.fillStyle = `rgba(255,255,255,${rr(.1, .9)})`; ctx.fillRect(rr(0, W), rr(0, H), rr(1, 3), rr(1, 3)); }
      for (let i = 0; i < 40; i++) { ctx.save(); ctx.translate(x, y); ctx.scale(1, .32); ctx.beginPath(); ctx.arc(0, 0, w * (.8 + i * .06), 0, 7); ctx.restore();
        ctx.strokeStyle = hex(i % 2 ? p[0] : (p[1]), .5 - i * .011); ctx.lineWidth = W * .006; ctx.stroke(); }
      ctx.save(); ctx.shadowColor = p[0]; ctx.shadowBlur = W * .08; pill(0, 0, 1.15); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
      blob(x, y + H * .45, W * .8, p[1], .25);
    } else { // liquid drip
      ctx.fillStyle = lin(W, H, [p[0], p[1]], Math.PI / 2); pill(0, 0, 1.08); ctx.fill();
      for (let i = 0; i < 7; i++) { const dx = x - w * .45 + i * w * .15 + rr(-5, 5), len = rr(.05, .55) * H, r = rr(.015, .03) * W;
        ctx.beginPath(); ctx.moveTo(dx - r, y); ctx.lineTo(dx - r * .6, y + len); ctx.arc(dx, y + len, r * 1.3, Math.PI, 0, true); ctx.lineTo(dx + r, y); ctx.fill(); }
      blob(x, H, W, p[2] === '#000' ? p[0] : p[2], .3);
    }
  },
  Heroes(W, H, p) {
    const t = Math.floor(rr(0, 3)), cx = W / 2, cy = H * .55;
    ctx.fillStyle = lin(W, H, [p[0], p[2]], Math.PI / 2); ctx.fillRect(0, 0, W, H);
    // comic burst rays
    for (let i = 0; i < 36; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); const a = i / 36 * 6.283, b = a + .08; ctx.lineTo(cx + Math.cos(a) * H, cy + Math.sin(a) * H); ctx.lineTo(cx + Math.cos(b) * H, cy + Math.sin(b) * H); ctx.fillStyle = hex(p[1], i % 2 ? .18 : .05); ctx.fill(); }
    // halftone dots
    const s = W / 45; for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) { const d = Math.hypot(x - cx, y - cy) / H; ctx.beginPath(); ctx.arc(x, y, s * .45 * Math.min(1, d * 1.3), 0, 7); ctx.fillStyle = hex('#000', .35); ctx.fill(); }
    if (t == 1) { // hex shield grid (gold, not a web)
      const hs = W * .07; ctx.strokeStyle = hex(p[1], .55); ctx.lineWidth = W * .004;
      for (let row = 0; row * hs * 1.5 < H + hs; row++) for (let col = 0; col * hs * 1.732 < W + hs; col++) {
        const x = col * hs * 1.732 + (row % 2) * hs * .866, y = row * hs * 1.5; ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; ctx.lineTo(x + Math.cos(a) * hs * .95, y + Math.sin(a) * hs * .95); }
        ctx.closePath(); ctx.globalAlpha = Math.max(.15, 1 - Math.hypot(x - cx, y - cy) / H * 1.4); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    // energy core
    ctx.save(); ctx.shadowColor = '#7dd3fc'; ctx.shadowBlur = W * .12; const er = W * (t == 0 ? .2 : .1);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, er); g.addColorStop(0, '#fff'); g.addColorStop(.4, '#a5f3fc'); g.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, er, 0, 7); ctx.fill(); ctx.restore();
    if (t == 0) { ctx.strokeStyle = hex(p[1], .9); ctx.lineWidth = W * .012; ctx.beginPath(); ctx.arc(cx, cy, er * 1.15, 0, 7); ctx.stroke();
      for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * er * 1.15, cy + Math.sin(a) * er * 1.15); ctx.lineTo(cx + Math.cos(a) * er * 1.5, cy + Math.sin(a) * er * 1.5); ctx.stroke(); } }
    if (t == 2) { // original hero silhouette, cape
      const u = W / 150, bx = cx, by = H * .95; ctx.fillStyle = '#05050a'; ctx.beginPath();
      ctx.moveTo(bx - 30 * u, by); ctx.quadraticCurveTo(bx - 34 * u, by - 60 * u, bx - 14 * u, by - 95 * u); // cape left
      ctx.lineTo(bx - 9 * u, by - 110 * u); ctx.arc(bx, by - 120 * u, 9 * u, Math.PI * .8, Math.PI * .2); ctx.lineTo(bx + 14 * u, by - 95 * u);
      ctx.quadraticCurveTo(bx + 34 * u, by - 60 * u, bx + 30 * u, by); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.shadowColor = '#7dd3fc'; ctx.shadowBlur = W * .06; ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.arc(bx, by - 85 * u, 4 * u, 0, 7); ctx.fill(); ctx.restore();
    }
  },
};
function bg2(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
export function paint(canvas, W, H, opts) {
  cv = canvas; canvas.width = W; canvas.height = H; ctx = canvas.getContext('2d'); O = opts; R = rng(opts.seed);
  const p = opts.pal.slice(); if (opts.amoled && opts.cat !== 'Text') p[2] = '#000';
  draw[opts.cat](W, H, p);
  if (opts.amoled && !['Dark', 'Text', 'Island'].includes(opts.cat)) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); }
}
export { DEVICES, CATS, PALS, HERO_PALS };
