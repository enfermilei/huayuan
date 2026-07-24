import { portraitFileStem } from './portrait';

const DB_NAME = 'garden-mvu-portraits';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export type CustomPortraitMeta = {
  stem: string;
  character: string;
  updatedAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 打开失败'));
  });
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 操作失败'));
  });
}

async function idbGetAll(): Promise<{ key: string; blob: Blob }[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const keys = (await idbRequest(store.getAllKeys())) as IDBValidKey[];
    const out: { key: string; blob: Blob }[] = [];
    for (const key of keys) {
      const stem = String(key);
      const blob = await idbRequest(store.get(key));
      if (blob instanceof Blob) out.push({ key: stem, blob });
    }
    return out;
  } finally {
    db.close();
  }
}

async function idbPut(stem: string, blob: Blob): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await idbRequest(tx.objectStore(STORE_NAME).put(blob, stem));
  } finally {
    db.close();
  }
}

async function idbDelete(stem: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await idbRequest(tx.objectStore(STORE_NAME).delete(stem));
  } finally {
    db.close();
  }
}

/** 压缩立绘，控制 IndexedDB 体积（目标约 832×1216） */
export async function compressPortraitBlob(file: Blob, maxW = 832, maxH = 1216, quality = 0.88): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 canvas');
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('图片压缩失败'))), 'image/jpeg', quality);
    });
    return blob;
  } finally {
    bitmap.close();
  }
}

export function buildOverrideStem(character: string, portraitState: unknown): string {
  return portraitFileStem(character, portraitState);
}

export const useCustomPortraitsStore = defineStore('garden-custom-portraits', () => {
  /** stem → object URL */
  const urls = reactive<Record<string, string>>({});
  const ready = ref(false);
  /** 变更计数：供 resolvePortrait / computed 建立依赖 */
  const revision = ref(0);

  function touch() {
    revision.value += 1;
  }

  function revoke(stem: string) {
    const prev = urls[stem];
    if (prev) {
      URL.revokeObjectURL(prev);
      delete urls[stem];
    }
  }

  async function init() {
    try {
      const entries = await idbGetAll();
      for (const { key, blob } of entries) {
        revoke(key);
        urls[key] = URL.createObjectURL(blob);
      }
      console.info(`[花园状态栏] 已加载自定义立绘 ${entries.length} 张`);
    } catch (error) {
      console.warn('[花园状态栏] 自定义立绘加载失败', error);
    } finally {
      ready.value = true;
      touch();
    }
  }

  async function upsert(stem: string, file: Blob) {
    const character = String(stem.split('-')[0] || '').trim();
    if (!stem || !character) throw new Error('立绘键名无效');

    const compressed = await compressPortraitBlob(file);
    await idbPut(stem, compressed);
    revoke(stem);
    urls[stem] = URL.createObjectURL(compressed);
    touch();
    console.info(`[花园状态栏] 已保存自定义立绘: ${stem}`);
  }

  async function upsertFor(character: string, portraitState: unknown, file: Blob) {
    const stem = buildOverrideStem(character, portraitState);
    await upsert(stem, file);
    return stem;
  }

  async function remove(stem: string) {
    await idbDelete(stem);
    revoke(stem);
    touch();
    console.info(`[花园状态栏] 已删除自定义立绘: ${stem}`);
  }

  async function clearAll() {
    const stems = Object.keys(urls);
    for (const stem of stems) {
      await idbDelete(stem);
      revoke(stem);
    }
    touch();
  }

  const list = computed<CustomPortraitMeta[]>(() =>
    Object.keys(urls)
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
      .map(stem => ({
        stem,
        character: stem.split('-')[0] || stem,
        updatedAt: 0,
      })),
  );

  return { urls, ready, revision, list, init, upsert, upsertFor, remove, clearAll };
});
