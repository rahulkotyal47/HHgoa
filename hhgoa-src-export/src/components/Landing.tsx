import { useEffect, useRef } from 'react';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function PalmLeaf() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M100,180 Q80,140 60,100 Q40,60 50,20" strokeWidth="3" />
      <path d="M100,180 Q90,140 80,100 Q70,60 75,30" />
      <path d="M100,180 Q100,140 100,100 Q100,60 100,25" />
      <path d="M100,180 Q110,140 120,100 Q130,60 125,30" />
      <path d="M100,180 Q120,140 140,100 Q160,60 150,20" strokeWidth="3" />
    </svg>
  );
}

export function Landing() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Drive the scroll effect through CSS variables on a ref instead of React
    // state: a state update per scroll event re-renders the whole hero on every
    // frame of every scroll.
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      const blur = Math.min(y / 30, 20);
      root.style.setProperty('--hero-blur', `${blur.toFixed(2)}px`);
      root.style.setProperty('--hero-scale', (1 + blur * 0.01).toFixed(4));
      root.style.setProperty('--hero-dim', Math.min(y / 1000, 0.6).toFixed(3));
      root.style.setProperty('--hero-hint', Math.max(0, 1 - y / 200).toFixed(3));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="landing-hero">
      <div className="landing-hero-stage">
        <div className="hh-logo">
          <span className="hh-logo-num">2:47</span>PM
          <br />
          STUDIO
        </div>

        <div className="hh-palm hh-palm-l"><PalmLeaf /></div>
        <div className="hh-palm hh-palm-r"><PalmLeaf /></div>

        <div className="hh-content">
          <div className="hh-meta">
            <span>GOA, INDIA &bull; 28 &ndash; 31 OCT 2026</span>
            <span>2:47 PM STUDIO</span>
          </div>

          <div className="hh-title-wrap">
            <span className="hh-goa">गोवा</span>
            <h1 className="hh-title">HACKER HOUSE</h1>
          </div>

          <div className="hh-sun-wrap">
            <div className="hh-line" />
            <div className="hh-sun">
              <div className="hh-rays">
                {RAY_ANGLES.map((a) => (
                  <span key={a} className="hh-ray" style={{ ['--a' as string]: `${a}deg` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-hero-dim" />

      <div className="landing-hero-hint">
        <span className="font-mono landing-hero-hint-label">SCROLL TO BUILD</span>
        <span className="bounce-arrow landing-hero-hint-arrow">&darr;</span>
      </div>
    </div>
  );
}
