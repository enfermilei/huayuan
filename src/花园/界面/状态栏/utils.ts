import { buildPortraitUrl, normalizePortraitState, portraitFileStem } from './portrait';
import { useSettingsStore } from './settings';

export function formatMoney(n: unknown): string {
  const num = Number(n) || 0;
  return `￥${num.toLocaleString('en-US')}`;
}

export function toPercent(v: unknown): number {
  return _.clamp((Number(v) || 0) + 100, 0, 200) / 2;
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
 * 立绘 URL：`{portraitBaseUrl}/{角色名}/{角色名-主类型-次类型-差分}.{ext}`
 * 未配置基址时返回 placehold（文案为期望文件名，便于对照资源）
 */
export function resolvePortrait(
  name: string,
  portraitState: unknown,
  size: 'card' | 'full' = 'card',
  options?: { baseUrl?: string; ext?: string },
): string {
  let baseUrl = String(options?.baseUrl ?? '').trim();
  let ext = String(options?.ext ?? '').trim();

  // options 里若传了空串（历史 localStorage），仍回退到设置默认值
  if (!baseUrl || !ext) {
    try {
      const store = useSettingsStore();
      if (!baseUrl) baseUrl = String(store.settings.portraitBaseUrl || '');
      if (!ext) ext = String(store.settings.portraitExt || 'png');
    } catch {
      /* pinia 未就绪 */
    }
  }

  const real = buildPortraitUrl(name, portraitState, { baseUrl, ext: ext || 'png' });
  if (real) return real;

  const state = normalizePortraitState(portraitState);
  const stem = portraitFileStem(name, state);
  const dim = size === 'full' ? '420x700' : '300x500';
  return `https://placehold.co/${dim}/FFD4C2/6B5548?text=${encodeURIComponent(stem)}`;
}

export function asRecord(value: unknown): Record<string, any> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}
