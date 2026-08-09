import {
  DEFAULT_THEME_ACCENT,
  THEME_PRESET_IDS,
  presetMode,
  resolveThemeTokens,
  themeTokensToCssVars,
  type ThemePresetId,
} from './theme';

export const DEFAULT_PORTRAIT_BASE = 'https://testingcf.jsdelivr.net/gh/enfermilei/huayuan@main/portraits';
export const DEFAULT_PORTRAIT_EXT = 'png';

const HexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .catch(DEFAULT_THEME_ACCENT);

const Settings = z
  .object({
    showThoughts: z.boolean().prefault(true),
    enableEnterAnim: z.boolean().prefault(true),
    rosterPreferPresent: z.boolean().prefault(true),
    /** 安全模式：隐藏性事/裸体等 R18 立绘，回退到日常-普通 */
    safeMode: z.boolean().prefault(false),
    /** 主题预设；custom 时使用 themeAccent / themeDark */
    themePreset: z.enum(THEME_PRESET_IDS).catch('peach').prefault('peach'),
    /** 自定义主色（仅 themePreset=custom 时生效） */
    themeAccent: HexColor.prefault(DEFAULT_THEME_ACCENT),
    /** 自定义主题是否使用暗色底 */
    themeDark: z.boolean().prefault(false),
  })
  .prefault({});

export type GardenUiSettings = z.infer<typeof Settings>;

export function resolveThemeCssVars(
  settings: Pick<GardenUiSettings, 'themePreset' | 'themeAccent' | 'themeDark'>,
) {
  return themeTokensToCssVars(
    resolveThemeTokens(settings.themePreset as ThemePresetId, settings.themeAccent, settings.themeDark),
  );
}

export function resolveThemeMode(
  settings: Pick<GardenUiSettings, 'themePreset' | 'themeDark'>,
) {
  return presetMode(settings.themePreset as ThemePresetId, settings.themeDark);
}

export const useSettingsStore = defineStore('garden-ui-settings', () => {
  const settings = useLocalStorage<GardenUiSettings>('garden-mvu:ui-settings', Settings.parse({}), {
    // 读写时各校验一次，避免 deep watch 写回自身造成死循环卡死
    serializer: {
      read: raw => {
        try {
          return Settings.parse(JSON.parse(raw));
        } catch {
          return Settings.parse({});
        }
      },
      write: value => JSON.stringify(Settings.parse(value)),
    },
  });

  // 启动时纠正一次历史脏数据即可，不要再 watch 写回
  settings.value = Settings.parse(settings.value);

  function reset() {
    settings.value = Settings.parse({});
  }

  function setThemePreset(preset: ThemePresetId) {
    settings.value.themePreset = preset;
  }

  function setThemeAccent(accent: string) {
    const parsed = HexColor.safeParse(accent);
    settings.value.themeAccent = parsed.success ? parsed.data : DEFAULT_THEME_ACCENT;
    settings.value.themePreset = 'custom';
  }

  function setThemeDark(dark: boolean) {
    settings.value.themeDark = dark;
    settings.value.themePreset = 'custom';
  }

  return { settings, reset, setThemePreset, setThemeAccent, setThemeDark };
});
