/** 顶部世界信息：天气 / 时段氛围分类（纯 CSS 图标类名，不用 emoji） */

export type WeatherKind = 'sunny' | 'cloudy' | 'overcast' | 'fog' | 'rain' | 'thunder' | 'snow' | 'wind';
export type PeriodKind = 'day' | 'evening' | 'night' | 'latenight';
export type TempKind = 'hot' | 'cold' | 'normal';
export type HeaderMood = 'mood-day' | 'mood-evening' | 'mood-night' | 'mood-latenight' | 'mood-storm';

export function classifyWeather(weatherStr: unknown): WeatherKind {
  const s = String(weatherStr || '');
  if (/雷|闪电|雷阵雨|雷暴|电闪/.test(s)) return 'thunder';
  if (/雪|冰雹|霜|霰/.test(s)) return 'snow';
  if (/暴雨|大雨|中雨|小雨|阵雨|细雨|毛毛雨|雨/.test(s)) return 'rain';
  if (/雾|霾|沙尘|扬沙/.test(s)) return 'fog';
  if (/风|台风|飓风|狂风|大风/.test(s)) return 'wind';
  if (/阴/.test(s)) return 'overcast';
  if (/云|多云|少云/.test(s)) return 'cloudy';
  if (/晴|烈日|骄阳|万里无云/.test(s)) return 'sunny';
  return 'cloudy';
}

/** 解析时段：优先读 系统.时段/时间 文案，其次用时钟小时 */
export function classifyPeriod(periodOrTime: unknown, clockTime?: unknown): PeriodKind {
  const s = `${periodOrTime ?? ''} ${clockTime ?? ''}`;
  if (/深夜|凌晨|午夜|半夜/.test(s)) return 'latenight';
  if (/夜|夜晚|夜间|晚上|晚间/.test(s)) return 'night';
  if (/傍晚|黄昏|日落|暮/.test(s)) return 'evening';
  if (/清晨|早晨|早上|上午|午后|下午|白天|日间|正午|中午/.test(s)) return 'day';

  const matched = s.match(/(\d{1,2})\s*[:：]/);
  const h = matched ? parseInt(matched[1], 10) : NaN;
  if (!isNaN(h)) {
    if (h < 5 || h >= 22) return 'latenight';
    if (h >= 18) return 'night';
    if (h >= 16) return 'evening';
    return 'day';
  }
  return 'day';
}

export function parseTempNumber(tempStr: unknown): number | null {
  const matched = String(tempStr || '').match(/-?\d+/);
  if (!matched) return null;
  const t = parseInt(matched[0], 10);
  return isNaN(t) ? null : t;
}

export function classifyTemp(tempStr: unknown): TempKind {
  const t = parseTempNumber(tempStr);
  if (t !== null && t >= 30) return 'hot';
  if (t !== null && t <= 15) return 'cold';
  return 'normal';
}

/** 0~1，供温标液柱高度使用（约 -5°~40° 映射） */
export function tempLevel(tempStr: unknown): number {
  const t = parseTempNumber(tempStr);
  if (t === null) return 0.45;
  return Math.min(1, Math.max(0.08, (t + 5) / 45));
}

export function headerMood(period: PeriodKind, weather: WeatherKind): HeaderMood {
  if (weather === 'thunder') return 'mood-storm';
  if (period === 'latenight') return 'mood-latenight';
  if (period === 'night') return 'mood-night';
  if (period === 'evening') return 'mood-evening';
  return 'mood-day';
}

/** 星期圆点位置 0=周一 … 6=周日 */
export function weekIndex(weekStr: unknown): number {
  const map: Record<string, number> = {
    周一: 0,
    星期一: 0,
    周二: 1,
    星期二: 1,
    周三: 2,
    星期三: 2,
    周四: 3,
    星期四: 3,
    周五: 4,
    星期五: 4,
    周六: 5,
    星期六: 5,
    周日: 6,
    星期日: 6,
    周天: 6,
  };
  const s = String(weekStr || '').trim();
  if (s in map) return map[s];
  const m = s.match(/[一二三四五六日天]/);
  if (!m) return 0;
  const idx = '一二三四五六日天'.indexOf(m[0]);
  return idx >= 6 ? 6 : Math.max(0, idx);
}

export function isWeekend(weekStr: unknown): boolean {
  const i = weekIndex(weekStr);
  return i === 5 || i === 6;
}

/** 时段中文短标，用于 TIME 胶囊副文案 */
export function periodLabel(period: PeriodKind): string {
  switch (period) {
    case 'evening':
      return '傍晚';
    case 'night':
      return '夜晚';
    case 'latenight':
      return '深夜';
    default:
      return '日间';
  }
}
