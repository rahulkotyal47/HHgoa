import { useEffect, useState } from 'react';

export function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // blur ramps from 0 to 20px over the first 600px of scroll
  const blur = Math.min(scrollY / 30, 20);
  // dim overlay goes from 0 to 0.6
  const dim = Math.min(scrollY / 1000, 0.6);

  return (
    <div
      className="landing-hero"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* hero image */}
      <img
        src="/hero-landing.png"
        alt="Hacker House Goa 2026"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          filter: `blur(${blur}px)`,
          transform: `scale(${1 + blur * 0.01})`, // slight scale to hide blur edges
          transition: 'filter 0.05s linear, transform 0.05s linear',
        }}
      />

      {/* dim overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(7, 15, 12, ${dim})`,
          pointerEvents: 'none',
        }}
      />

      {/* scroll indicator (fades away on scroll) */}
      <div
        className="scroll-indicator"
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: Math.max(0, 1 - scrollY / 200),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}
        >
          SCROLL TO BUILD
        </span>
        <span className="bounce-arrow" style={{ fontSize: '20px', color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          ↓
        </span>
      </div>
    </div>
  );
}
