export const DEFAULT_PORTRAIT_BASE = 'https://testingcf.jsdelivr.net/gh/enfermilei/huayuan@main/portraits';
export const DEFAULT_PORTRAIT_EXT = 'png';

const Settings = z
  .object({
    showThoughts: z.boolean().prefault(true),
    enableEnterAnim: z.boolean().prefault(true),
    rosterPreferPresent: z.boolean().prefault(true),
    /** 安全模式：隐藏性事/裸体等 R18 立绘，回退到日常-普通 */
    safeMode: z.boolean().prefault(false),
  })
  .prefault({});

export type GardenUiSettings = z.infer<typeof Settings>;

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

  return { settings, reset };
});
