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
  if (main === '日常' && sub === '困惑') sub = '疑惑';
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

/** 性事全系列 + 裸体服装视为 R18，安全模式下隐藏 */
export function isR18Portrait(portraitState: unknown): boolean {
  const { 主类型, 次类型 } = normalizePortraitState(portraitState);
  if (主类型 === '性事') return true;
  if (主类型 === '服装' && 次类型 === '裸体') return true;
  return false;
}

/** 安全模式回退目标：日常-普通-1 */
export const SAFE_PORTRAIT_STATE: PortraitState = {
  主类型: '日常',
  次类型: '普通',
  差分序号: '1',
};

/** 文件名次类型别名：规范名 → 仓库里可能存在的实际文件名 */
const FILE_SUB_ALIASES: Partial<Record<PortraitMain, Record<string, readonly string[]>>> = {
  日常: {
    普通: ['普通', '正常'],
    疑惑: ['疑惑', '困惑'],
  },
};

/** 官方 CDN 源；jsDelivr @main 对新推送文件可能延迟，raw 作回退 */
export const PORTRAIT_CDN_BASES = [
  'https://testingcf.jsdelivr.net/gh/enfermilei/huayuan@main/portraits',
  'https://cdn.jsdelivr.net/gh/enfermilei/huayuan@main/portraits',
  'https://raw.githubusercontent.com/enfermilei/huayuan/main/portraits',
] as const;

/** 不含扩展名的文件名主干（含「普通/正常」「疑惑/困惑」等文件命名变体） */
export function portraitFileStemVariants(name: string, portraitState: unknown): string[] {
  const character = String(name || '').trim();
  if (!character) return [];

  const { 主类型, 次类型, 差分序号 } = normalizePortraitState(portraitState);
  const subs = FILE_SUB_ALIASES[主类型]?.[次类型] ?? [次类型];
  const stems = subs.map(sub => `${character}-${主类型}-${sub}-${差分序号}`);
  return [...new Set(stems)];
}

export function buildPortraitUrl(
  name: string,
  portraitState: unknown,
  options: { baseUrl?: string; ext?: string; stem?: string } = {},
): string | null {
  const base = String(options.baseUrl || '')
    .trim()
    .replace(/\/+$/, '');
  if (!base) return null;

  const character = String(name || '').trim();
  if (!character) return null;

  const ext = String(options.ext || 'png').replace(/^\./, '') || 'png';
  const stem = String(options.stem || portraitFileStem(character, portraitState)).trim();
  if (!stem) return null;
  // 资源约定：portraits/{角色名}/{角色名}-{主类型}-{次类型}-{差分}.ext
  return `${base}/${encodeURIComponent(character)}/${encodeURIComponent(stem)}.${ext}`;
}

/** 按「文件名变体 × CDN 源」展开候选 URL，供加载失败时依次尝试 */
export function buildPortraitUrlCandidates(
  name: string,
  portraitState: unknown,
  options: { baseUrls?: readonly string[]; ext?: string } = {},
): string[] {
  const bases = (options.baseUrls?.length ? options.baseUrls : PORTRAIT_CDN_BASES)
    .map(b =>
      String(b || '')
        .trim()
        .replace(/\/+$/, ''),
    )
    .filter(Boolean);
  const stems = portraitFileStemVariants(name, portraitState);
  const urls: string[] = [];
  for (const stem of stems) {
    for (const base of bases) {
      const url = buildPortraitUrl(name, portraitState, { baseUrl: base, ext: options.ext, stem });
      if (url) urls.push(url);
    }
  }
  return [...new Set(urls)];
}
