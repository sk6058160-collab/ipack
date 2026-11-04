// Original, generic glyphs (no brand logos) drawn in a 100x100 space.
const G = {
  Phone: c => { c.moveTo(30, 22); c.quadraticCurveTo(22, 26, 24, 38); c.quadraticCurveTo(32, 62, 58, 76); c.quadraticCurveTo(72, 80, 76, 70); c.lineTo(66, 60); c.lineTo(58, 66); c.quadraticCurveTo(44, 58, 36, 44); c.lineTo(42, 36); c.closePath(); },
  Messages: c => { c.ellipse(50, 46, 30, 23, 0, 0, 7); c.moveTo(30, 62); c.lineTo(24, 76); c.lineTo(40, 67); },
  Camera: c => { c.roundRect(20, 34, 60, 42, 8); c.moveTo(38, 34); c.lineTo(42, 26); c.lineTo(58, 26); c.lineTo(62, 34); c.moveTo(63, 55); c.arc(50, 55, 13, 0, 7); },
  Photos: c => { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.moveTo(50 + Math.cos(a) * 26, 50 + Math.sin(a) * 26); c.ellipse(50 + Math.cos(a) * 14, 50 + Math.sin(a) * 14, 13, 8, a, 0, 7); } },
  Maps: c => { c.moveTo(50, 80); c.quadraticCurveTo(26, 52, 26, 40); c.arc(50, 40, 24, Math.PI, 0); c.quadraticCurveTo(74, 52, 50, 80); c.moveTo(59, 40); c.arc(50, 40, 9, 0, 7); },
  Music: c => { c.moveTo(40, 68); c.lineTo(40, 28); c.lineTo(70, 22); c.lineTo(70, 62); c.moveTo(40, 36); c.lineTo(70, 30); c.moveTo(42, 68); c.ellipse(34, 68, 8, 6, 0, 0, 7); c.moveTo(72, 62); c.ellipse(64, 62, 8, 6, 0, 0, 7); },
  Mail: c => { c.roundRect(20, 30, 60, 42, 6); c.moveTo(22, 33); c.lineTo(50, 54); c.lineTo(78, 33); },
  Settings: c => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(50 + Math.cos(a) * 20, 50 + Math.sin(a) * 20); c.lineTo(50 + Math.cos(a) * 29, 50 + Math.sin(a) * 29); } c.moveTo(70, 50); c.arc(50, 50, 20, 0, 7); c.moveTo(58, 50); c.arc(50, 50, 8, 0, 7); },
  Browser: c => { c.arc(50, 50, 29, 0, 7); c.moveTo(62, 38); c.lineTo(54, 54); c.lineTo(38, 62); c.lineTo(46, 46); c.closePath(); },
  Clock: c => { c.arc(50, 50, 29, 0, 7); c.moveTo(50, 32); c.lineTo(50, 50); c.lineTo(63, 58); },
  Weather: c => { c.moveTo(52, 34); c.arc(44, 34, 8, 0, 7); c.moveTo(30, 68); c.arc(36, 60, 10, Math.PI * .6, Math.PI * 1.5); c.arc(54, 52, 16, Math.PI * 1.1, Math.PI * 1.95); c.arc(68, 62, 9, -Math.PI / 2, Math.PI / 2); c.closePath(); },
  Calendar: c => { c.roundRect(22, 26, 56, 52, 8); c.moveTo(22, 40); c.lineTo(78, 40); c.moveTo(36, 20); c.lineTo(36, 30); c.moveTo(64, 20); c.lineTo(64, 30); c.moveTo(36, 54); c.lineTo(44, 54); c.moveTo(56, 54); c.lineTo(64, 54); c.moveTo(36, 66); c.lineTo(44, 66); },
  Notes: c => { c.roundRect(26, 20, 48, 60, 6); c.moveTo(34, 36); c.lineTo(66, 36); c.moveTo(34, 48); c.lineTo(66, 48); c.moveTo(34, 60); c.lineTo(54, 60); },
  Wallet: c => { c.roundRect(20, 32, 60, 44, 8); c.moveTo(24, 32); c.lineTo(60, 22); c.lineTo(64, 32); c.moveTo(80, 48); c.lineTo(64, 48); c.arc(64, 54, 6, -Math.PI / 2, Math.PI / 2, true); c.lineTo(80, 60); },
  Taxi: c => { c.moveTo(20, 66); c.lineTo(20, 52); c.lineTo(30, 38); c.lineTo(70, 38); c.lineTo(80, 52); c.lineTo(80, 66); c.closePath(); c.moveTo(42, 38); c.lineTo(42, 30); c.lineTo(58, 30); c.lineTo(58, 38); c.moveTo(38, 70); c.arc(32, 70, 6, 0, 7); c.moveTo(74, 70); c.arc(68, 70, 6, 0, 7); c.moveTo(22, 52); c.lineTo(78, 52); },
  Store: c => { c.moveTo(26, 36); c.lineTo(74, 36); c.lineTo(70, 78); c.lineTo(30, 78); c.closePath(); c.moveTo(40, 42); c.lineTo(40, 30); c.arc(50, 30, 10, Math.PI, 0); c.lineTo(60, 42); },
  Video: c => { c.roundRect(18, 32, 46, 36, 8); c.moveTo(64, 46); c.lineTo(82, 36); c.lineTo(82, 64); c.lineTo(64, 54); },
  Files: c => { c.moveTo(20, 30); c.lineTo(40, 30); c.lineTo(46, 36); c.lineTo(80, 36); c.lineTo(80, 72); c.lineTo(20, 72); c.closePath(); },
};
export const GLYPHS = Object.keys(G);
export const ICON_STYLES = ['Glass', 'Neon', 'Line', 'Gradient', 'AMOLED'];
const hex = (h, a = 1) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; };
export function drawIcon(canvas, name, style, pal, S = 1024) {
  canvas.width = canvas.height = S; const c = canvas.getContext('2d'), k = S / 100;
  c.clearRect(0, 0, S, S); c.save(); c.beginPath(); c.roundRect(0, 0, S, S, S * .225); c.clip();
  const lg = (a, b) => { const g = c.createLinearGradient(0, 0, S, S); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  let stroke = '#fff', glow = 0, fill = null;
  if (style === 'Glass') { c.fillStyle = lg(pal[0], pal[1]); c.fillRect(0, 0, S, S); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.roundRect(S * .08, S * .08, S * .84, S * .84, S * .18); c.fill();
    const h = c.createLinearGradient(0, 0, 0, S * .5); h.addColorStop(0, 'rgba(255,255,255,.45)'); h.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = h; c.fillRect(0, 0, S, S * .5); }
  else if (style === 'Neon') { c.fillStyle = '#07070c'; c.fillRect(0, 0, S, S); stroke = pal[1]; glow = S * .05; }
  else if (style === 'Line') { c.fillStyle = '#f4f4f7'; c.fillRect(0, 0, S, S); stroke = '#1c1c22'; }
  else if (style === 'Gradient') { c.fillStyle = lg(pal[0], pal[2]); c.fillRect(0, 0, S, S); }
  else { c.fillStyle = '#000'; c.fillRect(0, 0, S, S); stroke = pal[0]; }
  c.scale(k, k); c.beginPath(); G[name](c); c.lineWidth = 5; c.lineCap = c.lineJoin = 'round'; c.strokeStyle = stroke;
  if (glow) { c.shadowColor = stroke; c.shadowBlur = glow; c.stroke(); c.shadowBlur = glow / 2; } c.stroke(); c.restore();
}
