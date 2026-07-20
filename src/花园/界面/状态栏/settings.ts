const Settings = z
  .object({
    showThoughts: z.boolean().prefault(true),
    enableEnterAnim: z.boolean().prefault(true),
    rosterPreferPresent: z.boolean().prefault(true),
    /** 立绘资源目录；文件名：`角色名-主类型-次类型-差分.ext`。本地开发可改回 http://127.0.0.1:5500/portraits */
    portraitBaseUrl: z
      .string()
      .prefault('https://testingcf.jsdelivr.net/gh/enfermilei/huayuan@main/portraits'),
    /** 立绘扩展名，不含点，默认 png */
    portraitExt: z.string().prefault('png'),
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
