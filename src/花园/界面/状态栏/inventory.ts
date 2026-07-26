export type InvItem = {
  name: string;
  desc: string;
  count: number;
};

export type InvCategory = '文件' | '钥匙' | '消耗' | '装备' | '贵重' | '其他';

export const INV_CATEGORIES: InvCategory[] = ['文件', '钥匙', '消耗', '装备', '贵重', '其他'];

const CATEGORY_RULES: { cat: InvCategory; re: RegExp }[] = [
  { cat: '文件', re: /文件|报告|档案|合同|情报|纸条|信件|书信|笔记|名册|清单|图纸/ },
  { cat: '钥匙', re: /钥匙|门禁|通行|证件|工牌|卡密|密码器|遥控器/ },
  { cat: '消耗', re: /药|针剂|饮料|食物|补给|恢复|绷带|血清|零食|酒/ },
  { cat: '装备', re: /武器|装备|工具|通讯|耳机|枪|刀|绳|手铐|面具|手套|耳机/ },
  { cat: '贵重', re: /金条|宝石|支票|现金|贵重|戒指|项链|钻石|古董|筹码/ },
];

export function parseInventory(raw: unknown): InvItem[] {
  const bag = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  return Object.entries(bag)
    .map(([name, d]) => {
      const count = Number(_.get(d, '数量', 0)) || 0;
      if (count <= 0) return null;
      return {
        name,
        desc: String(_.get(d, '描述', '无描述') || '无描述'),
        count,
      };
    })
    .filter((item): item is InvItem => item !== null)
    .sort((a, b) => {
      const ia = Number(isImportant(a));
      const ib = Number(isImportant(b));
      if (ia !== ib) return ib - ia;
      return a.name.localeCompare(b.name, 'zh-CN');
    });
}

export function categorizeItem(item: InvItem): InvCategory {
  const text = `${item.name} ${item.desc}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.re.test(text)) return rule.cat;
  }
  return '其他';
}

export function isImportant(item: InvItem): boolean {
  return /机密|重要|紧急|钥匙|合同|密码|核心|绝密|禁/.test(`${item.name}${item.desc}`);
}

export function categoryGlyph(cat: InvCategory): string {
  switch (cat) {
    case '文件':
      return '文';
    case '钥匙':
      return '钥';
    case '消耗':
      return '耗';
    case '装备':
      return '装';
    case '贵重':
      return '贵';
    default:
      return '物';
  }
}

export function formatCount(count: number): string {
  if (count > 99) return '99+';
  return String(count);
}

export function inventorySummary(items: InvItem[]): { kinds: number; stacks: number; important: number } {
  return {
    kinds: items.length,
    stacks: items.reduce((sum, item) => sum + item.count, 0),
    important: items.filter(isImportant).length,
  };
}
