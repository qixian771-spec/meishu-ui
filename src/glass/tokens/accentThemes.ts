/**
 * Workspace accent packs (framework token truth).
 * Cards use tonal wash roles (soft/mid/deep/glow/chrome) inside one pack.
 */

/** Pack-local ultrathink palette (shape shared with liquid canvas helpers). */
export type UltrathinkColors = {
  ink: [number, number, number];
  sky: [number, number, number];
  klein: [number, number, number];
  mist: [number, number, number];
};

export type AccentThemeId =
  | 'ref123'
  | 'klein'
  | 'sky'
  | 'amber'
  | 'cinnabar'
  | 'chrome'
  | 'white';

/** Tonal steps inside one theme */
export type WashRole = 'soft' | 'mid' | 'deep' | 'glow' | 'chrome';

export type WashPalette = {
  ink: [number, number, number];
  mid: [number, number, number];
  glow: [number, number, number];
  rim: [number, number, number];
};

export type AccentTheme = {
  id: AccentThemeId;
  label: string;
  hint: string;
  /** dark = black stage · light = white studio */
  surface: 'dark' | 'light';
  swatch: string;
  primary: string;
  primarySoft: string;
  primaryBorder: string;
  washes: Record<WashRole, WashPalette>;
  ultrathink: UltrathinkColors;
  bloomA: string;
  bloomB: string;
  bloomC: string;
  /** Optional solid stage override (white theme) */
  stageBg?: string;
};

const RGB = {
  graphiteInk: [10, 12, 18] as [number, number, number],
  mist: [226, 232, 240] as [number, number, number],
};

/** Neutral dark glass washes (refs #1–3 plates) */
const NEUTRAL_DARK_WASHS: Record<WashRole, WashPalette> = {
  soft: {
    ink: [8, 10, 14],
    mid: [28, 32, 40],
    glow: [100, 116, 139],
    rim: [226, 232, 240],
  },
  mid: {
    ink: [6, 8, 12],
    mid: [30, 36, 44],
    glow: [148, 163, 184],
    rim: [241, 245, 249],
  },
  deep: {
    ink: [4, 6, 10],
    mid: [24, 28, 36],
    glow: [71, 85, 105],
    rim: [203, 213, 225],
  },
  glow: {
    ink: [6, 12, 10],
    mid: [20, 60, 40],
    glow: [74, 222, 128],
    rim: [187, 247, 208],
  },
  chrome: {
    ink: [8, 10, 14],
    mid: [32, 36, 44],
    glow: [148, 163, 184],
    rim: [248, 250, 252],
  },
};

export const ACCENT_THEMES: Record<AccentThemeId, AccentTheme> = {
  ref123: {
    id: 'ref123',
    label: '参考图',
    hint: '图 1–3 · 黑底翠绿',
    surface: 'dark',
    swatch: '#4ADE80',
    primary: '#4ADE80',
    primarySoft: 'rgba(74, 222, 128, 0.14)',
    primaryBorder: 'rgba(74, 222, 128, 0.42)',
    bloomA: 'rgba(74, 222, 128, 0.1)',
    bloomB: 'rgba(74, 222, 128, 0.05)',
    bloomC: 'rgba(255, 255, 255, 0.03)',
    stageBg: '#000000',
    ultrathink: {
      ink: [8, 10, 12],
      sky: [167, 243, 208],
      klein: [22, 163, 74],
      mist: [241, 245, 249],
    },
    washes: NEUTRAL_DARK_WASHS,
  },
  klein: {
    id: 'klein',
    label: '克莱因',
    hint: '石墨底 · 冷蓝',
    surface: 'dark',
    swatch: '#3B82F6',
    primary: '#60A5FA',
    primarySoft: 'rgba(96, 165, 250, 0.16)',
    primaryBorder: 'rgba(96, 165, 250, 0.38)',
    bloomA: 'rgba(96, 165, 250, 0.22)',
    bloomB: 'rgba(29, 78, 216, 0.28)',
    bloomC: 'rgba(56, 189, 248, 0.1)',
    ultrathink: {
      ink: RGB.graphiteInk,
      sky: [125, 211, 252],
      klein: [29, 78, 216],
      mist: RGB.mist,
    },
    washes: {
      soft: {
        ink: [8, 14, 28],
        mid: [30, 64, 140],
        glow: [96, 165, 250],
        rim: [191, 219, 254],
      },
      mid: {
        ink: [8, 12, 32],
        mid: [29, 78, 216],
        glow: [96, 165, 250],
        rim: [191, 219, 254],
      },
      deep: {
        ink: [6, 10, 28],
        mid: [30, 64, 175],
        glow: [59, 130, 246],
        rim: [147, 197, 253],
      },
      glow: {
        ink: [8, 16, 36],
        mid: [37, 99, 235],
        glow: [125, 211, 252],
        rim: [224, 242, 254],
      },
      chrome: {
        ink: [12, 14, 22],
        mid: [40, 55, 90],
        glow: [148, 163, 184],
        rim: [226, 232, 240],
      },
    },
  },
  sky: {
    id: 'sky',
    label: '天际',
    hint: '青空冷色 · 轻盈',
    surface: 'dark',
    swatch: '#38BDF8',
    primary: '#38BDF8',
    primarySoft: 'rgba(56, 189, 248, 0.16)',
    primaryBorder: 'rgba(56, 189, 248, 0.38)',
    bloomA: 'rgba(56, 189, 248, 0.18)',
    bloomB: 'rgba(14, 116, 144, 0.22)',
    bloomC: 'rgba(125, 211, 252, 0.08)',
    ultrathink: {
      ink: RGB.graphiteInk,
      sky: [125, 211, 252],
      klein: [8, 145, 178],
      mist: RGB.mist,
    },
    washes: {
      soft: {
        ink: [8, 16, 26],
        mid: [14, 80, 120],
        glow: [56, 189, 248],
        rim: [186, 230, 253],
      },
      mid: {
        ink: [8, 18, 30],
        mid: [12, 100, 140],
        glow: [56, 189, 248],
        rim: [186, 230, 253],
      },
      deep: {
        ink: [6, 14, 28],
        mid: [8, 90, 130],
        glow: [14, 165, 233],
        rim: [125, 211, 252],
      },
      glow: {
        ink: [8, 20, 32],
        mid: [20, 120, 160],
        glow: [125, 211, 252],
        rim: [224, 242, 254],
      },
      chrome: {
        ink: [12, 16, 22],
        mid: [40, 60, 80],
        glow: [148, 163, 184],
        rim: [226, 232, 240],
      },
    },
  },
  amber: {
    id: 'amber',
    label: '琥珀',
    hint: '暖铜光 · 深夜工作室',
    surface: 'dark',
    swatch: '#F59E0B',
    primary: '#FBBF24',
    primarySoft: 'rgba(251, 191, 36, 0.14)',
    primaryBorder: 'rgba(251, 191, 36, 0.36)',
    bloomA: 'rgba(251, 191, 36, 0.14)',
    bloomB: 'rgba(180, 90, 30, 0.2)',
    bloomC: 'rgba(253, 186, 116, 0.08)',
    ultrathink: {
      ink: [18, 12, 8],
      sky: [253, 224, 171],
      klein: [180, 83, 9],
      mist: [255, 247, 237],
    },
    washes: {
      soft: {
        ink: [20, 14, 8],
        mid: [140, 80, 30],
        glow: [251, 191, 36],
        rim: [254, 243, 199],
      },
      mid: {
        ink: [22, 14, 8],
        mid: [180, 90, 30],
        glow: [251, 146, 60],
        rim: [254, 215, 170],
      },
      deep: {
        ink: [18, 10, 6],
        mid: [150, 70, 20],
        glow: [245, 158, 11],
        rim: [253, 230, 138],
      },
      glow: {
        ink: [24, 16, 8],
        mid: [200, 110, 40],
        glow: [252, 211, 77],
        rim: [254, 243, 199],
      },
      chrome: {
        ink: [16, 14, 12],
        mid: [70, 55, 40],
        glow: [168, 162, 158],
        rim: [231, 229, 228],
      },
    },
  },
  cinnabar: {
    id: 'cinnabar',
    label: '中国红',
    hint: '朱砂金边 · 夜宴',
    surface: 'dark',
    swatch: '#DE2910',
    primary: '#EF4444',
    primarySoft: 'rgba(239, 68, 68, 0.16)',
    primaryBorder: 'rgba(239, 68, 68, 0.42)',
    bloomA: 'rgba(239, 68, 68, 0.18)',
    bloomB: 'rgba(153, 27, 27, 0.28)',
    bloomC: 'rgba(251, 191, 36, 0.08)',
    stageBg: '#080406',
    ultrathink: {
      ink: [16, 8, 8],
      sky: [253, 230, 138],
      klein: [185, 28, 28],
      mist: [254, 243, 199],
    },
    washes: {
      soft: {
        ink: [18, 8, 8],
        mid: [120, 28, 28],
        glow: [239, 68, 68],
        rim: [253, 230, 138],
      },
      mid: {
        ink: [20, 8, 8],
        mid: [153, 27, 27],
        glow: [248, 113, 113],
        rim: [252, 211, 77],
      },
      deep: {
        ink: [14, 6, 6],
        mid: [127, 29, 29],
        glow: [220, 38, 38],
        rim: [251, 191, 36],
      },
      glow: {
        ink: [22, 8, 8],
        mid: [185, 28, 28],
        glow: [248, 113, 113],
        rim: [254, 243, 199],
      },
      chrome: {
        ink: [14, 10, 10],
        mid: [60, 36, 36],
        glow: [168, 120, 110],
        rim: [253, 230, 138],
      },
    },
  },
  chrome: {
    id: 'chrome',
    label: '铬灰',
    hint: '中性银 · 无彩色干扰',
    surface: 'dark',
    swatch: '#94A3B8',
    primary: '#CBD5E1',
    primarySoft: 'rgba(148, 163, 184, 0.16)',
    primaryBorder: 'rgba(148, 163, 184, 0.4)',
    bloomA: 'rgba(148, 163, 184, 0.12)',
    bloomB: 'rgba(71, 85, 105, 0.18)',
    bloomC: 'rgba(255, 255, 255, 0.04)',
    stageBg: '#050608',
    ultrathink: {
      ink: [10, 12, 16],
      sky: [203, 213, 225],
      klein: [100, 116, 139],
      mist: [248, 250, 252],
    },
    washes: {
      soft: {
        ink: [10, 12, 16],
        mid: [40, 45, 55],
        glow: [148, 163, 184],
        rim: [226, 232, 240],
      },
      mid: {
        ink: [8, 10, 14],
        mid: [50, 56, 68],
        glow: [203, 213, 225],
        rim: [241, 245, 249],
      },
      deep: {
        ink: [6, 8, 12],
        mid: [36, 40, 50],
        glow: [100, 116, 139],
        rim: [203, 213, 225],
      },
      glow: {
        ink: [10, 12, 16],
        mid: [70, 80, 95],
        glow: [226, 232, 240],
        rim: [255, 255, 255],
      },
      chrome: {
        ink: [8, 10, 14],
        mid: [32, 36, 44],
        glow: [148, 163, 184],
        rim: [248, 250, 252],
      },
    },
  },
  white: {
    id: 'white',
    label: '白瓷',
    hint: '冷灰台面 · 晶透玻璃',
    surface: 'light',
    swatch: '#F1F5F9',
    primary: '#15803D',
    primarySoft: 'rgba(21, 128, 61, 0.14)',
    primaryBorder: 'rgba(21, 128, 61, 0.42)',
    /* Saturated blooms so crystal glass has colour to refract (same job as dark packs) */
    bloomA: 'rgba(52, 211, 153, 0.5)',
    bloomB: 'rgba(45, 212, 191, 0.38)',
    bloomC: 'rgba(100, 116, 139, 0.4)',
    /* Cool mid-slate studio — panes must lift off the stage */
    stageBg: '#8FA0B5',
    ultrathink: {
      /* Canvas wash (not text): cool base + green shimmer under dark ink text */
      ink: [241, 245, 249],
      sky: [74, 222, 128],
      klein: [21, 128, 61],
      mist: [255, 255, 255],
    },
    /* Porcelain paints multiply over white glass — keep mid tones airy, not chalk */
    washes: {
      soft: {
        ink: [248, 250, 252],
        mid: [226, 232, 240],
        glow: [203, 213, 225],
        rim: [255, 255, 255],
      },
      mid: {
        ink: [240, 253, 244],
        mid: [187, 247, 208],
        glow: [134, 239, 172],
        rim: [255, 255, 255],
      },
      deep: {
        ink: [241, 245, 249],
        mid: [203, 213, 225],
        glow: [148, 163, 184],
        rim: [255, 255, 255],
      },
      glow: {
        ink: [236, 253, 245],
        mid: [167, 243, 208],
        glow: [52, 211, 153],
        rim: [255, 255, 255],
      },
      chrome: {
        ink: [248, 250, 252],
        mid: [226, 232, 240],
        glow: [203, 213, 225],
        rim: [255, 255, 255],
      },
    },
  },
};

/** Stable display order for switcher */
export const ACCENT_THEME_ORDER: AccentThemeId[] = [
  'ref123',
  'klein',
  'sky',
  'amber',
  'cinnabar',
  'chrome',
  'white',
];

export const ACCENT_THEME_LIST = ACCENT_THEME_ORDER.map((id) => ACCENT_THEMES[id]);

export const DEFAULT_ACCENT_THEME: AccentThemeId = 'ref123';
export const ACCENT_THEME_STORAGE_KEY = 'lingxi-accent-theme';

/** Legacy ids stored before 6-pack */
const LEGACY_THEME_MAP: Record<string, AccentThemeId> = {
  mint: 'ref123',
};

export function isAccentThemeId(value: string): value is AccentThemeId {
  return value in ACCENT_THEMES;
}

export function resolveAccentTheme(id: AccentThemeId | string | undefined): AccentTheme {
  if (id && isAccentThemeId(id)) return ACCENT_THEMES[id];
  if (id && id in LEGACY_THEME_MAP) return ACCENT_THEMES[LEGACY_THEME_MAP[id]];
  return ACCENT_THEMES[DEFAULT_ACCENT_THEME];
}

export function washForTheme(themeId: AccentThemeId, role: WashRole): WashPalette {
  return ACCENT_THEMES[themeId].washes[role];
}
