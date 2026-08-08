import { Reveal } from '@/components/Reveal';

const HIGHLIGHTS = [
  {
    icon: '\u{1F30A}',
    title: 'Ocean-view studio',
    body: 'A dedicated build space steps from the water, set up for long, focused sessions rather than back-to-back panels.',
  },
  {
    icon: '⚡',
    title: 'High-speed everything',
    body: 'Fast fiber, real desks, and a room full of people actually shipping — not just talking about shipping.',
  },
  {
    icon: '\u{1F91D}',
    title: 'Curated builder cohort',
    body: 'A small, hand-picked group of engineers, designers, and founders, so every conversation is worth having.',
  },
];

const FLOW = [
  { day: 'DAY 1', label: 'Arrive & settle in', body: 'Land in Goa, check in at the studio, meet the room.' },
  { day: 'DAY 2–3', label: 'Build', body: 'Heads-down sessions, pairing, and the ocean whenever you need a reset.' },
  { day: 'DAY 4', label: 'Demo & send-off', body: 'Show what you shipped, swap contacts, head home.' },
];

const FAQ = [
  {
    q: 'Who is HH Goa for?',
    a: 'Builders — engineers, designers, and founders who want a focused week of shipping alongside a small group of peers, rather than a conference full of panels.',
  },
  {
    q: 'What should I bring?',
    a: 'Your laptop, whatever you’re building, and a photo for your #FrameInGoa pass. Everything else — desks, fiber, the view — is already there.',
  },
  {
    q: 'Where do I find official details — dates, applications, pricing?',
    a: 'This page is a companion tool for generating your frame, boarding pass, or team pass. For the authoritative schedule and how to apply, check hhgoa.com directly.',
  },
];

export function Landing() {
  const scrollToBuilder = () => {
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-6 pt-10 pb-4">
      {/* hero */}
      <Reveal className="flex flex-col items-start gap-5 py-10 md:py-16">
        <span
          className="font-mono text-[11px] tracking-wider px-3 py-1.5 rounded-full"
          style={{ border: '1px solid rgba(205,242,79,0.35)', color: '#cdf24f' }}
        >
          HH GOA &middot; HACKER HOUSE 2026
        </span>
        <h1
          className="font-display leading-[0.92]"
          style={{ fontSize: 'clamp(42px,7vw,84px)' }}
        >
          Build in{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#22a866,#cdf24f)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Goa
          </span>{' '}
          this October.
        </h1>
        <p className="text-[15px] max-w-[560px]" style={{ color: '#a9b8ab' }}>
          Four days, a small cohort of builders, and an ocean-view studio with nothing on the
          agenda but shipping. GOA, INDIA &middot; 28&ndash;31 OCT 2026.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={scrollToBuilder}
            className="py-3 px-6 rounded-sm font-bold text-[13.5px]"
            style={{ background: 'linear-gradient(90deg,#22a866,#cdf24f)', color: '#070f0c' }}
          >
            Enter the Builder Studio &darr;
          </button>
          <a
            href="https://hhgoa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-6 rounded-sm font-mono text-[12.5px] tracking-wide"
            style={{ border: '1px solid rgba(243,244,234,0.18)', color: '#f3f4ea' }}
          >
            hhgoa.com &#8599;
          </a>
        </div>
      </Reveal>

      {/* highlights */}
      <div className="grid gap-4 sm:grid-cols-3 py-6">
        {HIGHLIGHTS.map((h, i) => (
          <Reveal
            key={h.title}
            delay={i * 60}
            className="rounded-sm p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}
          >
            <div className="text-[26px] mb-2">{h.icon}</div>
            <div className="text-[15px] font-semibold mb-1.5">{h.title}</div>
            <div className="text-[13px] leading-relaxed" style={{ color: '#a9b8ab' }}>{h.body}</div>
          </Reveal>
        ))}
      </div>

      {/* flow */}
      <Reveal className="py-10">
        <div className="font-mono text-[11px] tracking-wide mb-4" style={{ color: '#a9b8ab' }}>THE FLOW</div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FLOW.map((f, i) => (
            <div key={f.day} className="relative pl-5" style={{ borderLeft: '2px solid rgba(205,242,79,0.35)' }}>
              <div className="font-mono text-[10.5px] tracking-wide mb-1" style={{ color: '#cdf24f' }}>{f.day}</div>
              <div className="text-[15px] font-semibold mb-1">{f.label}</div>
              <div className="text-[13px] leading-relaxed" style={{ color: '#a9b8ab' }}>{f.body}</div>
              {i < FLOW.length - 1 && (
                <div
                  className="hidden sm:block absolute top-1 -right-2 font-mono text-[12px]"
                  style={{ color: 'rgba(169,184,171,0.4)' }}
                >
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      {/* faq */}
      <Reveal className="py-10">
        <div className="font-mono text-[11px] tracking-wide mb-4" style={{ color: '#a9b8ab' }}>FAQ</div>
        <div className="flex flex-col gap-2.5">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-sm p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(243,244,234,0.12)' }}
            >
              <summary className="cursor-pointer text-[14px] font-semibold list-none flex items-center justify-between gap-3">
                {f.q}
                <span className="font-mono text-[13px] shrink-0 transition-transform group-open:rotate-45" style={{ color: '#cdf24f' }}>+</span>
              </summary>
              <p className="text-[13px] leading-relaxed mt-2.5" style={{ color: '#a9b8ab' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      {/* footer */}
      <Reveal
        className="flex items-center justify-between gap-3 flex-wrap py-6 mt-4"
        style={{ borderTop: '1px solid rgba(243,244,234,0.12)' }}
      >
        <div className="font-mono text-[11px]" style={{ color: '#a9b8ab' }}>
          HH GOA 2026 &middot; Goa, India &middot; 28&ndash;31 Oct 2026
        </div>
        <a
          href="https://hhgoa.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px]"
          style={{ color: '#cdf24f' }}
        >
          hhgoa.com &#8599;
        </a>
      </Reveal>
    </div>
  );
}
