import { normalizePortraitState, type PortraitState } from './portrait';

const LockEntry = z.object({
  主类型: z.enum(['日常', '服装', '性事']),
  次类型: z.string(),
  差分序号: z.enum(['1', '2']),
  lockedAt: z.number().optional(),
});

const LocksSchema = z.record(z.string(), LockEntry).prefault({});

export type PortraitLockEntry = z.infer<typeof LockEntry>;

export const usePortraitLocksStore = defineStore('garden-portrait-locks', () => {
  const locks = useLocalStorage<Record<string, PortraitLockEntry>>(
    'garden-mvu:portrait-locks',
    {},
    {
      serializer: {
        read: raw => {
          try {
            return LocksSchema.parse(JSON.parse(raw));
          } catch {
            return {};
          }
        },
        write: value => JSON.stringify(LocksSchema.parse(value)),
      },
    },
  );

  locks.value = LocksSchema.parse(locks.value);

  const revision = ref(0);

  function touch() {
    revision.value += 1;
  }

  function isLocked(name: string): boolean {
    return Boolean(locks.value[String(name || '').trim()]);
  }

  function getLock(name: string): PortraitState | null {
    const entry = locks.value[String(name || '').trim()];
    return entry ? normalizePortraitState(entry) : null;
  }

  function lock(name: string, portraitState: unknown) {
    const character = String(name || '').trim();
    if (!character) throw new Error('角色名无效');
    const state = normalizePortraitState(portraitState);
    locks.value = {
      ...locks.value,
      [character]: { ...state, lockedAt: Date.now() },
    };
    touch();
    console.info(`[花园状态栏] 已锁定立绘: ${character} → ${state.主类型}-${state.次类型}-${state.差分序号}`);
  }

  function unlock(name: string) {
    const character = String(name || '').trim();
    if (!character || !locks.value[character]) return;
    const next = { ...locks.value };
    delete next[character];
    locks.value = next;
    touch();
    console.info(`[花园状态栏] 已解锁立绘: ${character}`);
  }

  function clearAll() {
    locks.value = {};
    touch();
  }

  const list = computed(() =>
    Object.entries(locks.value)
      .map(([name, state]) => ({
        name,
        state: normalizePortraitState(state),
        lockedAt: state.lockedAt || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
  );

  return { locks, revision, list, isLocked, getLock, lock, unlock, clearAll };
});
