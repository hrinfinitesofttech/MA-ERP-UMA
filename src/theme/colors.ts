// Live, user-switchable colour tokens.
// `colors` is a single mutable object: applyTheme() rewrites its values and bumps
// `themeVersion`, and every themed stylesheet (see themedStyles.ts) re-resolves lazily.

export interface Palette {
  header: string; // top bars, login & hero surfaces
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  border: string;
  borderLight: string;
  borderDark: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  success: string;
  successLight: string;
  successBorder: string;
  warning: string;
  warningLight: string;
  warningBorder: string;
  danger: string;
  dangerLight: string;
  dangerBorder: string;
  purple: string;
  purpleLight: string;
  purpleBorder: string;
  bronze: string;
  bronzeLight: string;
}

const LIGHT_BASE: Palette = {
  header: '#112F5C',
  primary: '#17407A',
  primaryDark: '#0E2B55',
  primaryLight: '#3F6FB5',
  primarySubtle: '#E6EEF8',
  accent: '#ED7D31',
  accentLight: '#FDEDE0',
  accentDark: '#BF5A18',
  background: '#F5F3EE',
  surface: '#FFFFFF',
  surfaceSubtle: '#EFECE5',
  border: '#E4E0D6',
  borderLight: '#EFECE5',
  borderDark: '#CFCABD',
  textPrimary: '#151A27',
  textSecondary: '#4B5365',
  textMuted: '#8A8F9C',
  textInverse: '#FFFFFF',
  success: '#17875B',
  successLight: '#E6F5EE',
  successBorder: '#B5E3CC',
  warning: '#B7791F',
  warningLight: '#FDF4DF',
  warningBorder: '#F2DC9F',
  danger: '#C8372D',
  dangerLight: '#FCEBE9',
  dangerBorder: '#F3C2BD',
  purple: '#6D4BC9',
  purpleLight: '#F0ECFB',
  purpleBorder: '#D7CCF3',
  bronze: '#9C6538',
  bronzeLight: '#F8EEE3',
};

const DARK_BASE: Palette = {
  ...LIGHT_BASE,
  header: '#151C31',
  primary: '#3D5BC4',
  primaryDark: '#2A4099',
  primaryLight: '#7C96F0',
  primarySubtle: '#232E4F',
  accent: '#F28A4A',
  accentLight: '#3A2A20',
  accentDark: '#FFB27F',
  background: '#0E1320',
  surface: '#182033',
  surfaceSubtle: '#222B42',
  border: '#2C3652',
  borderLight: '#222B42',
  borderDark: '#3A4668',
  textPrimary: '#EEF1F8',
  textSecondary: '#B3BBCF',
  textMuted: '#808AA3',
  success: '#3DCB93',
  successLight: '#12332A',
  successBorder: '#1F5A46',
  warning: '#E5A93C',
  warningLight: '#3A2E12',
  warningBorder: '#5E4A1C',
  danger: '#F2675D',
  dangerLight: '#3B1B1B',
  dangerBorder: '#5E2B2B',
  purple: '#A48BF0',
  purpleLight: '#2A2347',
  purpleBorder: '#42386E',
  bronze: '#D49A66',
  bronzeLight: '#33261B',
};

export type ThemeId = 'forge' | 'ocean' | 'forest' | 'royal' | 'midnight';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  dark: boolean;
  palette: Palette;
  /** Swatch colours shown in the picker: [header, accent, background]. */
  swatch: [string, string, string];
}

const light = (overrides: Partial<Palette>): Palette => ({ ...LIGHT_BASE, header: overrides.primary ?? LIGHT_BASE.header, ...overrides });

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'forge', name: 'Forge', dark: false, palette: LIGHT_BASE, swatch: ['#112F5C', '#ED7D31', '#F5F3EE'] },
  {
    id: 'ocean',
    name: 'Ocean',
    dark: false,
    palette: light({
      primary: '#0B3C5D',
      primaryDark: '#062A42',
      primaryLight: '#2F7FB0',
      primarySubtle: '#E3EFF6',
      accent: '#119DA4',
      accentLight: '#DDF3F4',
      accentDark: '#0B7A80',
      background: '#F1F6F8',
      surfaceSubtle: '#E6EEF2',
      border: '#D9E3E8',
      borderLight: '#E6EEF2',
    }),
    swatch: ['#0B3C5D', '#119DA4', '#F1F6F8'],
  },
  {
    id: 'forest',
    name: 'Forest',
    dark: false,
    palette: light({
      primary: '#173A2E',
      primaryDark: '#0E2820',
      primaryLight: '#3B7C63',
      primarySubtle: '#E4F0EA',
      accent: '#C98A1B',
      accentLight: '#F8EDD4',
      accentDark: '#9A6710',
      background: '#F4F5EE',
      surfaceSubtle: '#ECEEE3',
      border: '#DEE1D2',
      borderLight: '#ECEEE3',
    }),
    swatch: ['#173A2E', '#C98A1B', '#F4F5EE'],
  },
  {
    id: 'royal',
    name: 'Royal',
    dark: false,
    palette: light({
      primary: '#2B1B5A',
      primaryDark: '#1B1040',
      primaryLight: '#6A4FC0',
      primarySubtle: '#ECE8F8',
      accent: '#D63C75',
      accentLight: '#FBE5EE',
      accentDark: '#A82658',
      background: '#F7F5FA',
      surfaceSubtle: '#EFEBF5',
      border: '#E2DDEB',
      borderLight: '#EFEBF5',
    }),
    swatch: ['#2B1B5A', '#D63C75', '#F7F5FA'],
  },
  { id: 'midnight', name: 'Midnight', dark: true, palette: DARK_BASE, swatch: ['#151C31', '#F28A4A', '#0E1320'] },
];

export const ACCENT_SWATCHES = ['#ED7D31', '#119DA4', '#D63C75', '#C98A1B', '#3B7C63', '#4F6EF0', '#8A4FD0', '#D94545'];

export const colors: Palette = { ...LIGHT_BASE };

let version = 0;
export const getThemeVersion = () => version;

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const mix = (a: string, b: string, weightB: number): string => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const f = (x: number, y: number) => Math.round(x * (1 - weightB) + y * weightB);
  return `#${[f(r1, r2), f(g1, g2), f(b1, b2)].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
};

/** Apply a preset, optionally overriding the accent colour. */
export const applyTheme = (themeId: ThemeId, accentOverride?: string | null) => {
  const preset = THEME_PRESETS.find((t) => t.id === themeId) ?? THEME_PRESETS[0];
  const next: Palette = { ...preset.palette };

  if (accentOverride) {
    next.accent = accentOverride;
    next.accentLight = preset.dark ? mix(preset.palette.surface, accentOverride, 0.22) : mix('#FFFFFF', accentOverride, 0.14);
    next.accentDark = preset.dark ? mix(accentOverride, '#FFFFFF', 0.35) : mix(accentOverride, '#000000', 0.3);
  }

  Object.assign(colors, next);
  version += 1;
};
