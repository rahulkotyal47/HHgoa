import { useRef, useState } from 'react';
import { useFrameGenerator, CARD_STYLES, FRAME_SHAPES, FRAME_COLORS, FRAME_BADGES } from '@/hooks/useFrameGenerator';
import { Reveal } from '@/components/Reveal';
import { Landing } from '@/components/Landing';

const FORMAT_LABELS = { frame: 'PFP FRAME', card: 'BOARDING PASS', team: 'TEAM PASS' } as const;

function StepNumber({ n }: { n: string }) {
  return (
    <span
      className="font-mono text-[11px] shrink-0 w-7 h-7 rounded-full grid place-items-center"
      style={{ background: 'rgba(205,242,79,0.1)', color: '#cdf24f', border: '1px solid rgba(205,242,79,0.35)' }}
    >
      {n}
    </span>
  );
}

export default function App() {
  const fg = useFrameGenerator();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [over, setOver] = useState(false);

  const handleMouse = (e: React.MouseEvent) => fg.onPointerMove(e.clientX, e.clientY);
  const handleMouseDown = (e: React.MouseEvent) => fg.onPointerDown(e.clientX, e.clientY);
  const handleTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; fg.onPointerDown(t.clientX, t.clientY); };
  const handleTouchMove = (e: React.TouchEvent) => { const t = e.touches[0]; fg.onPointerMove(t.clientX, t.clientY); };

  const isTeam = fg.format === 'team';
  const isFrame = fg.format === 'frame';
  const showPersonalize = fg.format === 'card' || fg.format === 'team';
  const steps = [
    'format',
    ...(isFrame ? ['frameStyle'] : []),
    ...(fg.format === 'card' ? ['design'] : []),
    'upload',
    ...(showPersonalize ? ['personalize'] : []),
    'download',
  ];
  const stepNum = (key: string) => String(steps.indexOf(key) + 1).padStart(2, '0');

  const canvasHeight = isFrame ? 1080 : 1350;

  return (
    <div
      className="min-h-screen"
      onMouseMove={handleMouse}
      onMouseUp={fg.onPointerUp}
    >
      {/* Fixed background hero that blurs on scroll */}
      <Landing />

      {/* Spacer: the hero image is visible through this transparent space */}
      <div style={{ height: '100vh', position: 'relative', zIndex: 1 }} />

      {/* Builder Studio section - transparent glass backdrop blur over hero */}
      <div
        id="builder"
        style={{
          position: 'relative',
          zIndex: 2,
          // Kept glassy but cheaper: the canvas repaints inside this element on
          // every drag frame, and each repaint re-runs the backdrop blur over it.
          background: 'rgba(7, 15, 12, 0.78)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderTop: '2px solid rgba(205,242,79,0.3)',
          minHeight: '100vh',
        }}
      >
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 pt-8 pb-16">
          {/* header */}
          <Reveal className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-[28px] tracking-wide">
                HH <span style={{ color: '#22a866' }}>GOA</span> 2026
              </span>
              <span className="font-mono text-[10px] tracking-wider" style={{ color: '#a9b8ab' }}>
                GOA, INDIA &middot; 28&ndash;31 OCT
              </span>
            </div>
            <div
              className="font-mono text-[11px] flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ border: '1px solid rgba(243,244,234,0.14)', color: '#cdf24f', background: 'rgba(0,0,0,0.3)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full blink" style={{ background: '#22a866' }} />
              2:47 PM STUDIO &mdash; IN SESSION
            </div>
          </Reveal>

          <Reveal delay={50}>
            <h1
              className="font-display leading-[0.92] mb-2"
              style={{ fontSize: 'clamp(38px,6.2vw,64px)' }}
            >
              Print your{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg,#22a866,#cdf24f)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                #FrameInGoa
              </span>{' '}
              graphic
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-[14.5px] max-w-[600px] mb-8" style={{ color: '#a9b8ab' }}>
              Upload a photo, get a branded HH Goa 2026 graphic in seconds &mdash; a custom 1:1 PFP frame, a
              high-visibility builder ID boarding pass, or a team pass. Drag to crop, zoom, download, and share.
            </p>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start">

            {/* ---------- ticket / preview ---------- */}
            <Reveal delay={150}>
              <div className="lg:sticky lg:top-6 flex flex-col items-center gap-4">
                <div
                  className="relative w-full max-w-[420px] rounded-sm p-[6px]"
                  style={{
                    background: 'linear-gradient(160deg, rgba(205,242,79,0.5), rgba(34,168,102,0.35) 40%, transparent 70%)',
                    transform: 'rotate(-0.4deg)',
                  }}
                >
                  <div
                    className="relative overflow-hidden rounded-sm ticket-notch"
                    style={{ '--notch-top': isFrame ? '95%' : '86%', boxShadow: '0 24px 70px rgba(0,0,0,0.6)' } as React.CSSProperties}
                  >
                    {!isFrame && (
                      <div
                        className="absolute left-0 right-0 z-[4] pointer-events-none"
                        style={{ top: '86%', borderTop: '2px dashed rgba(7,15,12,0.55)' }}
                      />
                    )}
                    <canvas
                      ref={fg.canvasRef}
                      width={1080}
                      height={canvasHeight}
                      className="block w-full h-auto"
                      style={{ cursor: fg.dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={fg.onPointerUp}
                      onWheel={(e) => { e.preventDefault(); fg.onWheel(e.deltaY); }}
                    />
                    {!fg.hasImage && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center font-mono text-[12px] pointer-events-none"
                        style={{ color: '#a9b8ab', background: 'rgba(7,15,12,0.3)' }}
                      >
                        <span>&#9611; waiting for photo upload</span>
                        <span>upload one to render the preview</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full max-w-[420px]">
                  <span className="font-mono text-[11px]" style={{ color: '#a9b8ab' }}>ZOOM</span>
                  <input
                    type="range" min={0} max={100} value={fg.zoom} disabled={!fg.hasImage}
                    onChange={(e) => fg.applyZoom(Number(e.target.value))}
                    className="flex-1 accent-[#22a866]"
                  />
                </div>
                <div className="font-mono text-[11px] opacity-75" style={{ color: '#a9b8ab' }}>
                  drag photo to reposition &middot; scroll or pinch to zoom
                </div>
              </div>
            </Reveal>

            {/* ---------- controls ---------- */}
            <div className="flex flex-col gap-4">

              {/* Step 1: Format Selection */}
              <Reveal delay={200} className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <StepNumber n={stepNum('format')} />
                  <span className="font-mono text-[11px] tracking-wide" style={{ color: '#a9b8ab' }}>CHOOSE FORMAT</span>
                </div>
                <div className="grid grid-cols-3 rounded-sm overflow-hidden" style={{ border: '1px solid rgba(243,244,234,0.14)' }}>
                  {(['frame', 'card', 'team'] as const).map((f, i) => (
                    <button
                      key={f}
                      onClick={() => fg.setFormat(f)}
                      className="py-3 px-1.5 font-mono text-[11px] tracking-wide transition-colors"
                      style={{
                        borderRight: i < 2 ? '1px solid rgba(243,244,234,0.14)' : 'none',
                        background: fg.format === f ? 'linear-gradient(90deg,#22a866,#cdf24f)' : 'transparent',
                        color: fg.format === f ? '#070f0c' : '#a9b8ab',
                        fontWeight: fg.format === f ? 700 : 400,
                      }}
                    >
                      {FORMAT_LABELS[f]}
                    </button>
                  ))}
                </div>
                <div className="font-mono text-[10.5px] mt-2.5 opacity-80" style={{ color: '#a9b8ab' }}>
                  {isFrame ? '📐 1080×1080 px (1:1 PFP Square)' : '📐 1080×1350 px (4:5 Boarding Pass)'}
                </div>
              </Reveal>

              {/* PFP Frame Customization Options */}
              {isFrame && (
                <Reveal delay={220} className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <StepNumber n={stepNum('frameStyle')} />
                    <span className="font-mono text-[11px] tracking-wide" style={{ color: '#a9b8ab' }}>FRAME CUSTOMIZATION</span>
                  </div>

                  {/* Frame Shape */}
                  <div className="mb-4">
                    <label className="block font-mono text-[10.5px] tracking-wide mb-2" style={{ color: '#a9b8ab' }}>
                      FRAME SHAPE
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {FRAME_SHAPES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => fg.setFrameShape(s.id)}
                          className="py-2.5 px-1 rounded-sm font-mono text-[10.5px] flex flex-col items-center gap-1 transition-all"
                          style={{
                            border: fg.frameShape === s.id ? '1.5px solid #cdf24f' : '1px solid rgba(243,244,234,0.14)',
                            background: fg.frameShape === s.id ? 'rgba(205,242,79,0.12)' : 'rgba(255,255,255,0.02)',
                            color: fg.frameShape === s.id ? '#cdf24f' : '#f3f4ea',
                          }}
                        >
                          <span className="text-[14px]">{s.icon}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frame Color Theme */}
                  <div className="mb-4">
                    <label className="block font-mono text-[10.5px] tracking-wide mb-2" style={{ color: '#a9b8ab' }}>
                      COLOR ACCENT
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {FRAME_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => fg.setFrameColor(c.id)}
                          className="py-2 px-1 rounded-sm font-mono text-[10px] flex flex-col items-center gap-1.5 transition-all"
                          style={{
                            border: fg.frameColor === c.id ? `1.5px solid ${c.primary}` : '1px solid rgba(243,244,234,0.14)',
                            background: fg.frameColor === c.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                          }}
                        >
                          <span
                            className="w-5 h-5 rounded-full"
                            style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
                          />
                          <span style={{ color: fg.frameColor === c.id ? c.primary : '#a9b8ab' }}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frame Badge Tag */}
                  <div>
                    <label className="block font-mono text-[10.5px] tracking-wide mb-2" style={{ color: '#a9b8ab' }}>
                      BADGE TAG
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {FRAME_BADGES.map((b) => (
                        <button
                          key={b}
                          onClick={() => fg.setFrameBadge(b)}
                          className="px-2.5 py-1 rounded-full font-mono text-[10px] transition-colors"
                          style={{
                            border: fg.frameBadge === b ? '1px solid #cdf24f' : '1px solid rgba(243,244,234,0.14)',
                            background: fg.frameBadge === b ? '#cdf24f' : 'transparent',
                            color: fg.frameBadge === b ? '#070f0c' : '#f3f4ea',
                            fontWeight: fg.frameBadge === b ? 700 : 400,
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      maxLength={24}
                      placeholder="Custom badge text..."
                      value={fg.frameBadge}
                      onChange={(e) => fg.setFrameBadge(e.target.value)}
                      className="w-full rounded-sm px-3 py-2 text-[13px] font-mono outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(243,244,234,0.14)', color: '#f3f4ea' }}
                    />
                  </div>
                </Reveal>
              )}

              {/* Boarding Pass Design Selector */}
              {fg.format === 'card' && (
                <Reveal delay={225} className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <StepNumber n={stepNum('design')} />
                    <span className="font-mono text-[11px] tracking-wide" style={{ color: '#a9b8ab' }}>DESIGN STYLES</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {CARD_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => fg.setCardStyle(s.id)}
                        className="rounded-sm p-2.5 flex flex-col items-center gap-2 transition-colors"
                        style={{
                          border: fg.cardStyle === s.id ? `1.5px solid ${s.accent}` : '1.5px solid rgba(243,244,234,0.14)',
                          background: fg.cardStyle === s.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                        }}
                      >
                        <span
                          className="w-full h-8 rounded-sm"
                          style={{ background: `linear-gradient(90deg, ${s.accentDeep}, ${s.accent})` }}
                        />
                        <span className="font-mono text-[10px] tracking-wide" style={{ color: fg.cardStyle === s.id ? s.accent : '#a9b8ab' }}>
                          {s.label.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </Reveal>
              )}

              {/* Step: Photo Upload */}
              <Reveal delay={250} className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <StepNumber n={stepNum('upload')} />
                  <span className="font-mono text-[11px] tracking-wide" style={{ color: '#a9b8ab' }}>{isTeam ? 'UPLOAD TEAM LOGO / PHOTO' : 'UPLOAD PHOTO'}</span>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setOver(false); }}
                  onDrop={(e) => { e.preventDefault(); setOver(false); fg.loadFile(e.dataTransfer.files[0]); }}
                  className="rounded-sm text-center py-7 px-4 cursor-pointer transition-colors"
                  style={{
                    border: `1.5px dashed ${over ? '#22a866' : 'rgba(243,244,234,0.18)'}`,
                    background: over ? 'rgba(34,168,102,0.08)' : 'transparent',
                  }}
                >
                  <div className="text-[24px] mb-1">&#128247;</div>
                  <div className="text-[14px] font-semibold">{isTeam ? 'Drop a team photo or logo, or tap to upload' : 'Drop a photo, or tap to upload'}</div>
                  <div className="font-mono text-[11px] mt-1" style={{ color: '#a9b8ab' }}>JPG &middot; PNG &middot; HEIC &mdash; any crop, any orientation</div>
                  <input
                    ref={fileInputRef} type="file" accept="image/*,.heic,.heif" className="hidden"
                    onChange={(e) => fg.loadFile(e.target.files?.[0])}
                  />
                </div>
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(243,244,234,0.14)' }} />
                  <span className="font-mono text-[10px]" style={{ color: '#a9b8ab' }}>OR</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(243,244,234,0.14)' }} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); fg.openCamera(); }}
                  className="w-full py-3 rounded-sm font-mono text-[12px] tracking-wide flex items-center justify-center gap-2 transition-colors"
                  style={{ border: '1px solid rgba(243,244,234,0.18)', color: '#f3f4ea', background: 'rgba(255,255,255,0.02)' }}
                >
                  &#128248; Take Photo
                </button>
              </Reveal>

              {/* Step: Personalization for Boarding Pass / Team Pass */}
              {showPersonalize && (
                <Reveal delay={300} className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <StepNumber n={stepNum('personalize')} />
                    <span className="font-mono text-[11px] tracking-wide" style={{ color: '#a9b8ab' }}>PERSONALIZE PASS</span>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    <div>
                      <label className="block font-mono text-[10.5px] tracking-wide mb-1.5" style={{ color: '#a9b8ab' }}>{isTeam ? 'TEAM NAME' : 'NAME'}</label>
                      <input
                        type="text" maxLength={28} placeholder={isTeam ? 'e.g. Team Nightshade' : 'e.g. Asha Rao'}
                        value={fg.name} onChange={(e) => fg.setName(e.target.value)}
                        className="w-full rounded-sm px-3 py-2.5 text-[14px] outline-none"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(243,244,234,0.14)', color: '#f3f4ea' }}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10.5px] tracking-wide mb-1.5" style={{ color: '#a9b8ab' }}>{isTeam ? 'PROJECT / TRACK' : 'STACK / ROLE'}</label>
                      <input
                        type="text" maxLength={30} placeholder={isTeam ? 'e.g. DeFi tooling, AI agents' : 'e.g. Full-stack, Solidity, ML'}
                        value={fg.role} onChange={(e) => fg.setRole(e.target.value)}
                        className="w-full rounded-sm px-3 py-2.5 text-[14px] outline-none"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(243,244,234,0.14)', color: '#f3f4ea' }}
                      />
                    </div>
                    <div className="font-mono text-[11.5px] flex items-center gap-2 flex-wrap" style={{ color: '#a9b8ab' }}>
                      &#9889; {isTeam ? 'TEAM TAG' : 'BUILDER CLASS'}: <b style={{ color: '#cdf24f' }}>{fg.builderTitlePreview || '\u2014'}</b>
                      <button
                        onClick={fg.randomizeTitle}
                        title={isTeam ? 'Randomize team tag' : 'Randomize builder class'}
                        className="ml-auto shrink-0 w-6 h-6 rounded-full grid place-items-center transition-colors"
                        style={{ border: '1px solid rgba(205,242,79,0.35)', color: '#cdf24f', background: 'rgba(205,242,79,0.08)' }}
                      >
                        &#127922;
                      </button>
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Step: Download & Share */}
              <Reveal delay={350} className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <StepNumber n={stepNum('download')} />
                  <span className="font-mono text-[11px] tracking-wide" style={{ color: '#a9b8ab' }}>DOWNLOAD &amp; SHARE</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={fg.download} disabled={!fg.hasImage}
                    className="py-3.5 rounded-sm font-bold text-[13.5px] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#f3f4ea', color: '#070f0c' }}
                  >
                    &darr; Download PNG
                  </button>
                  <button
                    onClick={fg.share} disabled={!fg.hasImage}
                    className="py-3.5 rounded-sm font-bold text-[13.5px] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#000', color: '#fff', border: '1px solid rgba(243,244,234,0.14)' }}
                  >
                    &#120143; Share to X
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label htmlFor="share-caption" className="font-mono text-[10.5px] tracking-wide" style={{ color: '#a9b8ab' }}>
                      POST CAPTION
                    </label>
                    <span className="font-mono text-[10px] ml-auto" style={{ color: fg.caption.length > 260 ? '#ff8a8a' : '#a9b8ab' }}>
                      {fg.caption.length}/280
                    </span>
                  </div>
                  <textarea
                    id="share-caption"
                    rows={3}
                    maxLength={280}
                    value={fg.caption}
                    onChange={(e) => fg.setCaption(e.target.value)}
                    placeholder="Write your post…"
                    className="w-full rounded-sm px-3 py-2.5 text-[13px] leading-relaxed outline-none resize-y"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(243,244,234,0.14)', color: '#f3f4ea' }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={fg.copyCaption}
                      className="px-3 py-1.5 rounded-sm font-mono text-[10.5px] tracking-wide transition-colors"
                      style={{ border: '1px solid rgba(243,244,234,0.18)', color: '#f3f4ea', background: 'rgba(255,255,255,0.02)' }}
                    >
                      &#128203; Copy
                    </button>
                    <button
                      onClick={fg.resetCaption}
                      className="px-3 py-1.5 rounded-sm font-mono text-[10.5px] tracking-wide transition-colors"
                      style={{ border: '1px solid rgba(243,244,234,0.18)', color: '#a9b8ab', background: 'transparent' }}
                    >
                      &#8635; Reset
                    </button>
                  </div>
                </div>

                {fg.status.msg && (
                  <div
                    className="font-mono text-[11px] mt-3"
                    style={{ color: fg.status.kind === 'err' ? '#ff8a8a' : fg.status.kind === 'ok' ? '#8fe3a0' : '#a9b8ab' }}
                  >
                    {fg.status.msg}
                  </div>
                )}
              </Reveal>

              <Reveal
                delay={400}
                className="rounded-sm p-4 text-[12px] leading-relaxed"
                style={{ background: 'rgba(205,242,79,0.05)', border: '1px solid rgba(205,242,79,0.18)', color: '#a9b8ab' }}
              >
                <b style={{ color: '#cdf24f' }}>About Share to X:</b> your caption above is pre-filled into the
                composer and the graphic downloads alongside it &mdash; attach the downloaded image before posting.
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {fg.cameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,15,12,0.85)' }}
          onClick={fg.closeCamera}
        >
          <div
            className="w-full max-w-[420px] rounded-sm p-4 flex flex-col items-center gap-4"
            style={{ background: '#0e1f17', border: '1px solid rgba(243,244,234,0.14)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wide" style={{ color: '#a9b8ab' }}>TAKE A PHOTO</span>
              <button onClick={fg.closeCamera} className="font-mono text-[11px]" style={{ color: '#a9b8ab' }}>&#10005; close</button>
            </div>
            <div className="w-full rounded-sm overflow-hidden relative" style={{ aspectRatio: '1 / 1', background: '#000' }}>
              <video
                ref={fg.videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
            {fg.cameraError && (
              <div className="font-mono text-[11px] text-center" style={{ color: '#ff8a8a' }}>{fg.cameraError}</div>
            )}
            <button
              onClick={fg.capturePhoto}
              disabled={!fg.cameraReady}
              className="w-full py-3.5 rounded-sm font-bold text-[13.5px] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg,#22a866,#cdf24f)', color: '#070f0c' }}
            >
              &#128247; Capture
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
