<template>
  <section class="panel org-panel">
    <h3 class="panel-title">花园组织概况</h3>
    <div class="org-topline">
      <div class="stat-box">
        <span class="data-label">组织总资金</span>
        <span class="data-value big font-mono">{{ orgFund }}</span>
      </div>
      <div class="stat-box">
        <span class="data-label">组织声望</span>
        <span class="data-value big font-mono">{{ orgRep }}</span>
      </div>
    </div>
    <div class="org-sub-list">
      <div class="org-sub-item">
        <div class="sub-head">
          <span class="sub-name">金缕赌场</span>
          <span class="font-mono" :class="casinoProfitClass">{{ casinoIncome }}</span>
        </div>
        <div class="sub-status">
          <span class="status-dot" :class="casinoDot"></span>
          <span>{{ casinoStatus }}</span>
        </div>
      </div>
      <div class="org-sub-item">
        <div class="sub-head">
          <span class="sub-name">迷迭香酒馆</span>
          <span class="font-mono" :class="barProfitClass">{{ barIncome }}</span>
        </div>
        <div class="sub-status">
          <span class="status-dot" :class="barDot"></span>
          <span>{{ barStatus }}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 18px; padding-top: 16px; border-top: 1px dashed rgba(120, 90, 70, 0.2)">
      <div class="sub-section-title">近期事务与活动</div>
      <div class="affair-list">
        <div v-for="item in affairs" :key="item.key" class="affair-item" :class="{ event: item.isEvent }">
          <div class="affair-head">
            <span class="affair-title">{{ item.title }}</span>
            <span class="affair-countdown">{{ item.countdown }}</span>
          </div>
          <div class="affair-desc">{{ item.desc }}</div>
          <div class="affair-meta">
            <div class="affair-meta-item">
              <span class="m-label">部门/人</span>
              <span class="m-value">{{ item.dept }}</span>
            </div>
            <div class="affair-meta-item">
              <span class="m-label">周期</span>
              <span class="m-value">{{ item.cycle }}</span>
            </div>
          </div>
        </div>
        <div v-if="affairs.length === 0" class="affair-desc" style="padding: 10px">暂无待办事务或活动</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDataStore } from '../store';
import { asRecord, formatMoney, statusDotClass } from '../utils';

const store = useDataStore();

const orgFund = computed(() => formatMoney(_.get(store.data, '系统.组织全局.总资金', 0)));
const orgRep = computed(() => (Number(_.get(store.data, '系统.组织全局.组织声望', 0)) || 0).toLocaleString('en-US'));

const casinoStatus = computed(() => String(_.get(store.data, '系统.金缕赌场.经营状况', '待初始化')));
const barStatus = computed(() => String(_.get(store.data, '系统.迷迭香酒馆.经营状况', '待初始化')));
const casinoDot = computed(() => statusDotClass(casinoStatus.value));
const barDot = computed(() => statusDotClass(barStatus.value));

function profitView(path: string) {
  const v = Number(_.get(store.data, path, 0)) || 0;
  return {
    text: `${formatMoney(Math.abs(v))} 本周`,
    cls: v > 0 ? 'text-profit-up' : v < 0 ? 'text-profit-down' : '',
  };
}

const casinoIncome = computed(() => profitView('系统.金缕赌场.本周收益').text);
const casinoProfitClass = computed(() => profitView('系统.金缕赌场.本周收益').cls);
const barIncome = computed(() => profitView('系统.迷迭香酒馆.本周收益').text);
const barProfitClass = computed(() => profitView('系统.迷迭香酒馆.本周收益').cls);

const affairs = computed(() => {
  const list: Array<{
    key: string;
    title: string;
    countdown: string;
    desc: string;
    dept: string;
    cycle: string;
    isEvent: boolean;
  }> = [];

  const pushItems = (raw: unknown, isEvent: boolean) => {
    Object.entries(asRecord(raw)).forEach(([name, d]) => {
      if (!name || name === '无') return;
      list.push({
        key: `${isEvent ? 'e' : 'a'}-${name}`,
        title: isEvent ? `📅 ${name}` : name,
        countdown: String(_.get(d, '距离开始时间', '未知开始')),
        desc: String(_.get(d, '描述', '暂无描述')),
        dept: String(_.get(d, '涉及部门或职务', isEvent ? '全体' : '未分配')),
        cycle: String(_.get(d, '时间', '未知周期')),
        isEvent,
      });
    });
  };

  pushItems(_.get(store.data, '系统.组织全局.近期事务', {}), false);
  pushItems(_.get(store.data, '系统.组织全局.近期大型活动', {}), true);
  return list;
});
</script>
