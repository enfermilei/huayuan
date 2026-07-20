export const Schema = z.object({
  系统: z
    .object({
      日期: z.string().prefault('第1天'),
      时间: z.string().prefault('8:00'),
      星期: z.enum(['周一', '周二', '周三', '周四', '周五', '周六', '周日']).prefault('周一'),
      天气: z.string().prefault('晴天'),
      温度: z.string().prefault('21°'),
      组织全局: z
        .object({
          总资金: z.coerce.number().prefault(0),
          组织声望: z.coerce.number().prefault(0),
          近期事务: z
            .record(
              z.string().describe('近期事务名'),
              z
                .object({
                  描述: z.string().prefault('无'),
                  时间: z.string().describe('如XX年X月X日-XX年X月X日').prefault('未知'),
                  涉及部门或职务: z.string().prefault('无'),
                  距离开始时间: z.string().prefault('未知'),
                  距离结束时间: z.string().prefault('未知'),
                })
                .prefault({}),
            )
            .prefault({}),
          近期大型活动: z
            .record(
              z.string().describe('近期大型活动名'),
              z
                .object({
                  描述: z.string().prefault('无'),
                  时间: z.string().describe('如XX年X月X日-XX年X月X日').prefault('未知'),
                  涉及部门或职务: z.string().prefault('无'),
                  距离开始时间: z.string().prefault('未知'),
                  距离结束时间: z.string().prefault('未知'),
                })
                .prefault({}),
            )
            .prefault({}),
        })
        .prefault({}),
      金缕赌场: z
        .object({
          经营状况: z.string().describe('赌场近期的运营情况描述').prefault('正常运营'),
          本周收益: z.coerce.number().prefault(0),
        })
        .prefault({}),
      迷迭香酒馆: z
        .object({
          经营状况: z.string().describe('酒馆及情报交易的运营情况').prefault('正常运营'),
          本周收益: z.coerce.number().prefault(0),
        })
        .prefault({}),
    })
    .prefault({}),

  成员名册: z
    .record(
      z.string().describe('成员姓名'),
      z
        .object({
          年龄: z.coerce.number().prefault(0),
          职务: z.string().describe('在花园组织中的职位').prefault('待初始化'),
          当前位置: z.string().prefault('待初始化'),
          贡献度: z.coerce.number().prefault(0),
          资金: z.coerce.number().prefault(0),
          好感度: z.coerce
            .number()
            .prefault(0)
            .transform(v => _.clamp(v, -100, 100)),
          忠诚度: z.coerce
            .number()
            .prefault(0)
            .transform(v => _.clamp(v, -100, 100)),
          短期目标: z.string().prefault('无'),
          中期目标: z.string().prefault('无'),
          之后行程: z.string().prefault('无'),
          身体状况: z
            .object({
              总体: z.string().prefault('正常'),
              口: z.string().prefault('正常'),
              胸: z.string().prefault('正常'),
              小穴: z.string().prefault('正常'),
              足: z.string().prefault('正常'),
              后庭: z.string().prefault('正常'),
            })
            .prefault({}),
          内心想法: z.string().prefault('无'),
          着装: z
            .object({
              上衣: z.string().prefault('待初始化'),
              下装: z.string().prefault('待初始化'),
              袜: z.string().prefault('待初始化'),
              鞋: z.string().prefault('待初始化'),
              配饰: z.string().prefault('待初始化'),
            })
            .prefault({}),
          是否怀孕: z.boolean().prefault(false),
          立绘状态: z
            .object({
              主类型: z.enum(['日常', '服装', '性事']).prefault('日常'),
              次类型: z.string().prefault('普通'),
              差分序号: z.enum(['1', '2']).prefault('1'),
            })
            .transform(data => {
              const main = data.主类型;
              let sub = String(data.次类型 || '').trim();
              // 常见别名：示例「正常」→「普通」；「校服」→「水手服」
              if (main === '日常' && sub === '正常') sub = '普通';
              if (main === '服装' && sub === '校服') sub = '水手服';

              const allowed: Record<typeof main, string[]> = {
                日常: ['普通', '高兴', '伤心', '哭泣', '疑惑', '嘲讽'],
                服装: ['常服', '女仆装', '水手服', '裸体'],
                性事: ['足交', '口交', '手交', '后入', '正常位', '悬吊后背式'],
              };
              const fallback: Record<typeof main, string> = {
                日常: '普通',
                服装: '常服',
                性事: '正常位',
              };
              if (!allowed[main].includes(sub)) sub = fallback[main];

              return { ...data, 次类型: sub };
            })
            .prefault({}),
          是否在场: z.boolean().prefault(false),
          背包物品: z
            .record(
              z.string().describe('物品名'),
              z.object({
                描述: z.string().prefault('未描述物品'),
                数量: z.coerce.number().prefault(1),
              }),
            )
            .prefault({})
            .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
        })
        .prefault({}),
    )
    .prefault({}),

  主角: z
    .object({
      职务: z.string().prefault('花园主人'),
      当前位置: z.string().prefault('主宅邸四楼'),
      贡献度: z.coerce.number().prefault(0),
      资金: z.coerce.number().prefault(0),
      着装: z
        .object({
          上衣: z.string().prefault('待初始化'),
          下装: z.string().prefault('待初始化'),
          袜: z.string().prefault('待初始化'),
          鞋: z.string().prefault('待初始化'),
          配饰: z.string().prefault('待初始化'),
        })
        .prefault({}),
      背包物品: z
        .record(
          z.string().describe('物品名'),
          z.object({
            描述: z.string().prefault('未描述物品'),
            数量: z.coerce.number().prefault(1),
          }),
        )
        .prefault({})
        .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
    })
    .prefault({}),
});
