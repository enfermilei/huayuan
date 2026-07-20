/**
 * 花园总部庄园示意地图
 * 占地约 2000 亩（≈133.3 万㎡），坐标单位 ≈ 1 米，+Y 朝北
 *
 * 规划原则：
 * - 建筑中心落在 200m 网格上，分区清晰、间距均匀
 * - 道路以水平 / 竖直 / 45° 折线为主干
 * - 树木沿空地做规则阵列，避免随意散落
 *
 * 网格示意（x → 东，y → 北）：
 *          -400      -200       0       200       400
 *   400   禁闭室     温泉     宿舍区    宠物屋    沙滩
 *   200    工坊     厨房      舞台    星光广场    —
 *     0   训练馆   任务酒馆   主宅邸    餐厅     药剂店
 *  -200    仓库      —        —      诊所     学院
 *  -400    车库      —       大门     守卫     纪念园
 */
export const MAP_BOUNDS = { min: -650, max: 650 } as const;
export const MAP_SIZE = MAP_BOUNDS.max - MAP_BOUNDS.min; // 1300

/** 规划网格步长（米） */
export const MAP_GRID = 200;

export type MapRegionId = 'core' | 'south' | 'southeast' | 'west' | 'north' | 'medical' | 'custom';

export type LandmarkShape = 'rect' | 'circle' | 'ellipse' | 'convex';

export type MapLandmark = {
  id: string;
  name: string;
  label: string;
  region: MapRegionId;
  center: [number, number];
  bounds: [number, number, number, number];
  shape: LandmarkShape;
  radius?: number;
  blurb: string;
  aliases: string[];
  /** 自定义建筑可删除 */
  custom?: boolean;
};

export type MapRoad = {
  id: string;
  name: string;
  points: [number, number][];
  width: number;
  /** 道路两端连接的地标 id（用于距离展示） */
  from: string;
  to: string;
};

export type MapRegion = {
  id: MapRegionId;
  name: string;
  color: string;
  soft: string;
};

export const MAP_REGIONS: MapRegion[] = [
  { id: 'core', name: '中央', color: '#E8A86A', soft: 'rgba(255, 214, 170, 0.88)' },
  { id: 'south', name: '外围', color: '#7BA3C4', soft: 'rgba(180, 210, 230, 0.88)' },
  { id: 'southeast', name: '东南', color: '#D48484', soft: 'rgba(245, 190, 190, 0.88)' },
  { id: 'west', name: '西区', color: '#6FA88A', soft: 'rgba(175, 215, 190, 0.88)' },
  { id: 'north', name: '生活', color: '#7EADC8', soft: 'rgba(185, 215, 235, 0.88)' },
  { id: 'medical', name: '医疗', color: '#A88BC0', soft: 'rgba(215, 195, 230, 0.88)' },
  { id: 'custom', name: '自定义', color: '#C4A35A', soft: 'rgba(245, 225, 170, 0.9)' },
];

function box(cx: number, cy: number, hw: number, hh: number): [number, number, number, number] {
  return [cx - hw, cx + hw, cy - hh, cy + hh];
}

/**
 * 内置地标：中心落在 200m 网格，体量略统一
 */
export const MAP_LANDMARKS: MapLandmark[] = [
  // ——— 中央 ———
  {
    id: 'mansion',
    name: '主宅邸',
    label: '主宅邸',
    region: 'core',
    center: [0, 0],
    bounds: box(0, 0, 64, 56),
    shape: 'convex',
    blurb: '优雅沙龙风四层主宅：一楼公共接待，二楼核心功能，三楼月之星专属，四楼主人区域；常驻后勤小队维护。',
    aliases: [
      '主宅邸',
      '主宅',
      '宅邸',
      '宅邸一楼',
      '宅邸二楼',
      '宅邸三楼',
      '宅邸四楼',
      '主宅邸一楼',
      '主宅邸二楼',
      '主宅邸三楼',
      '主宅邸四楼',
      '主宅邸四楼卧室',
      '主人卧室',
      '私人电梯',
    ],
  },

  // ——— y = -400 南侧外围 ———
  {
    id: 'gate',
    name: '庄园大门',
    label: '大门',
    region: 'south',
    center: [0, -400],
    bounds: box(0, -400, 72, 36),
    shape: 'rect',
    blurb: '五米石墙爬满藤蔓，典雅铁艺正门连通外界。',
    aliases: ['庄园大门', '大门', '正门'],
  },
  {
    id: 'guard',
    name: '守卫驻地',
    label: '守卫',
    region: 'south',
    center: [200, -400],
    bounds: box(200, -400, 52, 44),
    shape: 'rect',
    blurb: '大门旁三层朴素宿舍楼，战斗部成员 24 小时轮班驻守。',
    aliases: ['守卫驻地', '守卫', '岗哨'],
  },
  {
    id: 'garage',
    name: '车库与停机坪',
    label: '车库',
    region: 'south',
    center: [-400, -400],
    bounds: box(-400, -400, 72, 52),
    shape: 'ellipse',
    blurb: '半地下车库；南侧草坪设水泥停机坪，夜间有引导灯。',
    aliases: ['车库', '停机坪', '载具', '车库与停机坪'],
  },
  {
    id: 'daisy_garden',
    name: '白雏菊花园',
    label: '纪念园',
    region: 'southeast',
    center: [400, -400],
    bounds: box(400, -400, 56, 48),
    shape: 'ellipse',
    blurb: '向阳山坡上的开放式纪念花园；刻名小碑与玻璃罩遗物，缅怀逝去成员。',
    aliases: ['白雏菊花园', '纪念堂', '雏菊花园', '纪念园'],
  },

  // ——— y = -200 ———
  {
    id: 'warehouse',
    name: '仓库与物流区',
    label: '仓库',
    region: 'west',
    center: [-400, -200],
    bounds: box(-400, -200, 68, 52),
    shape: 'rect',
    blurb: '庄园西侧多栋单层库房与卸货平台，负责物资进出。',
    aliases: ['仓库', '物流', '仓库与物流区'],
  },
  {
    id: 'clinic',
    name: '四叶草诊所',
    label: '诊所',
    region: 'medical',
    center: [200, -200],
    bounds: box(200, -200, 52, 42),
    shape: 'rect',
    blurb: '温馨社区诊所式医疗部，注重私密与关怀；基础医疗、心理疏导与女性生理健康咨询。',
    aliases: ['四叶草诊所', '诊所', '医务'],
  },
  {
    id: 'academy',
    name: '雏菊学院',
    label: '学院',
    region: 'southeast',
    center: [400, -200],
    bounds: box(400, -200, 72, 60),
    shape: 'rect',
    blurb: '古典学院风教育培训中心；三年义务教育，基础必修与专业选修并行，鼓励社团。',
    aliases: ['雏菊学院', '学院', '教学楼', '图书馆'],
  },

  // ——— y = 0 ———
  {
    id: 'training',
    name: '综合训练馆',
    label: '训练馆',
    region: 'west',
    center: [-400, 0],
    bounds: box(-400, 0, 70, 70),
    shape: 'circle',
    radius: 70,
    blurb: '大型多功能训练场：基础体能、武器技巧、敏捷潜行与可变场景实战模拟。',
    aliases: ['综合训练馆', '训练馆', '训练场'],
  },
  {
    id: 'quest_tavern',
    name: '任务酒馆',
    label: '任务馆',
    region: 'west',
    center: [-200, 0],
    bounds: box(-200, 0, 52, 44),
    shape: 'rect',
    blurb: '冒险者公会风格任务大厅，兼餐饮社交；设任务板、私人委托板与组队招募板。',
    aliases: ['任务酒馆'],
  },
  {
    id: 'restaurant',
    name: '时光餐厅',
    label: '餐厅',
    region: 'north',
    center: [200, 0],
    bounds: box(200, 0, 52, 42),
    shape: 'rect',
    blurb: '24 小时高级咖啡馆式餐厅，提供世界各地点餐服务。',
    aliases: ['时光餐厅', '餐厅'],
  },
  {
    id: 'pharmacy',
    name: '月光药剂店',
    label: '药剂店',
    region: 'medical',
    center: [400, 0],
    bounds: box(400, 0, 50, 40),
    shape: 'rect',
    blurb: '古典草药铺与炼金工房结合，补充诊所功能；贩售非处方药与功能性保健品。',
    aliases: ['月光药剂店', '药剂店', '草药铺'],
  },

  // ——— y = 200 生活区中轴 ———
  {
    id: 'workshop',
    name: '齿轮与针线',
    label: '工坊',
    region: 'west',
    center: [-400, 200],
    bounds: box(-400, 200, 52, 44),
    shape: 'rect',
    blurb: '实用主义后勤工坊，负责装备贩售、定制与维修。',
    aliases: ['齿轮与针线', '齿轮与针线工坊', '工坊', '针线'],
  },
  {
    id: 'kitchen',
    name: '公共厨房',
    label: '厨房',
    region: 'north',
    center: [-200, 200],
    bounds: box(-200, 200, 48, 40),
    shape: 'rect',
    blurb: '明亮现代家庭厨房；提供基础厨具与免费食材，可制作点心或举办美食派对。',
    aliases: ['公共厨房', '厨房', '烧烤'],
  },
  {
    id: 'stage',
    name: '露天舞台',
    label: '舞台',
    region: 'north',
    center: [0, 200],
    bounds: box(0, 200, 54, 42),
    shape: 'ellipse',
    blurb: '生活区中心的随性露天场地：石砌矮台、草坪观众席与后台木屋，供非正式表演。',
    aliases: ['露天舞台', '舞台'],
  },
  {
    id: 'plaza',
    name: '星光广场',
    label: '星光广场',
    region: 'north',
    center: [200, 200],
    bounds: box(200, 200, 72, 58),
    shape: 'ellipse',
    blurb: '大型综合休闲中心：商业街、美食广场、游戏中心、影院、KTV、空中花园与留言墙。',
    aliases: ['星光广场', '广场'],
  },

  // ——— y = 400 北缘 ———
  {
    id: 'solitary',
    name: '禁闭室',
    label: '禁闭室',
    region: 'medical',
    center: [-400, 400],
    bounds: box(-400, 400, 48, 42),
    shape: 'rect',
    blurb: '西北隅独立石制建筑，铁栏牢房，用于关押与惩罚违纪成员。',
    aliases: ['禁闭室', '禁闭'],
  },
  {
    id: 'spa',
    name: '宁静之泉',
    label: '温泉',
    region: 'north',
    center: [-200, 400],
    bounds: box(-200, 400, 56, 48),
    shape: 'rect',
    blurb: '大型中央洗浴中心，现代日式温泉旅馆风；主池、功效泡池、桑拿、SPA 与休息大厅。',
    aliases: ['宁静之泉', '公共浴室', '浴室', '温泉'],
  },
  {
    id: 'dorms',
    name: '洋房宿舍',
    label: '宿舍区',
    region: 'north',
    center: [0, 400],
    bounds: box(0, 400, 72, 52),
    shape: 'rect',
    blurb: '数栋乡村别墅风洋房错落分布；标准双人间，晋升或积分可换高级单人间。',
    aliases: ['洋房宿舍', '洋房宿舍区', '宿舍', '洋房'],
  },
  {
    id: 'pet_house',
    name: '宠物小屋',
    label: '宠物屋',
    region: 'north',
    center: [200, 400],
    bounds: box(200, 400, 48, 40),
    shape: 'rect',
    blurb: '温馨乡村木屋，饲养猫狗兔等；成员可轮流报名照顾，互动放松。',
    aliases: ['宠物小屋', '宠物'],
  },
  {
    id: 'beach',
    name: '碧浪沙滩',
    label: '沙滩',
    region: 'north',
    center: [400, 400],
    bounds: box(400, 400, 68, 48),
    shape: 'ellipse',
    blurb: '大型热带海岛风情户外场，仅夏季开放；白沙滩、泳池、水上滑梯与沙滩吧台。',
    aliases: ['碧浪沙滩', '沙滩', '泳池'],
  },
];

/** 碧浪湖：沙滩东侧，略偏东北 */
export const MAP_WATER = {
  center: [540, 400] as [number, number],
  rx: 110,
  ry: 95,
};

/**
 * 道路网：主干水平 / 竖直，支路允许 45°
 * 连接尽量沿网格边，路口正交转折
 */
export const MAP_ROADS: MapRoad[] = [
  // ——— 南北中轴（贯通主宅中心） ———
  {
    id: 'axis_s',
    name: '中央大道',
    from: 'gate',
    to: 'mansion',
    points: [
      [0, -400],
      [0, 0],
    ],
    width: 13,
  },
  {
    id: 'axis_n',
    name: '星光大道',
    from: 'mansion',
    to: 'stage',
    points: [
      [0, 0],
      [0, 200],
    ],
    width: 11,
  },
  {
    id: 'axis_dorm',
    name: '宿舍大道',
    from: 'stage',
    to: 'dorms',
    points: [
      [0, 200],
      [0, 400],
    ],
    width: 9,
  },

  // ——— 东西干道 y=0 ———
  {
    id: 'ring_w0',
    name: '西环路',
    from: 'training',
    to: 'quest_tavern',
    points: [
      [-400, 0],
      [-200, 0],
    ],
    width: 9,
  },
  {
    id: 'ring_quest',
    name: '任务大道',
    from: 'quest_tavern',
    to: 'mansion',
    points: [
      [-200, 0],
      [0, 0],
    ],
    width: 9,
  },
  {
    id: 'ring_e0',
    name: '餐饮大道',
    from: 'mansion',
    to: 'restaurant',
    points: [
      [0, 0],
      [200, 0],
    ],
    width: 9,
  },
  {
    id: 'ring_pharma',
    name: '东环路',
    from: 'restaurant',
    to: 'pharmacy',
    points: [
      [200, 0],
      [400, 0],
    ],
    width: 8,
  },

  // ——— 东西干道 y=200 ———
  {
    id: 'life_w',
    name: '生活西路',
    from: 'workshop',
    to: 'kitchen',
    points: [
      [-400, 200],
      [-200, 200],
    ],
    width: 7,
  },
  {
    id: 'life_c',
    name: '生活中路',
    from: 'kitchen',
    to: 'stage',
    points: [
      [-200, 200],
      [0, 200],
    ],
    width: 7,
  },
  {
    id: 'life_e',
    name: '广场大道',
    from: 'stage',
    to: 'plaza',
    points: [
      [0, 200],
      [200, 200],
    ],
    width: 8,
  },

  // ——— 东西干道 y=400 ———
  {
    id: 'north_w',
    name: '北缘西路',
    from: 'solitary',
    to: 'spa',
    points: [
      [-400, 400],
      [-200, 400],
    ],
    width: 6,
  },
  {
    id: 'north_c',
    name: '温泉路',
    from: 'spa',
    to: 'dorms',
    points: [
      [-200, 400],
      [0, 400],
    ],
    width: 6,
  },
  {
    id: 'north_e',
    name: '宿舍东路',
    from: 'dorms',
    to: 'pet_house',
    points: [
      [0, 400],
      [200, 400],
    ],
    width: 6,
  },
  {
    id: 'beach_rd',
    name: '滨水路',
    from: 'pet_house',
    to: 'beach',
    points: [
      [200, 400],
      [400, 400],
    ],
    width: 6,
  },

  // ——— 东西干道 y=-200 ———
  {
    id: 'south_clinic',
    name: '医疗路',
    from: 'clinic',
    to: 'academy',
    points: [
      [200, -200],
      [400, -200],
    ],
    width: 7,
  },
  {
    id: 'clinic_ns',
    name: '医疗支路',
    from: 'restaurant',
    to: 'clinic',
    points: [
      [200, 0],
      [200, -200],
    ],
    width: 6,
  },
  {
    id: 'pharma_ns',
    name: '药剂支路',
    from: 'pharmacy',
    to: 'academy',
    points: [
      [400, 0],
      [400, -200],
    ],
    width: 6,
  },

  // ——— 东西干道 y=-400 ———
  {
    id: 'gate_w',
    name: '载具通道',
    from: 'garage',
    to: 'gate',
    points: [
      [-400, -400],
      [0, -400],
    ],
    width: 9,
  },
  {
    id: 'gate_e',
    name: '守卫大道',
    from: 'gate',
    to: 'guard',
    points: [
      [0, -400],
      [200, -400],
    ],
    width: 7,
  },
  {
    id: 'memorial_rd',
    name: '祈愿大道',
    from: 'guard',
    to: 'daisy_garden',
    points: [
      [200, -400],
      [400, -400],
    ],
    width: 6,
  },

  // ——— 西侧南北干道 x=-400 ———
  {
    id: 'west_s',
    name: '物流干道',
    from: 'garage',
    to: 'warehouse',
    points: [
      [-400, -400],
      [-400, -200],
    ],
    width: 8,
  },
  {
    id: 'west_c',
    name: '武装干道',
    from: 'warehouse',
    to: 'training',
    points: [
      [-400, -200],
      [-400, 0],
    ],
    width: 8,
  },
  {
    id: 'west_n',
    name: '工匠干道',
    from: 'training',
    to: 'workshop',
    points: [
      [-400, 0],
      [-400, 200],
    ],
    width: 7,
  },
  {
    id: 'west_nn',
    name: '幽暗小径',
    from: 'workshop',
    to: 'solitary',
    points: [
      [-400, 200],
      [-400, 400],
    ],
    width: 5,
  },

  // ——— 东侧南北 / 斜向 ———
  {
    id: 'academy_s',
    name: '学院南路',
    from: 'daisy_garden',
    to: 'academy',
    points: [
      [400, -400],
      [400, -200],
    ],
    width: 6,
  },
  {
    id: 'plaza_n',
    name: '广场北路',
    from: 'plaza',
    to: 'pet_house',
    points: [
      [200, 200],
      [200, 400],
    ],
    width: 6,
  },

  // ——— 南北支路 x=±200 ———
  {
    id: 'kitchen_ns',
    name: '西廊连道',
    from: 'quest_tavern',
    to: 'kitchen',
    points: [
      [-200, 0],
      [-200, 200],
    ],
    width: 5,
  },
  {
    id: 'spa_ns',
    name: '温泉竹径',
    from: 'kitchen',
    to: 'spa',
    points: [
      [-200, 200],
      [-200, 400],
    ],
    width: 5,
  },

  // ——— 45° 捷径（仅 |Δx|=|Δy|） ———
  {
    id: 'diag_plaza_beach',
    name: '滨水栈道',
    from: 'plaza',
    to: 'beach',
    points: [
      [200, 200],
      [400, 400],
    ],
    width: 5,
  },
];

/**
 * 装饰树：空地与外缘点景
 * 禁止落在道路轴线上（路廊 x/y ∈ {0,±200,±400}）
 */
export const MAP_TREES: [number, number][] = [
  // 南前庭两侧（避开中央大道 x=0 与南缘路 y=-400）
  [-100, -200],
  [100, -200],
  [-200, -300],
  // 西侧空地
  [-200, -100],
  [-300, -200],
  // 东侧空地
  [400, 100],
  [300, 200],
  // 外缘
  [0, 540],
  [0, -540],
  [540, 0],
  [-540, 0],
  [400, 540],
  [-400, 540],
  [400, -540],
  [-400, -540],
];

export function worldToSvg(x: number, y: number): [number, number] {
  return [x - MAP_BOUNDS.min, MAP_BOUNDS.max - y];
}

export function svgToWorld(sx: number, sy: number): [number, number] {
  return [sx + MAP_BOUNDS.min, MAP_BOUNDS.max - sy];
}

export function landmarkSvgRect(lm: MapLandmark): { x: number; y: number; width: number; height: number } {
  const [xMin, xMax, yMin, yMax] = lm.bounds;
  const [sx, syTop] = worldToSvg(xMin, yMax);
  const [, syBot] = worldToSvg(xMin, yMin);
  return { x: sx, y: syTop, width: xMax - xMin, height: syBot - syTop };
}

/** 「凸」字形路径（正面朝南：宽边在南 / 窄翼在北） */
export function convexPath(lm: MapLandmark): string {
  const [cx, cy] = lm.center;
  const hw = (lm.bounds[1] - lm.bounds[0]) / 2;
  const hh = (lm.bounds[3] - lm.bounds[2]) / 2;
  const narrow = hw * 0.42;
  const pts: [number, number][] = [
    [cx - hw, cy - hh],
    [cx + hw, cy - hh],
    [cx + hw, cy + hh * 0.15],
    [cx + narrow, cy + hh * 0.15],
    [cx + narrow, cy + hh],
    [cx - narrow, cy + hh],
    [cx - narrow, cy + hh * 0.15],
    [cx - hw, cy + hh * 0.15],
  ];
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${worldToSvg(...p).join(',')}`).join(' ') + ' Z';
}

export function roadPolyline(road: MapRoad): string {
  return road.points.map(([x, y]) => worldToSvg(x, y).join(',')).join(' ');
}

export function roadLength(road: MapRoad): number {
  let d = 0;
  for (let i = 1; i < road.points.length; i++) {
    const [x0, y0] = road.points[i - 1];
    const [x1, y1] = road.points[i];
    d += Math.hypot(x1 - x0, y1 - y0);
  }
  return Math.round(d);
}

/** 路面显示宽度（米），在原始 width 上放大以呈现宽道观感 */
export function roadPavementWidth(road: MapRoad): number {
  return Math.max(road.width * 2.8, 22);
}

export function roadCurbWidth(road: MapRoad): number {
  return roadPavementWidth(road) + 6;
}

export type MapLamp = {
  id: string;
  x: number;
  y: number;
  /** 道路切向（世界坐标，弧度），用于灯杆朝向 */
  angle: number;
  roadId: string;
};

/**
 * 沿道路两侧生成路灯：约每 200m 一对（左右各一），落在路段中点附近
 */
export function buildStreetLamps(spacing = 200, sideGap = 8): MapLamp[] {
  const lamps: MapLamp[] = [];
  const seen = new Set<string>();

  function deepInsideLandmark(x: number, y: number): boolean {
    return MAP_LANDMARKS.some(lm => {
      const [x0, x1, y0, y1] = lm.bounds;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const hx = ((x1 - x0) / 2) * 0.55;
      const hy = ((y1 - y0) / 2) * 0.55;
      return Math.abs(x - cx) <= hx && Math.abs(y - cy) <= hy;
    });
  }

  for (const road of MAP_ROADS) {
    const half = roadPavementWidth(road) / 2 + sideGap;

    for (let i = 1; i < road.points.length; i++) {
      const [x0, y0] = road.points[i - 1];
      const [x1, y1] = road.points[i];
      const segLen = Math.hypot(x1 - x0, y1 - y0);
      if (segLen < 40) continue;

      const dx = (x1 - x0) / segLen;
      const dy = (y1 - y0) / segLen;
      const angle = Math.atan2(dy, dx);
      const nx = -dy;
      const ny = dx;

      // 200m → 1 对；400m → 2 对，均匀落在路段上
      const count = Math.max(1, Math.round(segLen / spacing));
      for (let k = 0; k < count; k++) {
        const local = ((k + 0.5) / count) * segLen;
        const px = x0 + dx * local;
        const py = y0 + dy * local;

        for (const side of [-1, 1] as const) {
          const lx = px + nx * half * side;
          const ly = py + ny * half * side;
          const key = `${Math.round(lx / 10) * 10},${Math.round(ly / 10) * 10}`;
          if (seen.has(key)) continue;
          if (deepInsideLandmark(lx, ly)) continue;
          seen.add(key);
          lamps.push({
            id: `${road.id}_${i}_${k}_${side}`,
            x: lx,
            y: ly,
            angle,
            roadId: road.id,
          });
        }
      }
    }
  }

  return lamps;
}

export const MAP_LAMPS: MapLamp[] = buildStreetLamps(200, 8);

/** 浅色规划网格线（世界坐标端点对） */
export const MAP_GRID_LINES: [[number, number], [number, number]][] = (() => {
  const lines: [[number, number], [number, number]][] = [];
  for (let t = -400; t <= 400; t += MAP_GRID) {
    lines.push([
      [-520, t],
      [520, t],
    ]);
    lines.push([
      [t, -520],
      [t, 520],
    ]);
  }
  return lines;
})();

/** 庄园围墙（世界坐标矩形） */
export const MAP_WALL = { min: -560, max: 560 } as const;

/** 道路中点（用于距离标注） */
export function roadMidpoint(road: MapRoad): [number, number] {
  const len = roadLength(road);
  if (len <= 0) return road.points[0] ?? [0, 0];
  let remain = len / 2;
  for (let i = 1; i < road.points.length; i++) {
    const [x0, y0] = road.points[i - 1];
    const [x1, y1] = road.points[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (remain <= seg) {
      const t = seg === 0 ? 0 : remain / seg;
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
    remain -= seg;
  }
  return road.points[road.points.length - 1]!;
}

export type LandmarkLink = {
  roadId: string;
  roadName: string;
  targetId: string;
  targetName: string;
  distance: number;
};

/** 与指定地标直接相连的道路与对端距离 */
export function landmarkLinks(id: string, extras: MapLandmark[] = []): LandmarkLink[] {
  const all = [...MAP_LANDMARKS, ...extras];
  const nameOf = (lid: string) => all.find(l => l.id === lid)?.name || lid;
  const links: LandmarkLink[] = [];
  for (const road of MAP_ROADS) {
    if (road.from === id) {
      links.push({
        roadId: road.id,
        roadName: road.name,
        targetId: road.to,
        targetName: nameOf(road.to),
        distance: roadLength(road),
      });
    } else if (road.to === id) {
      links.push({
        roadId: road.id,
        roadName: road.name,
        targetId: road.from,
        targetName: nameOf(road.from),
        distance: roadLength(road),
      });
    }
  }
  return links.sort((a, b) => a.distance - b.distance);
}

export function customToLandmark(c: {
  id: string;
  name: string;
  x: number;
  y: number;
  blurb: string;
  region?: MapRegionId;
}): MapLandmark {
  const name = c.name.trim() || '未命名建筑';
  return {
    id: c.id,
    name,
    label: name.length > 5 ? name.slice(0, 5) : name,
    region: c.region || 'custom',
    center: [c.x, c.y],
    bounds: box(c.x, c.y, 48, 40),
    shape: 'rect',
    blurb: c.blurb.trim() || '自定义建筑',
    aliases: [name],
    custom: true,
  };
}

export function resolveLandmarkId(location: string, extras: MapLandmark[] = []): string | null {
  return resolveLocation(location, extras).landmarkId;
}

/** 主宅房间（相对楼层平面：0~100 百分比坐标） */
export type MansionRoom = {
  id: string;
  name: string;
  /** [x%, y%, w%, h%] */
  rect: [number, number, number, number];
  blurb: string;
  aliases: string[];
};

export type MansionFloor = {
  level: 1 | 2 | 3 | 4;
  name: string;
  short: string;
  theme: string;
  rooms: MansionRoom[];
};

/**
 * 主宅邸内部分层平面（相对坐标，供室内图使用）
 * 权限：一楼公共 → 四楼主人专属
 */
export const MANSION_FLOORS: MansionFloor[] = [
  {
    level: 1,
    name: '一楼 · 公共接待',
    short: '1F',
    theme: '门厅、沙龙与宴会厅',
    rooms: [
      {
        id: 'f1_lobby',
        name: '门厅',
        rect: [32, 62, 36, 30],
        blurb: '主宅正面入口，访客登记与引导。',
        aliases: ['门厅', '大厅', '玄关'],
      },
      {
        id: 'f1_salon',
        name: '沙龙',
        rect: [6, 18, 40, 40],
        blurb: '优雅精致的接待沙龙，茶叙与非正式会谈。',
        aliases: ['沙龙', '会客厅', '客厅'],
      },
      {
        id: 'f1_ballroom',
        name: '宴会厅',
        rect: [54, 18, 40, 40],
        blurb: '正式宴会与大型接待场合。',
        aliases: ['宴会厅', '宴会', '舞厅'],
      },
      {
        id: 'f1_stair',
        name: '主楼梯',
        rect: [40, 8, 20, 12],
        blurb: '连通各层的中央楼梯间。',
        aliases: ['楼梯', '主楼梯'],
      },
    ],
  },
  {
    level: 2,
    name: '二楼 · 核心功能',
    short: '2F',
    theme: '会议、指挥与档案',
    rooms: [
      {
        id: 'f2_meeting',
        name: '会议室',
        rect: [6, 18, 38, 36],
        blurb: '核心成员例会与事务磋商。',
        aliases: ['会议室', '会议'],
      },
      {
        id: 'f2_command',
        name: '作战指挥室',
        rect: [50, 18, 44, 36],
        blurb: '任务调度与实时作战指挥中枢。',
        aliases: ['作战指挥室', '指挥室', '作战室'],
      },
      {
        id: 'f2_archive',
        name: '档案室入口',
        rect: [6, 60, 42, 28],
        blurb: '机密档案区入口，权限严格管控。',
        aliases: ['档案室', '档案室入口', '档案'],
      },
      {
        id: 'f2_corridor',
        name: '走廊',
        rect: [52, 60, 42, 28],
        blurb: '二楼连通走廊与电梯厅。',
        aliases: ['走廊', '二楼走廊'],
      },
    ],
  },
  {
    level: 3,
    name: '三楼 · 月之星',
    short: '3F',
    theme: '月之星办公与书房',
    rooms: [
      {
        id: 'f3_office',
        name: '办公室',
        rect: [8, 16, 48, 48],
        blurb: '月之星专属办公区，处理组织日常决策。',
        aliases: ['办公室', '月之星办公室', '三楼办公室'],
      },
      {
        id: 'f3_study',
        name: '书房',
        rect: [60, 16, 32, 48],
        blurb: '藏书与密谈用书房。',
        aliases: ['书房', '图书室'],
      },
      {
        id: 'f3_lounge',
        name: '休息室',
        rect: [8, 70, 84, 20],
        blurb: '三楼休息与短暂会客空间。',
        aliases: ['休息室', '茶室'],
      },
    ],
  },
  {
    level: 4,
    name: '四楼 · 主人专属',
    short: '4F',
    theme: '卧室与私人电梯',
    rooms: [
      {
        id: 'f4_bedroom',
        name: '卧室',
        rect: [10, 14, 52, 56],
        blurb: '主人专属卧室，绝对私密。',
        aliases: ['卧室', '主人卧室', '四楼卧室', '主卧室', '睡房'],
      },
      {
        id: 'f4_elevator',
        name: '私人电梯',
        rect: [68, 14, 24, 28],
        blurb: '直达主人区域的私人电梯。',
        aliases: ['私人电梯', '电梯'],
      },
      {
        id: 'f4_dressing',
        name: '衣帽间',
        rect: [68, 48, 24, 22],
        blurb: '着装更换与收纳。',
        aliases: ['衣帽间', '更衣室', '梳妆'],
      },
      {
        id: 'f4_hall',
        name: '前厅',
        rect: [10, 74, 82, 16],
        blurb: '四楼入口前厅，连通电梯与卧室。',
        aliases: ['前厅', '四楼前厅', '走廊'],
      },
    ],
  },
];

const FLOOR_PATTERNS: { level: 1 | 2 | 3 | 4; re: RegExp }[] = [
  { level: 1, re: /一楼|1\s*[Ff楼]|第\s*一\s*层/ },
  { level: 2, re: /二楼|2\s*[Ff楼]|第\s*二\s*层/ },
  { level: 3, re: /三楼|3\s*[Ff楼]|第\s*三\s*层/ },
  { level: 4, re: /四楼|4\s*[Ff楼]|第\s*四\s*层|主人专属/ },
];

export type ResolvedLocation = {
  landmarkId: string | null;
  /** 仅主宅邸有楼层 */
  floor: 1 | 2 | 3 | 4 | null;
  roomId: string | null;
  roomName: string | null;
};

function matchMansionRoom(loc: string, floor: MansionFloor): MansionRoom | null {
  let best: { room: MansionRoom; len: number } | null = null;
  for (const room of floor.rooms) {
    for (const alias of [room.name, ...room.aliases]) {
      if (!alias || alias.length < 2) continue;
      if (loc === alias || loc.includes(alias)) {
        if (!best || alias.length > best.len) best = { room, len: alias.length };
      }
    }
  }
  return best?.room ?? null;
}

/** 解析当前位置：地标 +（主宅）楼层/房间 */
export function resolveLocation(location: string, extras: MapLandmark[] = []): ResolvedLocation {
  const loc = String(location || '').trim();
  const empty: ResolvedLocation = { landmarkId: null, floor: null, roomId: null, roomName: null };
  if (!loc || loc === '待初始化' || loc === '未知' || loc === '外出' || loc === '外出中') return empty;

  let best: { id: string; len: number } | null = null;
  for (const lm of [...MAP_LANDMARKS, ...extras]) {
    for (const alias of [lm.name, ...lm.aliases]) {
      if (!alias || alias.length < 2) continue;
      if (loc === alias || loc.includes(alias)) {
        if (!best || alias.length > best.len) best = { id: lm.id, len: alias.length };
      }
    }
  }

  // 无别名命中时，若含「主宅/宅邸」仍归入主宅
  let landmarkId = best?.id ?? null;
  if (!landmarkId && /主宅|宅邸/.test(loc)) landmarkId = 'mansion';

  if (landmarkId !== 'mansion') {
    return { landmarkId, floor: null, roomId: null, roomName: null };
  }

  let floorLevel: 1 | 2 | 3 | 4 | null = null;
  for (const p of FLOOR_PATTERNS) {
    if (p.re.test(loc)) {
      floorLevel = p.level;
      break;
    }
  }

  // 未写出楼层但提到卧室/私人电梯 → 默认四楼
  if (!floorLevel && /(卧室|私人电梯|衣帽间)/.test(loc)) floorLevel = 4;

  if (!floorLevel) {
    return { landmarkId, floor: null, roomId: null, roomName: null };
  }

  const floor = MANSION_FLOORS.find(f => f.level === floorLevel)!;
  const room = matchMansionRoom(loc, floor);
  return {
    landmarkId,
    floor: floorLevel,
    roomId: room?.id ?? null,
    roomName: room?.name ?? null,
  };
}

export function getMansionFloor(level: 1 | 2 | 3 | 4): MansionFloor {
  return MANSION_FLOORS.find(f => f.level === level) || MANSION_FLOORS[0]!;
}

export function getRegion(id: MapRegionId): MapRegion | undefined {
  return MAP_REGIONS.find(r => r.id === id);
}

export function relativeHint(lm: MapLandmark): string {
  const [x, y] = lm.center;
  if (Math.abs(x) < 50 && Math.abs(y) < 50) return '庄园中心';
  const ns = y > 50 ? '北' : y < -50 ? '南' : '';
  const ew = x > 50 ? '东' : x < -50 ? '西' : '';
  const dist = Math.round(Math.hypot(x, y));
  return `${ns}${ew}侧 · 距主宅约 ${dist}m`;
}

/** 视口缩放范围（viewBox 边长，米） */
export const VIEW_SPAN_MIN = 280;
export const VIEW_SPAN_MAX = 1400;
export const VIEW_SPAN_DEFAULT = 1100;
