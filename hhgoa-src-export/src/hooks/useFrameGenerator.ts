import { useCallback, useEffect, useRef, useState } from 'react';
import { builderTitle, randomBuilderTitle } from '@/lib/builderTitle';

export type Format = 'frame' | 'card' | 'team';
export type CardStyle = 'classic' | 'sunset' | 'mono';
export type FrameShape = 'circle' | 'squircle' | 'hexagon' | 'octagon' | 'badge';
export type FrameColor = 'lime' | 'emerald' | 'sunset' | 'cyber' | 'neonpink';

interface Win { x: number; y: number; w: number; h: number; shape: FrameShape; radius?: number; }

const WINDOWS: Record<Format, Win> = {
  frame: { x: 190, y: 190, w: 700, h: 700, shape: 'circle' },
  card: { x: 165, y: 150, w: 750, h: 750, shape: 'squircle', radius: 26 },
  team: { x: 165, y: 150, w: 750, h: 750, shape: 'squircle', radius: 26 },
};

const COLORS = {
  ink: '#070f0c',
  paper: '#ffffff',
  emerald: '#22a866',
  emeraldDeep: '#0f5c39',
  lime: '#cdf24f',
  clay: '#e7c383',
  palm: '#0c2116',
  neonpink: '#ff2a85',
  cyberGold: '#ffb800',
};

export const FRAME_SHAPES: { id: FrameShape; label: string; icon: string }[] = [
  { id: 'circle', label: 'Circle', icon: '◯' },
  { id: 'squircle', label: 'Squircle', icon: '▢' },
  { id: 'hexagon', label: 'Hexagon', icon: '⬡' },
  { id: 'octagon', label: 'Octagon', icon: '🛑' },
  { id: 'badge', label: 'Badge', icon: '🛡️' },
];

export const FRAME_COLORS: { id: FrameColor; label: string; primary: string; secondary: string }[] = [
  { id: 'lime', label: 'Goa Lime', primary: COLORS.lime, secondary: COLORS.emerald },
  { id: 'emerald', label: 'Deep Ocean', primary: COLORS.emerald, secondary: '#053d24' },
  { id: 'sunset', label: 'Goa Sunset', primary: COLORS.clay, secondary: '#c98a4b' },
  { id: 'cyber', label: 'Cyber Gold', primary: COLORS.cyberGold, secondary: '#d47a00' },
  { id: 'neonpink', label: 'Neon Pink', primary: COLORS.neonpink, secondary: '#9e0047' },
];

export const FRAME_BADGES = [
  'BUILD IN GOA',
  'SHIPPER',
  'HH GOA 2026',
  'FOUNDER',
  'HACKER',
  '2:47 PM STUDIO',
];

export const CARD_STYLES: { id: CardStyle; label: string; accent: string; accentDeep: string }[] = [
  { id: 'classic', label: 'Classic', accent: COLORS.lime, accentDeep: COLORS.emerald },
  { id: 'sunset', label: 'Sunset', accent: COLORS.clay, accentDeep: '#c98a4b' },
  { id: 'mono', label: 'Mono', accent: COLORS.paper, accentDeep: '#9aa79c' },
];

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexagonPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function octagonPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function badgePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  const w = r * 1.8;
  const h = r * 1.9;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const rad = 24;
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h * 0.7);
  ctx.quadraticCurveTo(x + w, y + h, cx, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h * 0.7);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function drawCustomShapePath(ctx: CanvasRenderingContext2D, shape: FrameShape, x: number, y: number, w: number, h: number, radius = 26) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2;
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (shape === 'hexagon') {
    hexagonPath(ctx, cx, cy, r);
  } else if (shape === 'octagon') {
    octagonPath(ctx, cx, cy, r);
  } else if (shape === 'badge') {
    badgePath(ctx, cx, cy, r);
  } else {
    roundRectPath(ctx, x, y, w, h, radius);
  }
}

function arcText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, radius: number, startAngle: number, spreadAngle: number, font: string, color: string) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  const widths: number[] = [];
  let totalW = 0;
  for (const ch of text) { const w = ctx.measureText(ch).width; widths.push(w); totalW += w; }
  let angle = startAngle - spreadAngle / 2;
  for (let i = 0; i < text.length; i++) {
    const chAngle = (widths[i] / totalW) * spreadAngle;
    const mid = angle + chAngle / 2;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(mid), cy + radius * Math.sin(mid));
    ctx.rotate(mid + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
    angle += chAngle;
  }
  ctx.restore();
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.quadraticCurveTo(-6, -30, 2, -58);
  ctx.stroke();
  const fronds: [number, number, number, number, number, number][] = [
    [-2, -58, -46, -78, -70, -64], [-2, -58, -40, -40, -66, -30], [-2, -58, -2, -92, -2, -104],
    [-2, -58, 40, -78, 66, -66], [-2, -58, 36, -40, 62, -30],
  ];
  fronds.forEach(f => {
    ctx.beginPath();
    ctx.moveTo(f[0], f[1]);
    ctx.quadraticCurveTo(f[2], f[3], f[4], f[5]);
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
  });
  ctx.restore();
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, accentHex: string = COLORS.lime, deepHex: string = COLORS.emerald) {
  const deepRgb = hexToRgb(deepHex);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#040b08');
  g.addColorStop(0.4, '#0a1a12');
  g.addColorStop(0.7, `rgba(${deepRgb},0.4)`);
  g.addColorStop(0.9, deepHex);
  g.addColorStop(1, accentHex);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const glowR = w * 0.4;
  const accentRgb = hexToRgb(accentHex);
  const sg = ctx.createRadialGradient(w / 2, h * 0.85, 0, w / 2, h * 0.85, glowR);
  sg.addColorStop(0, `rgba(${accentRgb},0.75)`);
  sg.addColorStop(1, `rgba(${accentRgb},0)`);
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(w / 2, h * 0.85, glowR, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.strokeStyle = COLORS.paper;
  for (let yy = 0; yy < h; yy += 6) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke(); }
  ctx.restore();
}

interface PassOpts {
  kicker: string;
  badgeLine2: string;
  namePlaceholder: string;
  rolePlaceholder: string;
  uploadPlaceholder: string;
  accent: string;
  accentDeep: string;
}

function drawPassCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  winRect: Win,
  img: HTMLImageElement | null,
  geo: { scale: number; offX: number; offY: number },
  name: string,
  role: string,
  tag: string,
  opts: PassOpts,
) {
  const { accent, accentDeep } = opts;

  // Background card outline / container plate for high contrast
  ctx.save();
  const cardPad = 30;
  const cardW = w - cardPad * 2;
  const cardH = h - cardPad * 2;
  roundRectPath(ctx, cardPad, cardPad, cardW, cardH, 20);
  ctx.fillStyle = 'rgba(7, 15, 12, 0.45)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(${hexToRgb(accent)}, 0.25)`;
  ctx.stroke();
  ctx.restore();

  // Header Banner Pill for 100% visible header text
  ctx.save();
  roundRectPath(ctx, 45, 45, w - 90, 70, 12);
  ctx.fillStyle = 'rgba(4, 11, 8, 0.85)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(${hexToRgb(accent)}, 0.4)`;
  ctx.stroke();

  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.fillStyle = accent;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;
  ctx.fillText('HH GOA 2026', 70, 88);

  ctx.font = "700 18px 'JetBrains Mono', monospace";
  ctx.fillStyle = COLORS.paper;
  ctx.textAlign = 'right';
  ctx.fillText(opts.kicker, w - 70, 88);
  ctx.restore();

  // Stamp Badge
  ctx.save();
  ctx.translate(w - 110, 175);
  ctx.rotate(-0.18);
  ctx.beginPath();
  ctx.setLineDash([4, 6]);
  ctx.arc(0, 0, 56, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(7, 15, 12, 0.8)';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "700 13px 'JetBrains Mono', monospace";
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.fillText('VERIFIED', 0, -4);
  ctx.fillText(opts.badgeLine2, 0, 12);
  ctx.restore();

  // Photo Frame Corners
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  const b = 26, pad = 14;
  const bx = winRect.x - pad, by = winRect.y - pad, bw = winRect.w + pad * 2, bh = winRect.h + pad * 2;
  ([[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]] as [number, number, number, number][]).forEach(([px, py, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(px, py + b * dy);
    ctx.lineTo(px, py);
    ctx.lineTo(px + b * dx, py);
    ctx.stroke();
  });
  ctx.restore();

  // Photo
  if (img) {
    ctx.save();
    ctx.beginPath();
    roundRectPath(ctx, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 0);
    ctx.clip();
    ctx.drawImage(img, geo.offX, geo.offY, img.width * geo.scale, img.height * geo.scale);
    ctx.restore();
  } else {
    ctx.save();
    ctx.beginPath();
    roundRectPath(ctx, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 0);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.font = "600 20px 'JetBrains Mono', monospace";
    ctx.fillStyle = 'rgba(243,244,234,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(opts.uploadPlaceholder, winRect.x + winRect.w / 2, winRect.y + winRect.h / 2);
    ctx.restore();
  }

  // Photo Inner Border
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 0);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(7,15,12,0.8)';
  ctx.stroke();
  ctx.restore();

  // Info Backplate for 100% High Contrast Text Visibility
  ctx.save();
  const infoX = 55;
  const infoY = 945;
  const infoW = w - 110;
  const infoH = 205;
  roundRectPath(ctx, infoX, infoY, infoW, infoH, 16);
  ctx.fillStyle = 'rgba(7, 15, 12, 0.88)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(${hexToRgb(accent)}, 0.35)`;
  ctx.stroke();
  ctx.restore();

  // Name
  const displayName = name || opts.namePlaceholder;
  ctx.save();
  ctx.font = "700 64px 'Bebas Neue', sans-serif";
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillText(displayName.toUpperCase(), w / 2, 1005);
  ctx.restore();

  // Role / Stack
  const displayRole = role || opts.rolePlaceholder;
  ctx.save();
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;
  ctx.fillText('> ' + displayRole, w / 2, 1045);
  ctx.restore();

  // Tag Badge
  ctx.save();
  ctx.font = "700 22px 'JetBrains Mono', monospace";
  const label = '⚡ ' + tag.toUpperCase();
  const tw = ctx.measureText(label).width + 56;
  const px = w / 2 - tw / 2, py = 1080, ph = 50;
  ctx.beginPath();
  roundRectPath(ctx, px, py, tw, ph, ph / 2);
  const pg = ctx.createLinearGradient(px, 0, px + tw, 0);
  pg.addColorStop(0, accentDeep); pg.addColorStop(1, accent);
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, py + ph / 2 + 1);
  ctx.restore();

  // Dotted Line
  ctx.save();
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = 'rgba(243,244,234,0.35)';
  ctx.beginPath(); ctx.moveTo(50, 1175); ctx.lineTo(w - 50, 1175); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Footer Banner Pill for 100% Readability
  ctx.save();
  roundRectPath(ctx, 45, 1192, w - 90, 56, 12);
  ctx.fillStyle = 'rgba(4, 11, 8, 0.9)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(${hexToRgb(accent)}, 0.4)`;
  ctx.stroke();

  ctx.font = "600 19px 'JetBrains Mono', monospace";
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026', 65, 1227);
  ctx.fillStyle = accent;
  ctx.textAlign = 'right';
  ctx.fillText('#FrameInGoa', w - 65, 1227);
  ctx.restore();

  drawPalm(ctx, 70, h - 60, 0.75, 'rgba(12,33,22,0.85)');
  drawPalm(ctx, w - 70, h - 60, -0.75, 'rgba(12,33,22,0.85)');
}

export function useFrameGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [format, setFormatState] = useState<Format>('frame');
  const [frameShape, setFrameShape] = useState<FrameShape>('circle');
  const [frameColor, setFrameColor] = useState<FrameColor>('lime');
  const [frameBadge, setFrameBadge] = useState<string>('BUILD IN GOA');
  const [hasImage, setHasImage] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<{ msg: string; kind?: 'ok' | 'err' }>({ msg: '' });
  const [dragging, setDragging] = useState(false);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [cardStyle, setCardStyle] = useState<CardStyle>('classic');

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const geo = useRef({ baseScale: 1, scale: 1, offX: 0, offY: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });

  const win = useCallback((): Win => {
    const base = WINDOWS[format];
    if (format === 'frame') {
      return { ...base, shape: frameShape };
    }
    return base;
  }, [format, frameShape]);

  const fitImage = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const w = win();
    const s = Math.max(w.w / img.width, w.h / img.height);
    geo.current.baseScale = s;
    geo.current.scale = s;
    const sw = img.width * s, sh = img.height * s;
    geo.current.offX = w.x + (w.w - sw) / 2;
    geo.current.offY = w.y + (w.h - sh) / 2;
  }, [win]);

  const clamp = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const w = win();
    const sw = img.width * geo.current.scale, sh = img.height * geo.current.scale;
    const minX = w.x + w.w - sw, maxX = w.x;
    const minY = w.y + w.h - sh, maxY = w.y;
    geo.current.offX = Math.min(maxX, Math.max(minX, geo.current.offX));
    geo.current.offY = Math.min(maxY, Math.max(minY, geo.current.offY));
  }, [win]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imgRef.current;
    const w = canvas.width, h = canvas.height;
    const winRect = win();

    const activeFrameColor = FRAME_COLORS.find(c => c.id === frameColor) || FRAME_COLORS[0];
    const activeStyle = format === 'card'
      ? (CARD_STYLES.find((s) => s.id === cardStyle) || CARD_STYLES[0])
      : { accent: activeFrameColor.primary, accentDeep: activeFrameColor.secondary };

    drawBackground(ctx, w, h, activeStyle.accent, activeStyle.accentDeep);

    const drawPhoto = () => {
      if (!img) return;
      ctx.save();
      drawCustomShapePath(ctx, winRect.shape, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 26);
      ctx.clip();
      ctx.drawImage(img, geo.current.offX, geo.current.offY, img.width * geo.current.scale, img.height * geo.current.scale);
      ctx.restore();
    };

    if (format === 'frame') {
      // PFP Frame 1080 x 1080 px layout
      drawPalm(ctx, 70, h - 40, 1.0, 'rgba(12,33,22,0.9)');
      drawPalm(ctx, w - 70, h - 40, -1.0, 'rgba(12,33,22,0.9)');

      const cx = w / 2, cy = h / 2, r = winRect.w / 2;

      // Outer Glow & Border Accent Ring
      ctx.save();
      drawCustomShapePath(ctx, winRect.shape, winRect.x - 18, winRect.y - 18, winRect.w + 36, winRect.h + 36, (winRect.radius || 26) + 18);
      ctx.lineWidth = 18;
      const strokeGrad = ctx.createLinearGradient(0, 0, w, h);
      strokeGrad.addColorStop(0, activeFrameColor.primary);
      strokeGrad.addColorStop(0.5, activeFrameColor.secondary);
      strokeGrad.addColorStop(1, activeFrameColor.primary);
      ctx.strokeStyle = strokeGrad;
      ctx.shadowColor = activeFrameColor.primary;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.restore();

      // Draw user uploaded photo clipped to shape
      drawPhoto();

      // Shape Inner Frame Border
      ctx.save();
      drawCustomShapePath(ctx, winRect.shape, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 26);
      ctx.lineWidth = 6;
      ctx.strokeStyle = COLORS.ink;
      ctx.stroke();
      ctx.restore();

      if (!img) {
        ctx.save();
        drawCustomShapePath(ctx, winRect.shape, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 26);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
        ctx.font = "600 22px 'JetBrains Mono', monospace";
        ctx.fillStyle = 'rgba(243,244,234,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('upload a photo', cx, cy);
        ctx.restore();
      }

      // Curved Arc Text
      arcText(ctx, 'HH GOA 2026', cx, cy, r + 68, Math.PI / 2, Math.PI * 0.65, "700 42px 'Bebas Neue', sans-serif", COLORS.paper);

      // Top Header Pill
      ctx.save();
      roundRectPath(ctx, cx - 180, 24, 360, 46, 23);
      ctx.fillStyle = 'rgba(4, 11, 8, 0.85)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = activeFrameColor.primary;
      ctx.stroke();

      ctx.font = "700 20px 'JetBrains Mono', monospace";
      ctx.fillStyle = activeFrameColor.primary;
      ctx.textAlign = 'center';
      ctx.fillText('▍ GOA · 28–31 OCT 2026', cx, 53);
      ctx.restore();

      // Bottom Badge Pill
      ctx.save();
      const badgeStr = '⚡ ' + (frameBadge || 'BUILD IN GOA').toUpperCase();
      ctx.font = "700 20px 'JetBrains Mono', monospace";
      const bWidth = ctx.measureText(badgeStr).width + 48;
      roundRectPath(ctx, cx - bWidth / 2, h - 70, bWidth, 46, 23);
      const bGrad = ctx.createLinearGradient(cx - bWidth / 2, 0, cx + bWidth / 2, 0);
      bGrad.addColorStop(0, activeFrameColor.secondary);
      bGrad.addColorStop(1, activeFrameColor.primary);
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = COLORS.paper;
      ctx.stroke();

      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeStr, cx, h - 47);
      ctx.restore();

      // Bottom Right Studio Credit
      ctx.save();
      ctx.font = "500 17px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(243,244,234,0.7)';
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText('2:47 PM STUDIO', w - 30, h - 25);
      ctx.restore();

    } else if (format === 'card') {
      const title = titleOverride || builderTitle(name, role) || 'BUILDER';
      drawPassCard(ctx, w, h, winRect, img, geo.current, name, role, title, {
        kicker: 'BOARDING PASS',
        badgeLine2: 'BUILDER',
        namePlaceholder: 'YOUR NAME',
        rolePlaceholder: 'your stack / role',
        uploadPlaceholder: 'upload a photo',
        accent: activeStyle.accent,
        accentDeep: activeStyle.accentDeep,
      });
    } else {
      const title = titleOverride || builderTitle(name, role) || 'TEAM';
      drawPassCard(ctx, w, h, winRect, img, geo.current, name, role, title, {
        kicker: 'TEAM PASS',
        badgeLine2: 'TEAM',
        namePlaceholder: 'YOUR TEAM',
        rolePlaceholder: 'project · track',
        uploadPlaceholder: 'upload a team photo or logo',
        accent: activeStyle.accent,
        accentDeep: activeStyle.accentDeep,
      });
    }
  }, [format, name, role, win, titleOverride, cardStyle, frameShape, frameColor, frameBadge]);

  useEffect(() => { render(); }, [render]);

  const randomizeTitle = useCallback(() => {
    setTitleOverride((current) => randomBuilderTitle(current ?? builderTitle(name, role)));
  }, [name, role]);

  const setFormat = useCallback((fmt: Format) => {
    setFormatState(fmt);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 1080;
      canvas.height = fmt === 'frame' ? 1080 : 1350;
    }
    setZoom(0);
    if (imgRef.current) {
      requestAnimationFrame(() => { fitImage(); render(); });
    }
  }, [fitImage, render]);

  const loadImageSrc = useCallback((src: string, successMsg: string) => {
    setStatus({ msg: 'Loading photo…' });
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      fitImage();
      setZoom(0);
      setHasImage(true);
      setStatus({ msg: successMsg, kind: 'ok' });
      render();
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    };
    img.onerror = () => {
      setStatus({ msg: 'Could not decode that file. If it\'s a HEIC from iPhone, try Settings → Camera → Formats → "Most Compatible".', kind: 'err' });
    };
    img.src = src;
  }, [fitImage, render]);

  const loadFile = useCallback((file: File | undefined | null) => {
    if (!file) return;
    const okType = /image\/(jpeg|png|webp|heic|heif)/i.test(file.type) || /\.(jpe?g|png|heic|heif)$/i.test(file.name);
    if (!okType) { setStatus({ msg: 'Unsupported file type. Use JPG, PNG, or HEIC.', kind: 'err' }); return; }
    loadImageSrc(URL.createObjectURL(file), 'Photo loaded. Drag to reposition, scroll to zoom.');
  }, [loadImageSrc]);

  const openCamera = useCallback(async () => {
    setCameraError('');
    setCameraReady(false);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraError('Camera access denied or unavailable. Check your browser permissions.');
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
    setCameraOpen(false);
  }, []);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const cctx = c.getContext('2d');
    if (!cctx) return;
    cctx.translate(c.width, 0);
    cctx.scale(-1, 1);
    cctx.drawImage(video, 0, 0, c.width, c.height);
    loadImageSrc(c.toDataURL('image/png'), 'Photo captured. Drag to reposition, scroll to zoom.');
    closeCamera();
  }, [cameraReady, loadImageSrc, closeCamera]);

  const canvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  }, []);

  const onPointerDown = useCallback((clientX: number, clientY: number) => {
    if (!imgRef.current) return;
    const p = canvasPoint(clientX, clientY);
    lastPointer.current = p;
    setDragging(true);
  }, [canvasPoint]);

  const onPointerMove = useCallback((clientX: number, clientY: number) => {
    if (!imgRef.current || !dragging) return;
    const p = canvasPoint(clientX, clientY);
    geo.current.offX += (p.x - lastPointer.current.x);
    geo.current.offY += (p.y - lastPointer.current.y);
    lastPointer.current = p;
    clamp();
    render();
  }, [dragging, canvasPoint, clamp, render]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  const applyZoom = useCallback((val: number) => {
    setZoom(val);
    const img = imgRef.current;
    if (!img) return;
    const w = win();
    const t = val / 100;
    const maxScale = geo.current.baseScale * 3;
    const cx = w.x + w.w / 2, cy = w.y + w.h / 2;
    const imgCx = (cx - geo.current.offX) / geo.current.scale;
    const imgCy = (cy - geo.current.offY) / geo.current.scale;
    geo.current.scale = geo.current.baseScale + t * (maxScale - geo.current.baseScale);
    geo.current.offX = cx - imgCx * geo.current.scale;
    geo.current.offY = cy - imgCy * geo.current.scale;
    clamp();
    render();
  }, [win, clamp, render]);

  const onWheel = useCallback((deltaY: number) => {
    if (!imgRef.current) return;
    const delta = deltaY > 0 ? -4 : 4;
    applyZoom(Math.min(100, Math.max(0, zoom + delta)));
  }, [applyZoom, zoom]);

  const filename = useCallback(() => {
    if (format === 'frame') return 'hhgoa-2026-frame.png';
    if (format === 'team') return 'hhgoa-2026-team-pass.png';
    return 'hhgoa-2026-boarding-pass.png';
  }, [format]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename();
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setStatus({ msg: `Downloaded ${filename()}.`, kind: 'ok' });
    }, 'image/png');
  }, [filename]);

  const share = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename();
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);

      const caption = format === 'frame'
        ? "Locked in for HH GOA 2026 🌴☀️ Here's my #FrameInGoa — 28–31 Oct, Goa, India."
        : format === 'team'
        ? "Our team pass for HH GOA 2026 is live 🤝 #FrameInGoa — see you on the sand, 28–31 Oct."
        : "My HH GOA 2026 boarding pass is live ⚡ #FrameInGoa — see you on the sand, 28–31 Oct.";
      const intent = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(caption);
      window.open(intent, '_blank');
      setStatus({ msg: 'Graphic downloaded + X compose opened — attach the image, then post.', kind: 'ok' });
    }, 'image/png');
  }, [filename, format]);

  return {
    canvasRef, format, setFormat, hasImage, zoom, applyZoom, onWheel,
    name, setName, role, setRole, status, dragging,
    loadFile, onPointerDown, onPointerMove, onPointerUp, download, share,
    builderTitlePreview: titleOverride || builderTitle(name, role),
    randomizeTitle,
    cardStyle, setCardStyle,
    frameShape, setFrameShape,
    frameColor, setFrameColor,
    frameBadge, setFrameBadge,
    cameraOpen, cameraReady, cameraError, videoRef, openCamera, closeCamera, capturePhoto,
  };
}
