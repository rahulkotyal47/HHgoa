import { useCallback, useEffect, useRef, useState } from 'react';
import { builderTitle, randomBuilderTitle } from '@/lib/builderTitle';

export type Format = 'frame' | 'card' | 'team';
export type CardStyle = 'classic' | 'sunset' | 'mono';

interface Win { x: number; y: number; w: number; h: number; shape: 'circle' | 'rrect'; radius?: number; }

const WINDOWS: Record<Format, Win> = {
  frame: { x: 190, y: 150, w: 700, h: 700, shape: 'circle' },
  card: { x: 165, y: 150, w: 750, h: 750, shape: 'rrect', radius: 26 },
  team: { x: 165, y: 150, w: 750, h: 750, shape: 'rrect', radius: 26 },
};

const COLORS = {
  ink: '#070f0c',
  paper: '#f3f4ea',
  emerald: '#22a866',
  emeraldDeep: '#0f5c39',
  lime: '#cdf24f',
  clay: '#e7c383',
  palm: '#0c2116',
};

export const CARD_STYLES: { id: CardStyle; label: string; accent: string; accentDeep: string }[] = [
  { id: 'classic', label: 'Classic', accent: COLORS.lime, accentDeep: COLORS.emerald },
  { id: 'sunset', label: 'Sunset', accent: COLORS.clay, accentDeep: '#c98a4b' },
  { id: 'mono', label: 'Mono', accent: COLORS.paper, accentDeep: '#9aa79c' },
];

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function arcText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, radius: number, startAngle: number, spreadAngle: number, font: string, color: string) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
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
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, accentHex: string = COLORS.lime, deepHex: string = COLORS.emerald) {
  const deepRgb = hexToRgb(deepHex);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#070f0c');
  g.addColorStop(0.42, '#0e2118');
  g.addColorStop(0.7, `rgba(${deepRgb},0.35)`);
  g.addColorStop(0.88, deepHex);
  g.addColorStop(1, accentHex);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const glowR = w * 0.32;
  const accentRgb = hexToRgb(accentHex);
  const sg = ctx.createRadialGradient(w / 2, h * 0.87, 0, w / 2, h * 0.87, glowR);
  sg.addColorStop(0, `rgba(${accentRgb},0.85)`);
  sg.addColorStop(1, `rgba(${accentRgb},0)`);
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(w / 2, h * 0.87, glowR, 0, Math.PI * 2); ctx.fill();

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
  ctx.save();
  ctx.font = "700 30px 'JetBrains Mono', monospace";
  ctx.fillStyle = accent;
  ctx.textAlign = 'left';
  ctx.fillText('HH GOA 2026', 60, 90);
  ctx.font = "500 20px 'JetBrains Mono', monospace";
  ctx.fillStyle = 'rgba(243,244,234,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText(opts.kicker, w - 60, 90);
  ctx.restore();

  ctx.save();
  ctx.translate(w - 110, 170);
  ctx.rotate(-0.18);
  ctx.beginPath();
  ctx.setLineDash([4, 6]);
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${hexToRgb(accent)},0.7)`;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "700 13px 'JetBrains Mono', monospace";
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.fillText('VERIFIED', 0, -4);
  ctx.fillText(opts.badgeLine2, 0, 12);
  ctx.restore();

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
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();
    ctx.font = "400 20px 'JetBrains Mono', monospace";
    ctx.fillStyle = 'rgba(243,244,234,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText(opts.uploadPlaceholder, winRect.x + winRect.w / 2, winRect.y + winRect.h / 2);
    ctx.restore();
  }
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 0);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(7,15,12,0.7)';
  ctx.stroke();
  ctx.restore();

  const displayName = name || opts.namePlaceholder;
  ctx.save();
  ctx.font = "700 68px 'Bebas Neue', sans-serif";
  ctx.fillStyle = COLORS.paper;
  ctx.textAlign = 'center';
  ctx.fillText(displayName.toUpperCase(), w / 2, 1010);
  ctx.restore();

  const displayRole = role || opts.rolePlaceholder;
  ctx.save();
  ctx.font = "500 26px 'JetBrains Mono', monospace";
  ctx.fillStyle = 'rgba(243,244,234,0.85)';
  ctx.textAlign = 'center';
  ctx.fillText('> ' + displayRole, w / 2, 1050);
  ctx.restore();

  ctx.save();
  ctx.font = "700 24px 'JetBrains Mono', monospace";
  const label = '⚡ ' + tag.toUpperCase();
  const tw = ctx.measureText(label).width + 56;
  const px = w / 2 - tw / 2, py = 1090, ph = 54;
  ctx.beginPath();
  roundRectPath(ctx, px, py, tw, ph, ph / 2);
  const pg = ctx.createLinearGradient(px, 0, px + tw, 0);
  pg.addColorStop(0, accentDeep); pg.addColorStop(1, accent);
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, py + ph / 2 + 2);
  ctx.restore();

  ctx.save();
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = 'rgba(243,244,234,0.3)';
  ctx.beginPath(); ctx.moveTo(50, 1180); ctx.lineTo(w - 50, 1180); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  ctx.font = "500 20px 'JetBrains Mono', monospace";
  ctx.fillStyle = 'rgba(243,244,234,0.7)';
  ctx.textAlign = 'left';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026', 60, 1230);
  ctx.fillStyle = accent;
  ctx.textAlign = 'right';
  ctx.fillText('#FrameInGoa', w - 60, 1230);
  ctx.restore();

  drawPalm(ctx, 70, h - 60, 0.75, 'rgba(12,33,22,0.85)');
  drawPalm(ctx, w - 70, h - 60, -0.75, 'rgba(12,33,22,0.85)');
}

export function useFrameGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [format, setFormatState] = useState<Format>('frame');
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

  const win = useCallback((): Win => WINDOWS[format], [format]);

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
    const activeStyle = format === 'card'
      ? (CARD_STYLES.find((s) => s.id === cardStyle) || CARD_STYLES[0])
      : { accent: COLORS.lime, accentDeep: COLORS.emerald };

    drawBackground(ctx, w, h, activeStyle.accent, activeStyle.accentDeep);

    const drawPhoto = () => {
      if (!img) return;
      ctx.save();
      ctx.beginPath();
      if (winRect.shape === 'circle') {
        const r = Math.min(winRect.w, winRect.h) / 2;
        ctx.arc(winRect.x + winRect.w / 2, winRect.y + winRect.h / 2, r, 0, Math.PI * 2);
      } else {
        roundRectPath(ctx, winRect.x, winRect.y, winRect.w, winRect.h, winRect.radius || 0);
      }
      ctx.clip();
      ctx.drawImage(img, geo.current.offX, geo.current.offY, img.width * geo.current.scale, img.height * geo.current.scale);
      ctx.restore();
    };

    if (format === 'frame') {
      drawPalm(ctx, 70, h - 40, 1.0, 'rgba(12,33,22,0.9)');
      drawPalm(ctx, w - 70, h - 40, -1.0, 'rgba(12,33,22,0.9)');

      const cx = w / 2, cy = 500, r = 360;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r + 22, 0, Math.PI * 2);
      if ((ctx as any).createConicGradient) {
        const cg = (ctx as any).createConicGradient(-Math.PI / 2, cx, cy);
        cg.addColorStop(0, COLORS.lime);
        cg.addColorStop(0.33, COLORS.emerald);
        cg.addColorStop(0.66, COLORS.emeraldDeep);
        cg.addColorStop(1, COLORS.lime);
        ctx.strokeStyle = cg;
      } else {
        ctx.strokeStyle = COLORS.emerald;
      }
      ctx.lineWidth = 22;
      ctx.stroke();
      ctx.restore();

      drawPhoto();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = COLORS.ink;
      ctx.stroke();
      ctx.restore();

      if (!img) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill();
        ctx.restore();
      }

      arcText(ctx, 'HH GOA 2026', cx, cy, r + 70, Math.PI / 2, Math.PI * 0.62, "700 40px 'Bebas Neue', sans-serif", COLORS.paper);

      ctx.save();
      ctx.font = "500 24px 'JetBrains Mono', monospace";
      ctx.fillStyle = COLORS.lime;
      ctx.textAlign = 'center';
      ctx.fillText('▍ GOA · 28–31 OCT', cx, 66);
      ctx.restore();

      ctx.save();
      ctx.font = "400 20px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(243,244,234,0.55)';
      ctx.textAlign = 'right';
      ctx.fillText('2:47 PM STUDIO', w - 40, h - 40);
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
        accent: COLORS.lime,
        accentDeep: COLORS.emerald,
      });
    }
  }, [format, name, role, win, titleOverride, cardStyle]);

  useEffect(() => { render(); }, [render]);

  const randomizeTitle = useCallback(() => {
    setTitleOverride((current) => randomBuilderTitle(current ?? builderTitle(name, role)));
  }, [name, role]);

  const setFormat = useCallback((fmt: Format) => {
    setFormatState(fmt);
    const canvas = canvasRef.current;
    if (canvas) { canvas.width = 1080; canvas.height = fmt === 'frame' ? 1080 : 1350; }
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
        ? "Locked in for HH GOA 2026 \ud83c\udf34\u2600\ufe0f Here's my #FrameInGoa \u2014 28\u201331 Oct, Goa, India."
        : format === 'team'
        ? "Our team pass for HH GOA 2026 is live \ud83e\udd1d #FrameInGoa \u2014 see you on the sand, 28\u201331 Oct."
        : "My HH GOA 2026 boarding pass is live \u26a1 #FrameInGoa \u2014 see you on the sand, 28\u201331 Oct.";
      const intent = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(caption);
      window.open(intent, '_blank');
      setStatus({ msg: 'Graphic downloaded + X compose opened \u2014 attach the image, then post.', kind: 'ok' });
    }, 'image/png');
  }, [filename, format]);

  return {
    canvasRef, format, setFormat, hasImage, zoom, applyZoom, onWheel,
    name, setName, role, setRole, status, dragging,
    loadFile, onPointerDown, onPointerMove, onPointerUp, download, share,
    builderTitlePreview: titleOverride || builderTitle(name, role),
    randomizeTitle,
    cardStyle, setCardStyle,
    cameraOpen, cameraReady, cameraError, videoRef, openCamera, closeCamera, capturePhoto,
  };
}
