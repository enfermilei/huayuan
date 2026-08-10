/** 花园状态栏主题色：亮色/暗色预设 + 自定义主色推导 */

export const THEME_PRESET_IDS = [
  'peach',
  'mint',
  'sky',
  'lavender',
  'rose',
  'amber',
  'nightPeach',
  'inkBlue',
  'charcoalMint',
  'ember',
  'custom',
] as const;
export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];
export type ThemeMode = 'light' | 'dark';

export type ThemeTokens = {
  mode: ThemeMode;
  accent: string;
  accentDeep: string;
  bg: string;
  glow1: string;
  glow2: string;
  glow3: string;
  glow4: string;
  glow5: string;
  btnFrom: string;
  btnTo: string;
  btnShadow: string;
  btnShadowStrong: string;
  btnInset: string;
  shadowRgb: string;
  insetRgb: string;
  selection: string;
  textPrimary: string;
  textDark: string;
  textSecondary: string;
  textLabel: string;
  glassBg: string;
  glassBgStrong: string;
  glassBgSubtle: string;
  glassEdgeTop: string;
  glassEdgeLeft: string;
  glassEdgeBottom: string;
  glassEdgeRight: string;
  progressTrack: string;
  modalBg: string;
  overlayBg: string;
  panelSolid: string;
  highlightInset: string;
  highlightInsetStrong: string;
};

export type ThemePresetMeta = {
  id: Exclude<ThemePresetId, 'custom'>;
  label: string;
  group: ThemeMode;
  tokens: ThemeTokens;
};

const lightSurface = {
  mode: 'light' as const,
  textPrimary: '#2e2418',
  textDark: '#333333',
  textSecondary: '#6b5648',
  textLabel: 'rgba(46, 36, 24, 0.5)',
  glassBg: 'rgba(255, 255, 255, 0.42)',
  glassBgStrong: 'rgba(255, 255, 255, 0.58)',
  glassBgSubtle: 'rgba(255, 255, 255, 0.28)',
  glassEdgeTop: 'rgba(255, 255, 255, 0.95)',
  glassEdgeLeft: 'rgba(255, 255, 255, 0.75)',
  glassEdgeBottom: 'rgba(255, 255, 255, 0.18)',
  glassEdgeRight: 'rgba(255, 255, 255, 0.25)',
  progressTrack: 'rgba(255, 255, 255, 0.4)',
  modalBg: 'rgba(255, 248, 240, 0.92)',
  overlayBg: 'rgba(46, 36, 24, 0.28)',
  panelSolid: 'rgba(255, 255, 255, 0.72)',
  highlightInset: 'rgba(255, 255, 255, 0.65)',
  highlightInsetStrong: 'rgba(255, 255, 255, 0.85)',
};

const darkSurface = {
  mode: 'dark' as const,
  /* 暗色正文偏暖灰，避免刺眼近白；冷色预设会覆盖为冷灰 */
  textPrimary: '#d8cfc4',
  textDark: '#e4dbd0',
  textSecondary: '#b4a394',
  textLabel: 'rgba(216, 207, 196, 0.58)',
  glassBg: 'rgba(255, 255, 255, 0.07)',
  glassBgStrong: 'rgba(255, 255, 255, 0.11)',
  glassBgSubtle: 'rgba(255, 255, 255, 0.045)',
  glassEdgeTop: 'rgba(255, 255, 255, 0.16)',
  glassEdgeLeft: 'rgba(255, 255, 255, 0.12)',
  glassEdgeBottom: 'rgba(0, 0, 0, 0.4)',
  glassEdgeRight: 'rgba(0, 0, 0, 0.28)',
  progressTrack: 'rgba(255, 255, 255, 0.12)',
  modalBg: 'rgba(24, 22, 28, 0.96)',
  overlayBg: 'rgba(6, 6, 10, 0.58)',
  panelSolid: 'rgba(32, 30, 36, 0.9)',
  highlightInset: 'rgba(255, 255, 255, 0.1)',
  highlightInsetStrong: 'rgba(255, 255, 255, 0.16)',
};

const peachTokens: ThemeTokens = {
  ...lightSurface,
  accent: '#ffb8a0',
  accentDeep: '#f5906e',
  bg: '#fff5ec',
  glow1: 'rgba(255, 200, 180, 0.55)',
  glow2: 'rgba(255, 230, 180, 0.65)',
  glow3: 'rgba(210, 220, 250, 0.55)',
  glow4: 'rgba(255, 210, 220, 0.55)',
  glow5: 'rgba(255, 245, 220, 0.4)',
  btnFrom: '#ffe0cc',
  btnTo: '#ffc5a8',
  btnShadow: 'rgba(230, 160, 130, 0.35)',
  btnShadowStrong: 'rgba(230, 160, 130, 0.5)',
  btnInset: 'rgba(200, 120, 90, 0.15)',
  shadowRgb: '150, 100, 80',
  insetRgb: '100, 65, 45',
  selection: 'rgba(255, 182, 193, 0.5)',
};

export const THEME_PRESETS: ThemePresetMeta[] = [
  { id: 'peach', label: '暖桃', group: 'light', tokens: peachTokens },
  {
    id: 'mint',
    label: '薄荷',
    group: 'light',
    tokens: {
      ...lightSurface,
      accent: '#8fd6c0',
      accentDeep: '#5fb89a',
      bg: '#f0faf5',
      glow1: 'rgba(160, 230, 200, 0.5)',
      glow2: 'rgba(200, 240, 220, 0.6)',
      glow3: 'rgba(190, 220, 245, 0.5)',
      glow4: 'rgba(180, 235, 210, 0.5)',
      glow5: 'rgba(230, 250, 240, 0.4)',
      btnFrom: '#d4f0e4',
      btnTo: '#a8e0c8',
      btnShadow: 'rgba(110, 180, 150, 0.32)',
      btnShadowStrong: 'rgba(110, 180, 150, 0.48)',
      btnInset: 'rgba(70, 140, 110, 0.15)',
      shadowRgb: '90, 130, 115',
      insetRgb: '55, 90, 75',
      selection: 'rgba(140, 210, 185, 0.45)',
    },
  },
  {
    id: 'sky',
    label: '晴空',
    group: 'light',
    tokens: {
      ...lightSurface,
      accent: '#8eb8e8',
      accentDeep: '#5e93d0',
      bg: '#f0f6fc',
      glow1: 'rgba(170, 210, 245, 0.5)',
      glow2: 'rgba(200, 225, 250, 0.6)',
      glow3: 'rgba(180, 200, 245, 0.5)',
      glow4: 'rgba(210, 225, 255, 0.5)',
      glow5: 'rgba(235, 245, 255, 0.4)',
      btnFrom: '#d6e8f8',
      btnTo: '#a8c8ec',
      btnShadow: 'rgba(110, 150, 200, 0.32)',
      btnShadowStrong: 'rgba(110, 150, 200, 0.48)',
      btnInset: 'rgba(70, 110, 160, 0.15)',
      shadowRgb: '95, 120, 150',
      insetRgb: '60, 80, 110',
      selection: 'rgba(140, 185, 230, 0.45)',
    },
  },
  {
    id: 'lavender',
    label: '丁香',
    group: 'light',
    tokens: {
      ...lightSurface,
      accent: '#c4b0e0',
      accentDeep: '#9a82c4',
      bg: '#f7f3fc',
      glow1: 'rgba(210, 190, 240, 0.5)',
      glow2: 'rgba(230, 210, 245, 0.6)',
      glow3: 'rgba(200, 210, 245, 0.5)',
      glow4: 'rgba(235, 200, 230, 0.5)',
      glow5: 'rgba(245, 235, 255, 0.4)',
      btnFrom: '#ebe0f5',
      btnTo: '#d0bce8',
      btnShadow: 'rgba(150, 120, 190, 0.32)',
      btnShadowStrong: 'rgba(150, 120, 190, 0.48)',
      btnInset: 'rgba(110, 80, 150, 0.15)',
      shadowRgb: '120, 100, 145',
      insetRgb: '80, 65, 105',
      selection: 'rgba(190, 165, 220, 0.45)',
    },
  },
  {
    id: 'rose',
    label: '蔷薇',
    group: 'light',
    tokens: {
      ...lightSurface,
      accent: '#f0a0b4',
      accentDeep: '#d8708c',
      bg: '#fff2f5',
      glow1: 'rgba(250, 190, 205, 0.55)',
      glow2: 'rgba(255, 220, 230, 0.6)',
      glow3: 'rgba(230, 200, 240, 0.45)',
      glow4: 'rgba(255, 200, 210, 0.5)',
      glow5: 'rgba(255, 240, 245, 0.4)',
      btnFrom: '#ffd6e0',
      btnTo: '#f0a8bc',
      btnShadow: 'rgba(210, 120, 145, 0.32)',
      btnShadowStrong: 'rgba(210, 120, 145, 0.48)',
      btnInset: 'rgba(170, 80, 110, 0.15)',
      shadowRgb: '150, 95, 115',
      insetRgb: '110, 60, 80',
      selection: 'rgba(240, 160, 180, 0.45)',
    },
  },
  {
    id: 'amber',
    label: '琥珀',
    group: 'light',
    tokens: {
      ...lightSurface,
      accent: '#e8c07a',
      accentDeep: '#d09a45',
      bg: '#fff8eb',
      glow1: 'rgba(245, 215, 150, 0.55)',
      glow2: 'rgba(255, 235, 180, 0.6)',
      glow3: 'rgba(230, 210, 180, 0.45)',
      glow4: 'rgba(250, 220, 170, 0.5)',
      glow5: 'rgba(255, 248, 230, 0.4)',
      btnFrom: '#ffe8c0',
      btnTo: '#f0c878',
      btnShadow: 'rgba(200, 150, 80, 0.32)',
      btnShadowStrong: 'rgba(200, 150, 80, 0.48)',
      btnInset: 'rgba(160, 110, 50, 0.15)',
      shadowRgb: '145, 115, 70',
      insetRgb: '105, 80, 45',
      selection: 'rgba(230, 190, 120, 0.45)',
    },
  },
  {
    id: 'nightPeach',
    label: '夜桃',
    group: 'dark',
    tokens: {
      ...darkSurface,
      accent: '#e8a88c',
      accentDeep: '#d48462',
      bg: '#1c1714',
      glow1: 'rgba(180, 100, 70, 0.28)',
      glow2: 'rgba(160, 90, 60, 0.22)',
      glow3: 'rgba(90, 100, 140, 0.22)',
      glow4: 'rgba(160, 80, 90, 0.2)',
      glow5: 'rgba(120, 80, 50, 0.18)',
      btnFrom: '#5a3d32',
      btnTo: '#8a5a45',
      btnShadow: 'rgba(0, 0, 0, 0.4)',
      btnShadowStrong: 'rgba(0, 0, 0, 0.55)',
      btnInset: 'rgba(0, 0, 0, 0.25)',
      shadowRgb: '0, 0, 0',
      insetRgb: '20, 14, 12',
      selection: 'rgba(232, 168, 140, 0.35)',
      textSecondary: '#b39a8a',
      modalBg: 'rgba(30, 24, 22, 0.95)',
    },
  },
  {
    id: 'inkBlue',
    label: '墨蓝',
    group: 'dark',
    tokens: {
      ...darkSurface,
      accent: '#7eb0e0',
      accentDeep: '#5a8fc4',
      bg: '#121820',
      glow1: 'rgba(70, 120, 180, 0.28)',
      glow2: 'rgba(50, 90, 150, 0.22)',
      glow3: 'rgba(80, 100, 160, 0.2)',
      glow4: 'rgba(60, 130, 160, 0.18)',
      glow5: 'rgba(40, 70, 110, 0.2)',
      btnFrom: '#2a3d55',
      btnTo: '#3f5f82',
      btnShadow: 'rgba(0, 0, 0, 0.42)',
      btnShadowStrong: 'rgba(0, 0, 0, 0.58)',
      btnInset: 'rgba(0, 0, 0, 0.28)',
      shadowRgb: '0, 0, 0',
      insetRgb: '12, 18, 28',
      selection: 'rgba(126, 176, 224, 0.35)',
      textPrimary: '#d7e2ef',
      textDark: '#e8eef6',
      textSecondary: '#a8b8cc',
      textLabel: 'rgba(215, 226, 239, 0.62)',
      modalBg: 'rgba(18, 24, 34, 0.95)',
    },
  },
  {
    id: 'charcoalMint',
    label: '青墨',
    group: 'dark',
    tokens: {
      ...darkSurface,
      accent: '#7dcfb6',
      accentDeep: '#4fa890',
      bg: '#121916',
      glow1: 'rgba(60, 140, 110, 0.26)',
      glow2: 'rgba(50, 120, 100, 0.2)',
      glow3: 'rgba(70, 110, 140, 0.18)',
      glow4: 'rgba(80, 140, 120, 0.18)',
      glow5: 'rgba(40, 90, 70, 0.2)',
      btnFrom: '#274038',
      btnTo: '#3a6656',
      btnShadow: 'rgba(0, 0, 0, 0.42)',
      btnShadowStrong: 'rgba(0, 0, 0, 0.58)',
      btnInset: 'rgba(0, 0, 0, 0.28)',
      shadowRgb: '0, 0, 0',
      insetRgb: '12, 22, 18',
      selection: 'rgba(125, 207, 182, 0.35)',
      textPrimary: '#d4e6de',
      textDark: '#e6f2ec',
      textSecondary: '#a3c0b4',
      textLabel: 'rgba(212, 230, 222, 0.62)',
      modalBg: 'rgba(18, 26, 22, 0.95)',
    },
  },
  {
    id: 'ember',
    label: '余烬',
    group: 'dark',
    tokens: {
      ...darkSurface,
      accent: '#e0a46a',
      accentDeep: '#c48442',
      bg: '#1a1510',
      glow1: 'rgba(180, 110, 50, 0.26)',
      glow2: 'rgba(150, 90, 40, 0.2)',
      glow3: 'rgba(120, 70, 40, 0.18)',
      glow4: 'rgba(160, 80, 50, 0.16)',
      glow5: 'rgba(90, 55, 30, 0.2)',
      btnFrom: '#4a3420',
      btnTo: '#7a5230',
      btnShadow: 'rgba(0, 0, 0, 0.45)',
      btnShadowStrong: 'rgba(0, 0, 0, 0.6)',
      btnInset: 'rgba(0, 0, 0, 0.3)',
      shadowRgb: '0, 0, 0',
      insetRgb: '22, 16, 10',
      selection: 'rgba(224, 164, 106, 0.35)',
      textSecondary: '#b39a7e',
      modalBg: 'rgba(28, 22, 16, 0.95)',
    },
  },
];

export const LIGHT_THEME_PRESETS = THEME_PRESETS.filter(p => p.group === 'light');
export const DARK_THEME_PRESETS = THEME_PRESETS.filter(p => p.group === 'dark');

const PRESET_MAP = Object.fromEntries(THEME_PRESETS.map(p => [p.id, p])) as Record<
  Exclude<ThemePresetId, 'custom'>,
  ThemePresetMeta
>;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b].map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** 由自定义主色推导一整套氛围变量 */
export function deriveThemeFromAccent(accentHex: string, dark = false): ThemeTokens {
  const rgb = hexToRgb(accentHex) ?? hexToRgb(peachTokens.accent)!;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const sat = clamp(s, 0.25, 0.75);
  const accent = toHex(rgb);
  const accentDeep = toHex(
    hslToRgb(h, clamp(sat * 1.08, 0.3, 0.85), dark ? clamp(l * 0.78, 0.38, 0.62) : clamp(l * 0.72, 0.32, 0.58)),
  );
  const mid = hslToRgb(h, sat, clamp(l, 0.45, 0.72));
  const deep = hslToRgb(h, clamp(sat * 0.9, 0.25, 0.75), clamp(l * 0.55, 0.28, 0.5));

  if (dark) {
    const bg = toHex(hslToRgb(h, clamp(sat * 0.28, 0.08, 0.35), 0.11));
    const btnFrom = toHex(hslToRgb(h, clamp(sat * 0.4, 0.15, 0.5), 0.22));
    const btnTo = toHex(hslToRgb(h, clamp(sat * 0.5, 0.2, 0.6), 0.34));
    const soft = hslToRgb(h, clamp(sat * 0.45, 0.12, 0.5), 0.35);
    const neighbor = hslToRgb((h + 0.08) % 1, clamp(sat * 0.35, 0.1, 0.4), 0.3);
    const cool = hslToRgb((h + 0.55) % 1, clamp(sat * 0.3, 0.08, 0.35), 0.28);
    /* 按主色色相推导字色，避免冷色底仍用暖灰导致发灰发糊 */
    const textPri = hslToRgb(h, clamp(sat * 0.12, 0.04, 0.18), 0.86);
    const textDk = hslToRgb(h, clamp(sat * 0.1, 0.03, 0.16), 0.92);
    const textSec = hslToRgb(h, clamp(sat * 0.16, 0.06, 0.22), 0.72);
    return {
      ...darkSurface,
      accent,
      accentDeep,
      bg,
      glow1: rgba(mid.r, mid.g, mid.b, 0.26),
      glow2: rgba(soft.r, soft.g, soft.b, 0.2),
      glow3: rgba(cool.r, cool.g, cool.b, 0.18),
      glow4: rgba(neighbor.r, neighbor.g, neighbor.b, 0.16),
      glow5: rgba(deep.r, deep.g, deep.b, 0.18),
      btnFrom,
      btnTo,
      btnShadow: 'rgba(0, 0, 0, 0.42)',
      btnShadowStrong: 'rgba(0, 0, 0, 0.58)',
      btnInset: 'rgba(0, 0, 0, 0.28)',
      shadowRgb: '0, 0, 0',
      insetRgb: `${Math.round(deep.r * 0.2)}, ${Math.round(deep.g * 0.2)}, ${Math.round(deep.b * 0.2)}`,
      selection: rgba(mid.r, mid.g, mid.b, 0.35),
      textPrimary: toHex(textPri),
      textDark: toHex(textDk),
      textSecondary: toHex(textSec),
      textLabel: rgba(textPri.r, textPri.g, textPri.b, 0.62),
      modalBg: (() => {
        const m = hslToRgb(h, clamp(sat * 0.25, 0.08, 0.3), 0.12);
        return rgba(m.r, m.g, m.b, 0.95);
      })(),
    };
  }

  const bg = toHex(hslToRgb(h, clamp(sat * 0.35, 0.12, 0.4), 0.96));
  const btnFrom = toHex(hslToRgb(h, clamp(sat * 0.45, 0.18, 0.55), 0.9));
  const btnTo = toHex(hslToRgb(h, clamp(sat * 0.6, 0.25, 0.7), 0.78));
  const soft = hslToRgb(h, clamp(sat * 0.5, 0.15, 0.55), 0.85);
  const neighbor = hslToRgb((h + 0.08) % 1, clamp(sat * 0.45, 0.15, 0.5), 0.88);
  const cool = hslToRgb((h + 0.55) % 1, clamp(sat * 0.35, 0.12, 0.4), 0.88);

  return {
    ...lightSurface,
    accent,
    accentDeep,
    bg,
    glow1: rgba(mid.r, mid.g, mid.b, 0.55),
    glow2: rgba(soft.r, soft.g, soft.b, 0.6),
    glow3: rgba(cool.r, cool.g, cool.b, 0.5),
    glow4: rgba(neighbor.r, neighbor.g, neighbor.b, 0.5),
    glow5: rgba(soft.r, soft.g, soft.b, 0.4),
    btnFrom,
    btnTo,
    btnShadow: rgba(deep.r, deep.g, deep.b, 0.32),
    btnShadowStrong: rgba(deep.r, deep.g, deep.b, 0.48),
    btnInset: rgba(deep.r, deep.g, deep.b, 0.15),
    shadowRgb: `${Math.round(deep.r * 0.75)}, ${Math.round(deep.g * 0.75)}, ${Math.round(deep.b * 0.75)}`,
    insetRgb: `${Math.round(deep.r * 0.55)}, ${Math.round(deep.g * 0.55)}, ${Math.round(deep.b * 0.55)}`,
    selection: rgba(mid.r, mid.g, mid.b, 0.45),
  };
}

export function resolveThemeTokens(
  preset: ThemePresetId,
  customAccent: string,
  customDark = false,
): ThemeTokens {
  if (preset === 'custom') return deriveThemeFromAccent(customAccent, customDark);
  return PRESET_MAP[preset]?.tokens ?? peachTokens;
}

export function themeTokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    '--theme-accent': tokens.accent,
    '--theme-accent-deep': tokens.accentDeep,
    '--theme-bg': tokens.bg,
    '--theme-glow-1': tokens.glow1,
    '--theme-glow-2': tokens.glow2,
    '--theme-glow-3': tokens.glow3,
    '--theme-glow-4': tokens.glow4,
    '--theme-glow-5': tokens.glow5,
    '--theme-btn-from': tokens.btnFrom,
    '--theme-btn-to': tokens.btnTo,
    '--theme-btn-shadow': tokens.btnShadow,
    '--theme-btn-shadow-strong': tokens.btnShadowStrong,
    '--theme-btn-inset': tokens.btnInset,
    '--theme-shadow-rgb': tokens.shadowRgb,
    '--theme-inset-rgb': tokens.insetRgb,
    '--theme-selection': tokens.selection,
    '--theme-modal-bg': tokens.modalBg,
    '--theme-overlay-bg': tokens.overlayBg,
    '--theme-panel-solid': tokens.panelSolid,
    '--theme-highlight-inset': tokens.highlightInset,
    '--theme-highlight-inset-strong': tokens.highlightInsetStrong,
    '--text-primary': tokens.textPrimary,
    '--text-dark': tokens.textDark,
    '--text-secondary': tokens.textSecondary,
    '--text-label': tokens.textLabel,
    '--glass-bg': tokens.glassBg,
    '--glass-bg-strong': tokens.glassBgStrong,
    '--glass-bg-subtle': tokens.glassBgSubtle,
    '--glass-edge-top': tokens.glassEdgeTop,
    '--glass-edge-left': tokens.glassEdgeLeft,
    '--glass-edge-bottom': tokens.glassEdgeBottom,
    '--glass-edge-right': tokens.glassEdgeRight,
    '--progress-track': tokens.progressTrack,
  };
}

export function presetAccent(preset: Exclude<ThemePresetId, 'custom'>): string {
  return PRESET_MAP[preset].tokens.accent;
}

export function presetMode(preset: ThemePresetId, customDark = false): ThemeMode {
  if (preset === 'custom') return customDark ? 'dark' : 'light';
  return PRESET_MAP[preset]?.tokens.mode ?? 'light';
}

export const DEFAULT_THEME_ACCENT = peachTokens.accent;
