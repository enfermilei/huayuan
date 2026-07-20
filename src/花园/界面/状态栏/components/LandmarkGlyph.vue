<template>
  <!-- 扁平剪影小符号：远看辨认，近看有一点呼吸感 -->
  <g
    class="map-glyph"
    :class="[`glyph-${landmarkId}`, { busy, 'is-user': isUser }]"
    :transform="`translate(${x}, ${y}) scale(${scale})`"
    :style="{ '--glyph-delay': delay }"
    pointer-events="none"
  >
    <g class="glyph-float">
    <!-- 主宅：屋顶 + 暖窗 -->
    <g v-if="landmarkId === 'mansion'" class="glyph-body">
      <path d="M-9 1 L0 -9 L9 1 Z" fill="#D4895A" stroke="#8A5A38" stroke-width="1.2" stroke-linejoin="round" />
      <rect x="-7" y="1" width="14" height="10" rx="1.2" fill="#F3E2C8" stroke="#8A5A38" stroke-width="1.1" />
      <rect class="glyph-window" x="-4.5" y="3.5" width="3" height="3.2" rx="0.4" fill="#FFE6A8" />
      <rect class="glyph-window" x="1.5" y="3.5" width="3" height="3.2" rx="0.4" fill="#FFE6A8" />
      <rect x="-1.2" y="6" width="2.4" height="5" rx="0.3" fill="#A8744E" />
    </g>

    <!-- 温泉：水面 + 蒸汽 -->
    <g v-else-if="landmarkId === 'spa'" class="glyph-body">
      <ellipse cx="0" cy="5" rx="9" ry="4.2" fill="#7EC8DE" stroke="#4A8FA8" stroke-width="1.1" />
      <ellipse cx="-2" cy="4" rx="3.5" ry="1.2" fill="rgba(255,255,255,0.35)" />
      <path class="glyph-steam s1" d="M-4 2 C-5 -2 -2 -5 -3 -8" fill="none" stroke="#B8DCE8" stroke-width="1.4" stroke-linecap="round" />
      <path class="glyph-steam s2" d="M0 1 C-1 -3 2 -5 1 -9" fill="none" stroke="#C8E6F0" stroke-width="1.5" stroke-linecap="round" />
      <path class="glyph-steam s3" d="M4 2 C5 -2 2 -5 3 -8" fill="none" stroke="#B8DCE8" stroke-width="1.4" stroke-linecap="round" />
    </g>

    <!-- 沙滩：伞 + 浪 -->
    <g v-else-if="landmarkId === 'beach'" class="glyph-body">
      <path d="M0 2 L0 8" stroke="#8B6A45" stroke-width="1.4" stroke-linecap="round" />
      <path d="M0 2 L-8 -1 A9 9 0 0 1 8 -1 Z" fill="#E8A86A" stroke="#C4844A" stroke-width="1" />
      <path class="glyph-wave" d="M-9 10 Q-4 7 0 10 Q4 13 9 10" fill="none" stroke="#5BA8C8" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- 学院：雏菊（极慢自转） -->
    <g v-else-if="landmarkId === 'academy'" class="glyph-body">
      <g class="glyph-daisy">
        <ellipse v-for="i in 6" :key="i" :transform="`rotate(${(i - 1) * 60})`" cy="-5.5" rx="2.2" ry="4.2" fill="#FFF8EE" stroke="#D4C4A8" stroke-width="0.6" />
        <circle r="3.2" fill="#F0C85A" stroke="#D4A840" stroke-width="0.8" />
      </g>
    </g>

    <!-- 禁闭室：铁栏 -->
    <g v-else-if="landmarkId === 'solitary'" class="glyph-body">
      <rect x="-8" y="-7" width="16" height="14" rx="1.5" fill="#6A7080" stroke="#3E4450" stroke-width="1.2" />
      <line x1="-4" y1="-5" x2="-4" y2="5" stroke="#C8CCD4" stroke-width="1.6" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke="#C8CCD4" stroke-width="1.6" />
      <line x1="4" y1="-5" x2="4" y2="5" stroke="#C8CCD4" stroke-width="1.6" />
      <line x1="-7" y1="-1" x2="7" y2="-1" stroke="#9AA0AA" stroke-width="1.1" />
    </g>

    <!-- 宠物屋：猫剪影 -->
    <g v-else-if="landmarkId === 'pet_house'" class="glyph-body">
      <ellipse cx="0" cy="3" rx="7.5" ry="5.5" fill="#8B7355" stroke="#5A4838" stroke-width="1" />
      <circle cx="0" cy="-2" r="5" fill="#8B7355" stroke="#5A4838" stroke-width="1" />
      <path d="M-4.5 -5 L-6.5 -11 L-2 -7 Z" fill="#8B7355" stroke="#5A4838" stroke-width="0.8" stroke-linejoin="round" />
      <path d="M4.5 -5 L6.5 -11 L2 -7 Z" fill="#8B7355" stroke="#5A4838" stroke-width="0.8" stroke-linejoin="round" />
      <circle cx="-1.8" cy="-2.2" r="0.9" fill="#2A2218" />
      <circle cx="1.8" cy="-2.2" r="0.9" fill="#2A2218" />
      <path class="glyph-tail" d="M7 4 Q12 0 11 -5" fill="none" stroke="#8B7355" stroke-width="2.2" stroke-linecap="round" />
    </g>

    <!-- 任务酒馆：木牌 + 酒杯 -->
    <g v-else-if="landmarkId === 'quest_tavern'" class="glyph-body">
      <rect x="-8" y="-6" width="10" height="12" rx="1.2" fill="#C4A06A" stroke="#8A6840" stroke-width="1.1" />
      <line x1="-6" y1="-3" x2="0" y2="-3" stroke="#8A6840" stroke-width="1.1" />
      <line x1="-6" y1="0" x2="0" y2="0" stroke="#8A6840" stroke-width="1.1" />
      <line x1="-6" y1="3" x2="-1" y2="3" stroke="#8A6840" stroke-width="1.1" />
      <path d="M4 -2 L4 6 Q4 8 6.5 8 Q9 8 9 6 L9 -2 Z" fill="#E8C86A" stroke="#A88840" stroke-width="1" />
      <path d="M4 -2 L9 -2" stroke="#A88840" stroke-width="1.2" />
      <path class="glyph-foam" d="M4.5 -3 Q6.5 -5 8.5 -3" fill="none" stroke="#FFF8E8" stroke-width="1.3" stroke-linecap="round" />
    </g>

    <!-- 餐厅：咖啡杯 -->
    <g v-else-if="landmarkId === 'restaurant'" class="glyph-body">
      <path d="M-5 -1 L-4 8 Q0 10 4 8 L5 -1 Z" fill="#F0E0C8" stroke="#8A6A48" stroke-width="1.1" />
      <path d="M5 1 Q9 1 9 4 Q9 7 5 6" fill="none" stroke="#8A6A48" stroke-width="1.3" />
      <path class="glyph-steam s2" d="M-1 -2 C-2 -5 1 -6 0 -9" fill="none" stroke="#D8C8B0" stroke-width="1.3" stroke-linecap="round" />
    </g>

    <!-- 宿舍：烟囱小屋顶 -->
    <g v-else-if="landmarkId === 'dorms'" class="glyph-body">
      <path d="M-9 2 L0 -7 L9 2 Z" fill="#D4A888" stroke="#8A6048" stroke-width="1.1" stroke-linejoin="round" />
      <rect x="-7" y="2" width="14" height="8" rx="1" fill="#F5E8D8" stroke="#8A6048" stroke-width="1" />
      <rect x="4" y="-8" width="3" height="6" fill="#A88870" stroke="#6A5040" stroke-width="0.8" />
      <path class="glyph-steam s1" d="M5.5 -9 C4.5 -12 7 -13 6 -15" fill="none" stroke="#C8C0B8" stroke-width="1.2" stroke-linecap="round" />
    </g>

    <!-- 星光广场：星 -->
    <g v-else-if="landmarkId === 'plaza'" class="glyph-body">
      <path
        class="glyph-star"
        d="M0 -8 L1.8 -2.2 L8 -2.2 L3 1.6 L4.8 8 L0 4 L-4.8 8 L-3 1.6 L-8 -2.2 L-1.8 -2.2 Z"
        fill="#F5D76A"
        stroke="#C9A227"
        stroke-width="0.9"
        stroke-linejoin="round"
      />
    </g>

    <!-- 诊所：四叶草 -->
    <g v-else-if="landmarkId === 'clinic'" class="glyph-body">
      <circle cx="0" cy="-4.5" r="3.4" fill="#7CBC8A" />
      <circle cx="-4" cy="0.5" r="3.4" fill="#7CBC8A" />
      <circle cx="4" cy="0.5" r="3.4" fill="#7CBC8A" />
      <circle cx="0" cy="5" r="3.4" fill="#7CBC8A" />
      <circle r="2" fill="#E8F5E8" />
    </g>

    <!-- 工坊：齿轮 -->
    <g v-else-if="landmarkId === 'workshop'" class="glyph-body">
      <g class="glyph-gear">
        <circle r="5.5" fill="none" stroke="#8A8A90" stroke-width="3.5" stroke-dasharray="3.2 2.4" />
        <circle r="3.2" fill="#D0D0D4" stroke="#6A6A70" stroke-width="1" />
        <circle r="1.2" fill="#6A6A70" />
      </g>
    </g>

    <!-- 药剂店：药瓶 -->
    <g v-else-if="landmarkId === 'pharmacy'" class="glyph-body">
      <rect x="-3" y="-8" width="6" height="3" rx="0.8" fill="#C8B898" stroke="#8A7858" stroke-width="0.8" />
      <path d="M-5 -5 L-5 7 Q-5 9 0 9 Q5 9 5 7 L5 -5 Z" fill="#A8D4E8" stroke="#5A8AA0" stroke-width="1.1" />
      <ellipse cx="0" cy="2" rx="3.5" ry="2" fill="#7EBEA0" opacity="0.85" />
      <circle class="glyph-bubble" cx="1.5" cy="-1" r="1.1" fill="rgba(255,255,255,0.55)" />
    </g>

    <!-- 训练馆：靶心 -->
    <g v-else-if="landmarkId === 'training'" class="glyph-body">
      <circle r="8" fill="#F0E0D0" stroke="#A07060" stroke-width="1.2" />
      <circle r="5.2" fill="none" stroke="#D08070" stroke-width="2" />
      <circle r="2" fill="#E07060" />
    </g>

    <!-- 大门：拱门 -->
    <g v-else-if="landmarkId === 'gate'" class="glyph-body">
      <path d="M-8 8 L-8 -2 Q-8 -9 0 -9 Q8 -9 8 -2 L8 8" fill="#C8D0D8" stroke="#6A7888" stroke-width="1.3" />
      <path d="M-4 8 L-4 0 Q-4 -4 0 -4 Q4 -4 4 0 L4 8" fill="#E8EEF2" />
      <circle cx="-2.2" cy="3" r="0.8" fill="#8A9080" />
    </g>

    <!-- 厨房：锅 -->
    <g v-else-if="landmarkId === 'kitchen'" class="glyph-body">
      <ellipse cx="0" cy="2" rx="8" ry="5" fill="#A8B0B8" stroke="#5A6068" stroke-width="1.2" />
      <path d="M-9 1 L-12 1" stroke="#5A6068" stroke-width="1.5" stroke-linecap="round" />
      <path d="M9 1 L12 1" stroke="#5A6068" stroke-width="1.5" stroke-linecap="round" />
      <path class="glyph-steam s2" d="M-1 -4 C-2 -7 2 -8 1 -11" fill="none" stroke="#D0C8C0" stroke-width="1.3" stroke-linecap="round" />
    </g>

    <!-- 舞台：聚光 -->
    <g v-else-if="landmarkId === 'stage'" class="glyph-body">
      <path d="M-8 7 L8 7 L5 2 L-5 2 Z" fill="#C4A888" stroke="#8A6848" stroke-width="1" />
      <path class="glyph-spot" d="M0 -8 L-6 2 L6 2 Z" fill="rgba(255, 230, 150, 0.55)" stroke="#E8C86A" stroke-width="0.8" />
    </g>

    <!-- 仓库：货箱 -->
    <g v-else-if="landmarkId === 'warehouse'" class="glyph-body">
      <rect x="-7" y="-2" width="10" height="9" rx="1" fill="#C4A878" stroke="#8A6840" stroke-width="1" />
      <rect x="-2" y="-6" width="10" height="9" rx="1" fill="#D4B888" stroke="#8A6840" stroke-width="1" />
      <line x1="-2" y1="-1" x2="8" y2="-1" stroke="#8A6840" stroke-width="0.8" />
    </g>

    <!-- 车库：H 停机 -->
    <g v-else-if="landmarkId === 'garage'" class="glyph-body">
      <circle r="8.5" fill="#B0B8C0" stroke="#6A7078" stroke-width="1.2" />
      <text y="4" text-anchor="middle" class="glyph-h">H</text>
    </g>

    <!-- 守卫：盾 -->
    <g v-else-if="landmarkId === 'guard'" class="glyph-body">
      <path d="M0 -8 L7 -4 L7 2 Q7 8 0 10 Q-7 8 -7 2 L-7 -4 Z" fill="#7BA3C4" stroke="#4A6888" stroke-width="1.2" />
      <path d="M0 -4 L0 5" stroke="#E8F0F8" stroke-width="1.5" />
      <path d="M-3 0 L3 0" stroke="#E8F0F8" stroke-width="1.5" />
    </g>

    <!-- 纪念园：碑 + 花 -->
    <g v-else-if="landmarkId === 'daisy_garden'" class="glyph-body">
      <rect x="-2.5" y="-4" width="5" height="10" rx="0.6" fill="#C8C4BC" stroke="#7A7870" stroke-width="1" />
      <rect x="-5" y="6" width="10" height="2.5" rx="0.5" fill="#A8A498" stroke="#7A7870" stroke-width="0.8" />
      <circle class="glyph-petal" cx="5" cy="-5" r="2.2" fill="#FFF8F0" stroke="#D8C8B8" stroke-width="0.6" />
      <circle cx="5" cy="-5" r="0.9" fill="#F0C85A" />
    </g>

    <!-- 默认：小旗 -->
    <g v-else class="glyph-body">
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#8A7858" stroke-width="1.4" stroke-linecap="round" />
      <path d="M0 -8 L8 -4 L0 0 Z" fill="#E8A86A" stroke="#C4844A" stroke-width="0.8" />
    </g>
    </g>
  </g>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    landmarkId: string;
    x: number;
    y: number;
    scale?: number;
    busy?: boolean;
    isUser?: boolean;
    delay?: string;
  }>(),
  { scale: 1, busy: false, isUser: false, delay: '0s' },
);
</script>
