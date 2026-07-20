/** 立绘文件名：`角色名-主类型-次类型-差分序号`，如 `小明-日常-普通-1` */

export const PORTRAIT_MAINS = ['日常', '服装', '性事'] as const;
export type PortraitMain = (typeof PORTRAIT_MAINS)[number];

export const PORTRAIT_SUBS: Record<PortraitMain, readonly string[]> = {
  日常: ['普通', '高兴', '伤心', '哭泣', '疑惑', '嘲讽'],
  服装: ['常服', '女仆装', '水手服', '裸体'],
  性事: ['足交', '口交', '手交', '后入', '正常位', '悬吊后背式'],
};

export const PORTRAIT_SUB_FALLBACK: Record<PortraitMain, string> = {
  日常: '普通',
  服装: '常服',
  性事: '正常位',
};

export type PortraitState = {
  主类型: PortraitMain;
  次类型: string;
  差分序号: '1' | '2';
};

export function normalizePortraitState(portraitState: unknown): PortraitState {
  const raw =
    typeof portraitState === 'object' && portraitState !== null ? (portraitState as Record<string, unknown>) : {};

  let main = String(raw.主类型 || '日常') as PortraitMain;
  if (!PORTRAIT_MAINS.includes(main)) main = '日常';

  let sub = String(raw.次类型 || '').trim();
  if (main === '日常' && sub === '正常') sub = '普通';
  if (main === '服装' && sub === '校服') sub = '水手服';
  if (!PORTRAIT_SUBS[main].includes(sub)) sub = PORTRAIT_SUB_FALLBACK[main];

  const diffRaw = String(raw.差分序号 || '1');
  const diff: '1' | '2' = diffRaw === '2' ? '2' : '1';

  return { 主类型: main, 次类型: sub, 差分序号: diff };
}

/** 不含扩展名的文件名主干 */
export function portraitFileStem(name: string, portraitState: unknown): string {
  const { 主类型, 次类型, 差分序号 } = normalizePortraitState(portraitState);
  return `${name}-${主类型}-${次类型}-${差分序号}`;
}

export function buildPortraitUrl(
  name: string,
  portraitState: unknown,
  options: { baseUrl?: string; ext?: string } = {},
): string | null {
  const base = String(options.baseUrl || '')
    .trim()
    .replace(/\/+$/, '');
  if (!base) return null;

  const ext = String(options.ext || 'png').replace(/^\./, '') || 'png';
  const stem = portraitFileStem(name, portraitState);
  return `${base}/${encodeURIComponent(stem)}.${ext}`;
}
