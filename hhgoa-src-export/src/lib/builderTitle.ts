// Short tokens (ui, ai, ml, go, pm, api, ux, ios, rust) are anchored with \b.
// Unanchored they match inside ordinary words — "Django" contains "go",
// "Maintainer" and "Rails" contain "ai", "Guitarist" contains "ui" — which
// handed people a confidently wrong title.
const KEYWORDS: [RegExp, string][] = [
  [/react|next\.?js|frontend|front-end|\bui\b/i, 'Pixel Whisperer'],
  [/node|backend|back-end|\bapi\b|server/i, 'Endpoint Architect'],
  [/full[- ]?stack/i, 'Ship-It Specialist'],
  [/\bai\b|\bml\b|machine learning|\bllm\b|\bgpt\b/i, 'Prompt Alchemist'],
  [/data|analytics|sql/i, 'Signal Extractor'],
  [/solidity|web3|crypto|chain|contract/i, 'Chain Whisperer'],
  [/design|figma|\bux\b/i, 'Vision Renderer'],
  [/devops|infra|cloud|kubernetes|docker/i, 'Uptime Guardian'],
  [/\bios\b|swift|android|kotlin|mobile/i, 'Pocket Engineer'],
  [/product|\bpm\b/i, 'Roadmap Rogue'],
  [/security|hacker|pentest/i, 'Terminal Dweller'],
  [/game|unity|unreal/i, 'World Builder'],
  [/\brust\b|\bgo\b|golang|systems/i, 'Bare Metal Bender'],
];

const FALLBACK = [
  'Terminal Dweller', 'Canopy Coder', 'Jungle Shipper', 'Beachside Builder',
  'Night Owl Deployer', 'Genesis Day Architect', 'Signal in the Noise', 'Elite 500 Builder',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function builderTitle(name: string, role: string): string {
  if (role) {
    for (const [re, title] of KEYWORDS) if (re.test(role)) return title;
  }
  const seed = `${name}|${role}`;
  if (!seed.trim().replace('|', '')) return '';
  return FALLBACK[hashStr(seed) % FALLBACK.length];
}

const ALL_TITLES = Array.from(new Set([...KEYWORDS.map(([, title]) => title), ...FALLBACK]));

export function randomBuilderTitle(exclude?: string): string {
  const pool = exclude ? ALL_TITLES.filter((t) => t !== exclude) : ALL_TITLES;
  return pool[Math.floor(Math.random() * pool.length)] ?? ALL_TITLES[0];
}
