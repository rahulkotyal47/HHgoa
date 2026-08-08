const KEYWORDS: [RegExp, string][] = [
  [/react|next\.?js|frontend|front-end|ui/i, 'Pixel Whisperer'],
  [/node|backend|back-end|api|server/i, 'Endpoint Architect'],
  [/full ?stack/i, 'Ship-It Specialist'],
  [/ai|ml|machine learning|llm|gpt/i, 'Prompt Alchemist'],
  [/data|analytics|sql/i, 'Signal Extractor'],
  [/solidity|web3|crypto|chain|contract/i, 'Chain Whisperer'],
  [/design|figma|ux/i, 'Vision Renderer'],
  [/devops|infra|cloud|kubernetes|docker/i, 'Uptime Guardian'],
  [/ios|swift|android|kotlin|mobile/i, 'Pocket Engineer'],
  [/product|pm/i, 'Roadmap Rogue'],
  [/security|hacker|pentest/i, 'Terminal Dweller'],
  [/game|unity|unreal/i, 'World Builder'],
  [/rust|go|golang|systems/i, 'Bare Metal Bender'],
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
