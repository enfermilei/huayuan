import { useCustomPortraitsStore } from './customPortraits';
import {
  buildPortraitUrl,
  isR18Portrait,
  normalizePortraitState,
  portraitFileStem,
  SAFE_PORTRAIT_STATE,
} from './portrait';
import { usePortraitLocksStore } from './portraitLocks';
import { DEFAULT_PORTRAIT_BASE, DEFAULT_PORTRAIT_EXT, useSettingsStore } from './settings';

export function formatMoney(n: unknown): string {
  const num = Number(n) || 0;
  return `￥${num.toLocaleString('en-US')}`;
}

/** 好感/忠诚数值为 -100~100；进度条按 0~100 展示（与数字观感一致，负值用绝对值） */
export function toPercent(v: unknown): number {
  return _.clamp(Math.abs(Number(v) || 0), 0, 100);
}

export function statusDotClass(statusStr: unknown): '' | 'warn' | 'danger' {
  const s = String(statusStr || '');
  if (/危机|亏损|停业|倒闭|关闭|严重|恶化|暴跌|查封/.test(s)) return 'danger';
  if (/紧张|警惕|波动|下滑|下降|异常|冷清|萧条|观望/.test(s)) return 'warn';
  return '';
}

export function tempClass(tempStr: unknown): 'text-temp-hot' | 'text-temp-cold' | 'text-temp-normal' {
  const matched = String(tempStr || '').match(/-?\d+/);
  const t = matched ? parseInt(matched[0], 10) : NaN;
  if (!isNaN(t) && t >= 30) return 'text-temp-hot';
  if (!isNaN(t) && t <= 15) return 'text-temp-cold';
  return 'text-temp-normal';
}

export function timeIconClass(timeStr: unknown): 't-day' | 't-evening' | 't-night' {
  const s = String(timeStr || '');
  if (/深夜|凌晨/.test(s)) return 't-night';
  const matched = s.match(/(\d{1,2})\s*[:：]/);
  const h = matched ? parseInt(matched[1], 10) : NaN;
  if (!isNaN(h)) {
    if (h >= 18 || h < 5) return 't-night';
    if (h >= 16) return 't-evening';
    return 't-day';
  }
  if (/夜|深夜|凌晨/.test(s)) return 't-night';
  if (/傍晚|黄昏/.test(s)) return 't-evening';
  return 't-day';
}

export function weatherIconClass(weatherStr: unknown): 'w-sunny' | 'w-cloudy' | 'w-rain' {
  const s = String(weatherStr || '');
  if (/雷|雨|暴/.test(s)) return 'w-rain';
  if (/云|阴|雾/.test(s)) return 'w-cloudy';
  if (/晴/.test(s)) return 'w-sunny';
  return 'w-cloudy';
}

export function isPresent(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

/**
 * 立绘 URL 优先级：
 * 1. 本机锁定立绘（忽略 MVU 当前立绘状态）
 * 2. 安全模式且为 R18 → 强制回退日常-普通-1
 * 3. 本机自定义立绘（IndexedDB）
 * 4. 官方 CDN `{base}/{角色名}/{stem}.png`
 * 5. placehold 占位
 */
export function resolvePortrait(
  name: string,
  portraitState: unknown,
  size: 'card' | 'full' = 'card',
): string {
  let safeMode = false;
  try {
    const settings = useSettingsStore();
    safeMode = Boolean(settings.settings.safeMode);
  } catch {
    /* pinia 未就绪 */
  }

  let effectiveState = portraitState;
  try {
    const locks = usePortraitLocksStore();
    void locks.revision;
    const locked = locks.getLock(name);
    if (locked) effectiveState = locked;
  } catch {
    /* pinia 未就绪 */
  }

  let customUrls: Record<string, string> = {};
  try {
    const custom = useCustomPortraitsStore();
    void custom.revision;
    customUrls = custom.urls;
  } catch {
    /* pinia 未就绪 */
  }

  const originalR18 = isR18Portrait(effectiveState);
  const state =
    safeMode && originalR18 ? SAFE_PORTRAIT_STATE : normalizePortraitState(effectiveState);
  const stem = portraitFileStem(name, state);

  const custom = customUrls[stem];
  if (custom) return custom;

  const real = buildPortraitUrl(name, state, {
    baseUrl: DEFAULT_PORTRAIT_BASE,
    ext: DEFAULT_PORTRAIT_EXT,
  });
  if (real) return real;

  const dim = size === 'full' ? '420x700' : '300x500';
  const label = safeMode && originalR18 ? '安全模式' : stem;
  return `https://placehold.co/${dim}/FFD4C2/6B5548?text=${encodeURIComponent(label)}`;
}

export function asRecord(value: unknown): Record<string, any> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}
