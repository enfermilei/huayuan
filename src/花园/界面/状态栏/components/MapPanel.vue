<template>
  <div class="garden-overlay" @click.self="emit('close')">
    <div class="garden-modal map-modal">
      <div class="modal-header">
        <h3 class="modal-title">花园组织地图</h3>
        <button class="modal-close" type="button" @click="emit('close')">关闭</button>
      </div>

      <div class="map-shell">
        <aside class="map-sidebar">
          <div class="map-summary map-summary-compact">
            <div class="stat-box">
              <span class="data-label">地标</span>
              <span class="data-value font-mono">{{ allLandmarks.length }}</span>
            </div>
            <div class="stat-box">
              <span class="data-label">在场</span>
              <span class="data-value font-mono">{{ presentCount }}</span>
            </div>
            <div class="stat-box">
              <span class="data-label">场外</span>
              <span class="data-value font-mono">{{ outdoorPeople.length }}</span>
            </div>
          </div>
          <div class="map-estate-note">总部庄园约 2000 亩 · 网格 200m · 宽道 + 路灯</div>

          <div class="map-region-filters">
            <button
              type="button"
              class="map-filter-chip"
              :class="{ active: !regionFilter }"
              @click="regionFilter = null"
            >
              全部
            </button>
            <button
              v-for="r in filterRegions"
              :key="r.id"
              type="button"
              class="map-filter-chip"
              :class="{ active: regionFilter === r.id }"
              :style="{ '--chip-accent': r.soft }"
              @click="regionFilter = regionFilter === r.id ? null : r.id"
            >
              {{ r.name }}
            </button>
          </div>

          <div class="map-toolbar">
            <button type="button" class="map-mini-btn" title="定位到主角" @click="locateUser">◎ 定位主角</button>
            <button
              v-if="selectedId === 'mansion'"
              type="button"
              class="map-mini-btn primary"
              :class="{ active: interiorOpen }"
              @click="toggleInterior"
            >
              {{ interiorOpen ? '退出室内' : '进入主宅' }}
            </button>
          </div>

          <div v-if="selectedRoad" class="map-road-banner">
            <div class="map-road-banner-title">{{ selectedRoad.name }}</div>
            <div class="map-road-banner-meta">全长 {{ roadLength(selectedRoad) }}m · 点击端点地标可聚焦</div>
          </div>

          <div v-if="selected" class="map-detail">
            <div class="map-detail-title">{{ selected.name }}</div>
            <div class="map-detail-region">{{ regionName(selected.region) }} · {{ relativeHint(selected) }}</div>
            <p class="map-detail-blurb">{{ selected.blurb }}</p>
            <div v-if="selectedLinks.length" class="map-links">
              <div class="sub-section-title" style="margin-top: 10px">相连道路</div>
              <button
                v-for="link in selectedLinks"
                :key="link.roadId + link.targetId"
                type="button"
                class="map-link-row"
                @click="focusLandmark(link.targetId)"
              >
                <span class="map-link-name">{{ link.targetName }}</span>
                <span class="map-link-meta">{{ link.roadName }} · {{ link.distance }}m</span>
              </button>
            </div>
            <div class="sub-section-title" style="margin-top: 12px">当前人员</div>
            <div class="outfit-row">
              <button
                v-for="p in peopleAt(selected.id)"
                :key="p.key"
                type="button"
                class="outfit-chip map-person-chip"
                :class="{ present: p.present, 'is-user': p.key === 'user' }"
                :title="personTooltip(p)"
                @click="onPersonClick(p)"
              >
                {{ p.label }}
                <small v-if="p.floor">· {{ p.floor }}F{{ p.roomName ? p.roomName : '' }}</small>
              </button>
              <span v-if="peopleAt(selected.id).length === 0" class="outfit-chip" style="opacity: 0.55">暂无</span>
            </div>
            <div v-if="selected.id === 'mansion'" class="map-detail-hint">
              主宅可切换楼层查看房间；点击人员可打开身份卡。
            </div>
            <div v-if="selected.custom" class="map-detail-actions">
              <button type="button" class="map-mini-btn" @click="startEdit(selected!)">编辑</button>
              <button type="button" class="map-mini-btn danger" @click="removeCustom(selected!.id)">删除</button>
            </div>
          </div>
          <div v-else class="map-detail map-detail-empty">
            <p>点击地标或道路探索庄园；滚轮缩放，拖拽平移；主宅可进入室内分层图。</p>
          </div>

          <div v-if="outdoorPeople.length" class="map-outdoor">
            <div class="sub-section-title">场外 / 未收录</div>
            <div class="outfit-row">
              <span v-for="p in outdoorPeople" :key="p.key" class="outfit-chip">
                {{ p.label }}
                <small>· {{ p.rawLoc }}</small>
              </span>
            </div>
          </div>
        </aside>

        <div class="map-canvas-wrap">
          <div class="map-compass" aria-hidden="true"><span>N</span></div>

          <button type="button" class="map-pan-btn map-pan-up" aria-label="上移" @click="pan(0, 1)">▲</button>
          <button type="button" class="map-pan-btn map-pan-down" aria-label="下移" @click="pan(0, -1)">▼</button>
          <button type="button" class="map-pan-btn map-pan-left" aria-label="左移" @click="pan(-1, 0)">◀</button>
          <button type="button" class="map-pan-btn map-pan-right" aria-label="右移" @click="pan(1, 0)">▶</button>

          <div class="map-zoom-controls">
            <button type="button" class="map-zoom-btn" aria-label="放大" title="放大" @click="zoomBy(1 / 1.2)">
              +
            </button>
            <button type="button" class="map-zoom-btn" aria-label="缩小" title="缩小" @click="zoomBy(1.2)">−</button>
            <button
              type="button"
              class="map-zoom-btn map-zoom-reset"
              aria-label="重置缩放"
              title="重置"
              @click="resetView"
            >
              ⊙
            </button>
          </div>

          <button type="button" class="map-add-fab" title="添加自定义建筑" @click="openCreate">+</button>

          <svg
            ref="svgRef"
            class="map-svg"
            :class="{ dragging }"
            :viewBox="viewBoxStr"
            role="img"
            aria-label="花园组织平面图"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerUp"
            @wheel.prevent="onWheel"
          >
            <defs>
              <linearGradient id="mapLawn" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#E4F0D6" />
                <stop offset="40%" stop-color="#D5E8C4" />
                <stop offset="100%" stop-color="#C4DDB0" />
              </linearGradient>
              <pattern id="mapGrassDot" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="8" r="1.1" fill="rgba(110, 140, 90, 0.14)" />
                <circle cx="18" cy="20" r="0.9" fill="rgba(90, 120, 70, 0.1)" />
                <circle cx="22" cy="6" r="0.7" fill="rgba(120, 150, 100, 0.12)" />
              </pattern>
              <radialGradient id="mapVignette" cx="50%" cy="50%" r="72%">
                <stop offset="55%" stop-color="rgba(40, 55, 30, 0)" />
                <stop offset="100%" stop-color="rgba(40, 55, 30, 0.14)" />
              </radialGradient>
              <radialGradient id="mapWaterGrad" cx="45%" cy="40%" r="65%">
                <stop offset="0%" stop-color="#B8E4F8" />
                <stop offset="55%" stop-color="#6BB8D8" />
                <stop offset="100%" stop-color="#3A8CB0" />
              </radialGradient>
              <linearGradient id="mapSand" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#F8E6C0" />
                <stop offset="100%" stop-color="#E8C890" />
              </linearGradient>
              <filter id="mapSoft" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#4a5a40" flood-opacity="0.18" />
              </filter>
              <filter id="mapLampGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="mapSelectGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#E87A5D" flood-opacity="0.55" />
              </filter>
              <filter id="mapAuraSoft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="mapSunFlare" cx="30%" cy="22%" r="55%">
                <stop offset="0%" stop-color="rgba(255, 248, 220, 0.28)" />
                <stop offset="45%" stop-color="rgba(255, 236, 180, 0.08)" />
                <stop offset="100%" stop-color="rgba(255, 236, 180, 0)" />
              </radialGradient>
            </defs>

            <!-- 草坪底 -->
            <rect :width="MAP_SIZE" :height="MAP_SIZE" fill="url(#mapLawn)" />
            <rect :width="MAP_SIZE" :height="MAP_SIZE" fill="url(#mapGrassDot)" />
            <!-- 斜阳光晕 -->
            <rect class="map-sun-flare" :width="MAP_SIZE" :height="MAP_SIZE" fill="url(#mapSunFlare)" pointer-events="none" />

            <!-- 规划网格 -->
            <g class="map-grid" opacity="0.22">
              <line
                v-for="(line, i) in MAP_GRID_LINES"
                :key="`grid-${i}`"
                :x1="worldToSvg(...line[0])[0]"
                :y1="worldToSvg(...line[0])[1]"
                :x2="worldToSvg(...line[1])[0]"
                :y2="worldToSvg(...line[1])[1]"
                stroke="rgba(90, 120, 70, 0.45)"
                stroke-width="1"
                stroke-dasharray="4 10"
              />
            </g>

            <!-- 围墙 -->
            <rect
              class="map-wall"
              :x="wallSvg.x"
              :y="wallSvg.y"
              :width="wallSvg.size"
              :height="wallSvg.size"
              fill="none"
              stroke="#8A7A68"
              stroke-width="10"
              rx="8"
              opacity="0.55"
            />
            <rect
              :x="wallSvg.x + 5"
              :y="wallSvg.y + 5"
              :width="wallSvg.size - 10"
              :height="wallSvg.size - 10"
              fill="none"
              stroke="rgba(120, 150, 90, 0.35)"
              stroke-width="3"
              rx="6"
            />

            <!-- 云朵（缓缓漂移） -->
            <g class="map-clouds" fill="#fff" pointer-events="none">
              <g class="map-cloud-drift a" opacity="0.2">
                <ellipse cx="180" cy="140" rx="55" ry="22" />
                <ellipse cx="220" cy="136" rx="38" ry="16" />
              </g>
              <g class="map-cloud-drift b" opacity="0.18">
                <ellipse cx="1120" cy="140" rx="55" ry="22" />
                <ellipse cx="1160" cy="136" rx="38" ry="16" />
              </g>
              <g class="map-cloud-drift c" opacity="0.16">
                <ellipse cx="180" cy="1160" rx="55" ry="22" />
                <ellipse cx="220" cy="1156" rx="38" ry="16" />
              </g>
              <g class="map-cloud-drift d" opacity="0.16">
                <ellipse cx="1120" cy="1160" rx="55" ry="22" />
                <ellipse cx="1160" cy="1156" rx="38" ry="16" />
              </g>
            </g>

            <!-- 空中浮尘 / 花粉 -->
            <g v-if="showAmbient" class="map-motes" pointer-events="none">
              <circle
                v-for="(m, i) in MAP_MOTES"
                :key="`mote-${i}`"
                class="map-mote"
                :cx="m[0]"
                :cy="m[1]"
                :r="m[2]"
                :style="{ animationDelay: `${m[3]}s` }"
                fill="rgba(255, 250, 230, 0.7)"
              />
            </g>

            <!-- 宽铺装道路：路缘 → 路面 → 中线 -->
            <g class="map-roads">
              <polyline
                v-for="road in MAP_ROADS"
                :key="`curb-${road.id}`"
                :points="roadPolyline(road)"
                fill="none"
                stroke="rgba(70, 78, 64, 0.42)"
                :stroke-width="roadCurbWidth(road)"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                v-for="road in MAP_ROADS"
                :key="`pavement-${road.id}`"
                class="map-road-pavement"
                :class="{
                  hovered: hoveredRoadId === road.id,
                  active: activeRoadIds.has(road.id),
                }"
                :points="roadPolyline(road)"
                fill="none"
                stroke="#A8A294"
                :stroke-width="roadPavementWidth(road)"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                v-for="road in MAP_ROADS"
                :key="`center-${road.id}`"
                class="map-road-dash"
                :class="{ active: activeRoadIds.has(road.id) || hoveredRoadId === road.id }"
                :points="roadPolyline(road)"
                fill="none"
                stroke="rgba(255, 248, 220, 0.55)"
                :stroke-width="Math.max(roadPavementWidth(road) * 0.08, 1.6)"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-dasharray="14 12"
                pointer-events="none"
              />
              <!-- 宽命中区 -->
              <polyline
                v-for="road in MAP_ROADS"
                :key="`hit-${road.id}`"
                class="map-road-hit"
                :points="roadPolyline(road)"
                fill="none"
                stroke="transparent"
                :stroke-width="roadPavementWidth(road) + 16"
                stroke-linecap="round"
                stroke-linejoin="round"
                @pointerenter="hoveredRoadId = road.id"
                @pointerleave="hoveredRoadId = null"
                @click.stop="selectRoad(road.id)"
              />
              <template v-if="showRoadLabels">
                <g v-for="road in MAP_ROADS" :key="`dist-${road.id}`" class="map-road-label">
                  <rect
                    :x="roadLabelSvg(road)[0] - 22"
                    :y="roadLabelSvg(road)[1] - 8"
                    width="44"
                    height="16"
                    rx="8"
                    fill="rgba(255,255,255,0.78)"
                  />
                  <text
                    :x="roadLabelSvg(road)[0]"
                    :y="roadLabelSvg(road)[1] + 4"
                    text-anchor="middle"
                    class="map-road-dist"
                  >
                    {{ roadLength(road) }}m
                  </text>
                </g>
              </template>
            </g>

            <!-- 碧浪湖 -->
            <ellipse
              class="map-lake"
              :cx="waterSvg[0]"
              :cy="waterSvg[1]"
              :rx="MAP_WATER.rx"
              :ry="MAP_WATER.ry"
              fill="url(#mapWaterGrad)"
              opacity="0.94"
            />
            <ellipse
              class="map-lake-shine"
              :cx="waterSvg[0] - 22"
              :cy="waterSvg[1] - 18"
              :rx="MAP_WATER.rx * 0.32"
              :ry="MAP_WATER.ry * 0.2"
              fill="rgba(255,255,255,0.32)"
            />

            <!-- 树木 -->
            <g v-for="(t, i) in MAP_TREES" :key="`tree-${i}`" :transform="treeTransform(t)">
              <g class="map-tree" :style="{ animationDelay: `${(i % 5) * 0.4}s` }">
                <circle r="11" fill="#6AAA68" opacity="0.35" cy="4" />
                <circle r="10" fill="#7CB87A" />
                <circle cx="-6" cy="4" r="7" fill="#6AAA68" />
                <circle cx="6" cy="3" r="7" fill="#8BC789" />
                <rect x="-2" y="8" width="4" height="8" rx="1" fill="#8B6A45" />
              </g>
            </g>

            <!-- 路灯（放大后显示，避免全景过密） -->
            <g v-if="showLamps">
              <g
                v-for="lamp in MAP_LAMPS"
                :key="lamp.id"
                class="map-lamp"
                :class="{ lit: activeRoadIds.has(lamp.roadId) || hoveredRoadId === lamp.roadId }"
                :transform="lampTransform(lamp)"
                @click.stop="selectRoad(lamp.roadId)"
              >
                <circle class="map-lamp-glow" r="9" fill="rgba(255, 220, 140, 0.35)" filter="url(#mapLampGlow)" />
                <rect x="-1.2" y="-2" width="2.4" height="11" rx="1" fill="#5A5048" />
                <circle cy="-4" r="3.2" fill="#F5E6A8" stroke="#E8C86A" stroke-width="0.8" />
              </g>
            </g>

            <!-- 地标 -->
            <g
              v-for="lm in allLandmarks"
              :key="lm.id"
              class="map-landmark"
              :class="{
                selected: selectedId === lm.id,
                occupied: peopleAt(lm.id).length > 0,
                'has-user': peopleAt(lm.id).some(p => p.key === 'user'),
                dimmed: regionFilter && lm.region !== regionFilter,
                custom: lm.custom,
                linked: activeLandmarkIds.has(lm.id) && selectedId !== lm.id,
              }"
              :filter="selectedId === lm.id ? 'url(#mapSelectGlow)' : 'url(#mapSoft)'"
              @click.stop="selectLandmark(lm.id)"
            >
              <!-- 有人 / 主角光环 -->
              <ellipse
                v-if="peopleAt(lm.id).length"
                class="map-presence-ring"
                :class="{ user: peopleAt(lm.id).some(p => p.key === 'user') }"
                :cx="centerSvg(lm)[0]"
                :cy="centerSvg(lm)[1]"
                :rx="ellipseRx(lm) + 10"
                :ry="ellipseRy(lm) + 10"
                fill="none"
                pointer-events="none"
              />
              <ellipse
                v-if="selectedId === lm.id"
                class="map-select-ping"
                :cx="centerSvg(lm)[0]"
                :cy="centerSvg(lm)[1]"
                :rx="ellipseRx(lm) + 6"
                :ry="ellipseRy(lm) + 6"
                fill="none"
                pointer-events="none"
              />

              <path
                v-if="lm.shape === 'convex'"
                class="map-shape"
                :d="convexPath(lm)"
                :fill="regionSoft(lm.region)"
                :stroke="regionColor(lm.region)"
                stroke-width="2.4"
              />
              <ellipse
                v-else-if="lm.id === 'beach'"
                class="map-shape"
                :cx="centerSvg(lm)[0]"
                :cy="centerSvg(lm)[1]"
                :rx="ellipseRx(lm)"
                :ry="ellipseRy(lm)"
                fill="url(#mapSand)"
                stroke="#D4A86A"
                stroke-width="2.2"
              />
              <ellipse
                v-else-if="lm.shape === 'ellipse' || lm.shape === 'circle'"
                class="map-shape"
                :cx="centerSvg(lm)[0]"
                :cy="centerSvg(lm)[1]"
                :rx="ellipseRx(lm)"
                :ry="ellipseRy(lm)"
                :fill="regionSoft(lm.region)"
                :stroke="regionColor(lm.region)"
                stroke-width="2.2"
              />
              <rect
                v-else
                class="map-shape"
                v-bind="landmarkSvgRect(lm)"
                rx="12"
                ry="12"
                :fill="regionSoft(lm.region)"
                :stroke="regionColor(lm.region)"
                stroke-width="2.2"
              />

              <LandmarkGlyph
                v-if="showGlyphs && !lm.custom"
                :landmark-id="lm.id"
                :x="glyphPos(lm)[0]"
                :y="glyphPos(lm)[1]"
                :scale="glyphScale"
                :busy="peopleAt(lm.id).length > 0"
                :is-user="peopleAt(lm.id).some(p => p.key === 'user')"
                :delay="glyphDelay(lm.id)"
              />

              <rect
                class="map-label-bg"
                :x="centerSvg(lm)[0] - labelWidth(lm) / 2"
                :y="centerSvg(lm)[1] + (showGlyphs && !lm.custom ? 6 : -9)"
                :width="labelWidth(lm)"
                :height="18"
                rx="9"
                fill="rgba(255, 255, 255, 0.88)"
              />
              <text
                :x="centerSvg(lm)[0]"
                :y="centerSvg(lm)[1] + (showGlyphs && !lm.custom ? 19 : 4)"
                text-anchor="middle"
                class="map-label"
              >
                {{ lm.label }}
              </text>

              <g v-if="peopleAt(lm.id).length" :transform="badgeTransform(lm)">
                <g class="map-badge">
                  <circle
                    r="11"
                    class="map-badge-circle"
                    :class="{ user: peopleAt(lm.id).some(p => p.key === 'user') }"
                  />
                  <text y="4" text-anchor="middle" class="map-badge-num">{{ peopleAt(lm.id).length }}</text>
                </g>
              </g>
            </g>

            <!-- 暗角 -->
            <rect :width="MAP_SIZE" :height="MAP_SIZE" fill="url(#mapVignette)" pointer-events="none" />
          </svg>

          <div v-if="formOpen" class="map-form">
            <div class="map-form-title">{{ editingId ? '编辑建筑' : '添加自定义建筑' }}</div>
            <label class="map-form-field">
              <span>名称</span>
              <input v-model="form.name" type="text" maxlength="20" placeholder="例如：温室花房" />
            </label>
            <label class="map-form-field">
              <span>描述</span>
              <textarea v-model="form.blurb" rows="2" maxlength="120" placeholder="一句话介绍"></textarea>
            </label>
            <div class="map-form-row">
              <label class="map-form-field">
                <span>X（东为正）</span>
                <input v-model.number="form.x" type="number" step="10" />
              </label>
              <label class="map-form-field">
                <span>Y（北为正）</span>
                <input v-model.number="form.y" type="number" step="10" />
              </label>
            </div>
            <p class="map-form-hint">
              {{ pickMode ? '请点击地图空白处选点…' : '点「地图选点」或手动填坐标（约 ±620）；滚轮可缩放' }}
            </p>
            <div class="map-form-actions">
              <button type="button" class="map-mini-btn" @click="pickMode = true">地图选点</button>
              <button type="button" class="map-mini-btn" @click="formOpen = false">取消</button>
              <button type="button" class="map-mini-btn primary" @click="saveForm">保存</button>
            </div>
          </div>

          <!-- 主宅室内分层平面 -->
          <div v-if="interiorOpen" class="mansion-interior" @click.stop>
            <div class="mansion-interior-head">
              <div>
                <div class="mansion-interior-title">主宅邸 · 室内</div>
                <div class="mansion-interior-theme">{{ currentFloor.theme }}</div>
              </div>
              <button type="button" class="map-mini-btn" @click="interiorOpen = false">返回庄园</button>
            </div>
            <div class="mansion-floor-tabs">
              <button
                v-for="f in MANSION_FLOORS"
                :key="f.level"
                type="button"
                class="mansion-floor-tab"
                :class="{
                  active: mansionFloor === f.level,
                  occupied: floorHasPeople(f.level),
                  'has-user': floorHasUser(f.level),
                }"
                @click="mansionFloor = f.level"
              >
                {{ f.short }}
                <small>{{ f.name.split('·')[1]?.trim() || f.name }}</small>
              </button>
            </div>
            <div class="mansion-floor-plan">
              <div
                v-for="room in currentFloor.rooms"
                :key="room.id"
                class="mansion-room"
                :class="{
                  selected: selectedRoomId === room.id,
                  occupied: peopleInRoom(room.id).length > 0,
                  'has-user': peopleInRoom(room.id).some(p => p.key === 'user'),
                }"
                :style="roomStyle(room)"
                @click="selectRoom(room.id)"
              >
                <div class="mansion-room-name">{{ room.name }}</div>
                <div v-if="peopleInRoom(room.id).length" class="mansion-room-people">
                  <button
                    v-for="p in peopleInRoom(room.id)"
                    :key="p.key"
                    type="button"
                    class="mansion-person-pin"
                    :class="{ 'is-user': p.key === 'user' }"
                    :title="personTooltip(p)"
                    @click.stop="onPersonClick(p)"
                  >
                    {{ p.label }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="floorUnassigned.length" class="mansion-unassigned">
              <span class="mansion-unassigned-label">本层未定位房间</span>
              <button
                v-for="p in floorUnassigned"
                :key="p.key"
                type="button"
                class="mansion-person-pin"
                :class="{ 'is-user': p.key === 'user' }"
                :title="personTooltip(p)"
                @click="onPersonClick(p)"
              >
                {{ p.label }}
              </button>
            </div>
            <div v-if="selectedRoom" class="mansion-room-detail">
              <div class="mansion-room-detail-title">{{ selectedRoom.name }}</div>
              <p>{{ selectedRoom.blurb }}</p>
              <div class="outfit-row" style="margin-top: 8px">
                <button
                  v-for="p in peopleInRoom(selectedRoom.id)"
                  :key="p.key"
                  type="button"
                  class="outfit-chip map-person-chip"
                  :class="{ present: p.present, 'is-user': p.key === 'user' }"
                  @click="onPersonClick(p)"
                >
                  {{ p.label }}
                  <small v-if="p.schedule && p.schedule !== '无'">· 行程 {{ p.schedule }}</small>
                </button>
                <span v-if="peopleInRoom(selectedRoom.id).length === 0" class="outfit-chip" style="opacity: 0.55"
                  >暂无人员</span
                >
              </div>
            </div>
            <div v-else class="mansion-room-detail mansion-room-detail-empty">
              <p>{{ currentFloor.name }} — 点击房间查看人员；有人的房间会高亮。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCustomLandmarksStore } from '../customLandmarks';
import {
  convexPath,
  getMansionFloor,
  getRegion,
  landmarkLinks,
  landmarkSvgRect,
  MANSION_FLOORS,
  MAP_BOUNDS,
  MAP_GRID_LINES,
  MAP_LAMPS,
  MAP_LANDMARKS,
  MAP_REGIONS,
  MAP_ROADS,
  MAP_SIZE,
  MAP_TREES,
  MAP_WALL,
  MAP_WATER,
  type MapLamp,
  type MapLandmark,
  type MapRegionId,
  type MansionRoom,
  relativeHint,
  resolveLocation,
  roadCurbWidth,
  roadLength,
  roadMidpoint,
  roadPavementWidth,
  roadPolyline,
  VIEW_SPAN_DEFAULT,
  VIEW_SPAN_MAX,
  VIEW_SPAN_MIN,
  worldToSvg,
} from '../mapData';
import { useDataStore } from '../store';
import { asRecord, isPresent } from '../utils';
import LandmarkGlyph from './LandmarkGlyph.vue';

type PersonPin = {
  key: string;
  label: string;
  present: boolean;
  rawLoc: string;
  landmarkId: string | null;
  floor: 1 | 2 | 3 | 4 | null;
  roomId: string | null;
  roomName: string | null;
  schedule: string;
};

const emit = defineEmits<{ close: []; openIdentity: [name: string]; openRoster: [name?: string] }>();
const store = useDataStore();
const customStore = useCustomLandmarksStore();

const svgRef = ref<SVGSVGElement | null>(null);
const selectedId = ref<string | null>('mansion');
const selectedRoadId = ref<string | null>(null);
const hoveredRoadId = ref<string | null>(null);
const regionFilter = ref<MapRegionId | null>(null);
const formOpen = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({ name: '', blurb: '', x: 100, y: 100 });

/** 主宅室内 */
const interiorOpen = ref(false);
const mansionFloor = ref<1 | 2 | 3 | 4>(4);
const selectedRoomId = ref<string | null>(null);

/** 视口平移（世界坐标偏移，拖动画布） */
const panX = ref(0);
const panY = ref(0);
const viewSpan = ref(VIEW_SPAN_DEFAULT);
const dragging = ref(false);
const dragStart = ref<{ x: number; y: number; panX: number; panY: number } | null>(null);
const pickMode = ref(false);

const filterRegions = computed(() => MAP_REGIONS.filter(r => r.id !== 'custom' || customStore.landmarks.length > 0));

const allLandmarks = computed(() => [...MAP_LANDMARKS, ...customStore.landmarks]);

const selected = computed(() => allLandmarks.value.find(l => l.id === selectedId.value) || null);

const selectedRoad = computed(() => MAP_ROADS.find(r => r.id === selectedRoadId.value) || null);

const selectedLinks = computed(() => (selected.value ? landmarkLinks(selected.value.id, customStore.landmarks) : []));

const currentFloor = computed(() => getMansionFloor(mansionFloor.value));

const selectedRoom = computed(
  (): MansionRoom | null => currentFloor.value.rooms.find(r => r.id === selectedRoomId.value) || null,
);

/** 当前楼层有楼层信息但未匹配到具体房间的人员 */
const floorUnassigned = computed(() =>
  peopleOnFloor(mansionFloor.value).filter(p => !p.roomId),
);

/** 当前高亮道路：选中地标相连 + 悬停/点选道路 */
const activeRoadIds = computed(() => {
  const ids = new Set<string>();
  if (selectedRoadId.value) ids.add(selectedRoadId.value);
  if (hoveredRoadId.value) ids.add(hoveredRoadId.value);
  for (const link of selectedLinks.value) ids.add(link.roadId);
  return ids;
});

const activeLandmarkIds = computed(() => {
  const ids = new Set<string>();
  const road = selectedRoad.value;
  if (road) {
    ids.add(road.from);
    ids.add(road.to);
  }
  return ids;
});

/** 放大后才显示道路米数，避免全景时标签过密 */
const showRoadLabels = computed(() => viewSpan.value <= 700);
/** 路灯在中等缩放以上显示 */
const showLamps = computed(() => viewSpan.value <= 980);
/** 地标符号：全景也显示，放大时略放大 */
const showGlyphs = computed(() => viewSpan.value <= 1300);
const glyphScale = computed(() => (viewSpan.value <= 700 ? 1.15 : viewSpan.value <= 980 ? 1 : 0.88));
/** 浮尘在中等缩放以上显示，避免全景噪点 */
const showAmbient = computed(() => viewSpan.value <= 1100);

/** SVG 坐标下的浮尘点 [cx, cy, r, delay] */
const MAP_MOTES: [number, number, number, number][] = [
  [220, 280, 1.4, 0],
  [480, 190, 1.1, 0.8],
  [760, 320, 1.3, 1.6],
  [980, 240, 1.0, 0.4],
  [340, 520, 1.2, 2.1],
  [620, 610, 1.5, 1.2],
  [880, 540, 1.1, 2.8],
  [410, 860, 1.3, 0.6],
  [700, 900, 1.0, 1.9],
  [960, 780, 1.4, 3.2],
  [180, 700, 1.1, 2.4],
  [1050, 480, 1.2, 1.1],
];

function glyphDelay(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 17;
  return `${(h * 0.12).toFixed(2)}s`;
}

const viewBoxStr = computed(() => {
  const span = viewSpan.value;
  const [cx, cy] = worldToSvg(panX.value, panY.value);
  const x = cx - span / 2;
  const y = cy - span / 2;
  return `${x} ${y} ${span} ${span}`;
});

const waterSvg = computed(() => worldToSvg(...MAP_WATER.center));

const wallSvg = computed(() => {
  const [x, yTop] = worldToSvg(MAP_WALL.min, MAP_WALL.max);
  const size = MAP_WALL.max - MAP_WALL.min;
  return { x, y: yTop, size };
});

const people = computed((): PersonPin[] => {
  const extras = customStore.landmarks;
  const list: PersonPin[] = [];
  const userLoc = String(_.get(store.data, '主角.当前位置', '待初始化'));
  const userResolved = resolveLocation(userLoc, extras);
  list.push({
    key: 'user',
    label: '主角',
    present: true,
    rawLoc: userLoc,
    landmarkId: userResolved.landmarkId,
    floor: userResolved.floor,
    roomId: userResolved.roomId,
    roomName: userResolved.roomName,
    schedule: '无',
  });
  Object.entries(asRecord(_.get(store.data, '成员名册', {}))).forEach(([name, d]) => {
    const rawLoc = String(_.get(d, '当前位置', '待初始化'));
    const resolved = resolveLocation(rawLoc, extras);
    list.push({
      key: name,
      label: name,
      present: isPresent(_.get(d, '是否在场', false)),
      rawLoc,
      landmarkId: resolved.landmarkId,
      floor: resolved.floor,
      roomId: resolved.roomId,
      roomName: resolved.roomName,
      schedule: String(_.get(d, '之后行程', '无') || '无'),
    });
  });
  return list;
});

const outdoorPeople = computed(() => people.value.filter(p => !p.landmarkId));
const presentCount = computed(
  () =>
    Object.values(asRecord(_.get(store.data, '成员名册', {}))).filter(d => isPresent(_.get(d, '是否在场', false)))
      .length,
);

const peopleByLandmark = computed(() => {
  const map = new Map<string, PersonPin[]>();
  for (const p of people.value) {
    if (!p.landmarkId) continue;
    if (!map.has(p.landmarkId)) map.set(p.landmarkId, []);
    map.get(p.landmarkId)!.push(p);
  }
  return map;
});

function peopleAt(id: string) {
  return peopleByLandmark.value.get(id) || [];
}

function peopleInRoom(roomId: string) {
  return people.value.filter(p => p.landmarkId === 'mansion' && p.roomId === roomId);
}

function peopleOnFloor(level: 1 | 2 | 3 | 4) {
  return people.value.filter(p => p.landmarkId === 'mansion' && p.floor === level);
}

function floorHasPeople(level: 1 | 2 | 3 | 4) {
  return peopleOnFloor(level).length > 0;
}

function floorHasUser(level: 1 | 2 | 3 | 4) {
  return peopleOnFloor(level).some(p => p.key === 'user');
}

function roomStyle(room: MansionRoom) {
  const [x, y, w, h] = room.rect;
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`,
    height: `${h}%`,
  };
}

function personTooltip(p: PersonPin) {
  const parts = [p.rawLoc];
  if (p.schedule && p.schedule !== '无') parts.push(`行程：${p.schedule}`);
  return parts.join(' · ');
}

function onPersonClick(p: PersonPin) {
  if (p.key === 'user') {
    emit('openRoster');
    return;
  }
  emit('openIdentity', p.key);
}

function selectLandmark(id: string) {
  selectedId.value = id;
  selectedRoadId.value = null;
  if (id === 'mansion') {
    // 双击感：已在主宅时再次点击可进室内；首次选中则自动打开
    openInteriorForSelection();
  } else {
    interiorOpen.value = false;
    selectedRoomId.value = null;
  }
}

function openInteriorForSelection() {
  const user = people.value.find(p => p.key === 'user');
  const prefer =
    user?.landmarkId === 'mansion' && user.floor
      ? user.floor
      : peopleAt('mansion').find(p => p.floor)?.floor || 1;
  mansionFloor.value = prefer;
  selectedRoomId.value = user?.landmarkId === 'mansion' ? user.roomId : peopleAt('mansion').find(p => p.roomId)?.roomId || null;
  interiorOpen.value = true;
}

function toggleInterior() {
  if (interiorOpen.value) {
    interiorOpen.value = false;
    return;
  }
  selectedId.value = 'mansion';
  openInteriorForSelection();
}

function selectRoom(id: string) {
  selectedRoomId.value = selectedRoomId.value === id ? null : id;
}

function selectRoad(id: string) {
  selectedRoadId.value = id;
  interiorOpen.value = false;
  const road = MAP_ROADS.find(r => r.id === id);
  if (!road) return;
  const [mx, my] = roadMidpoint(road);
  const [nx, ny] = customStore.clampPos(mx, my);
  panX.value = nx;
  panY.value = ny;
  selectedId.value = road.from;
}

function focusLandmark(id: string) {
  selectedId.value = id;
  selectedRoadId.value = null;
  const lm = allLandmarks.value.find(l => l.id === id);
  if (!lm) return;
  const [nx, ny] = customStore.clampPos(lm.center[0], lm.center[1]);
  panX.value = nx;
  panY.value = ny;
  if (id === 'mansion') openInteriorForSelection();
  else interiorOpen.value = false;
}

function locateUser() {
  const user = people.value.find(p => p.key === 'user');
  if (!user?.landmarkId) {
    toastr.info('主角当前位置未匹配到庄园地标');
    return;
  }
  focusLandmark(user.landmarkId);
  if (user.landmarkId === 'mansion' && user.floor) {
    mansionFloor.value = user.floor;
    selectedRoomId.value = user.roomId;
    interiorOpen.value = true;
  }
  toastr.success(`已定位：${user.rawLoc}`);
}

function roadLabelSvg(road: (typeof MAP_ROADS)[number]): [number, number] {
  return worldToSvg(...roadMidpoint(road));
}

function lampTransform(lamp: MapLamp) {
  const [x, y] = worldToSvg(lamp.x, lamp.y);
  const deg = (-lamp.angle * 180) / Math.PI;
  return `translate(${x}, ${y}) rotate(${deg})`;
}

function regionName(id: MapRegionId) {
  return getRegion(id)?.name || id;
}
function regionSoft(id: MapRegionId) {
  return getRegion(id)?.soft || 'rgba(224, 208, 192, 0.88)';
}
function regionColor(id: MapRegionId) {
  return getRegion(id)?.color || '#B89578';
}

function ellipseRx(lm: MapLandmark) {
  if (lm.shape === 'circle' && lm.radius) return lm.radius;
  return (lm.bounds[1] - lm.bounds[0]) / 2;
}
function ellipseRy(lm: MapLandmark) {
  if (lm.shape === 'circle' && lm.radius) return lm.radius;
  return (lm.bounds[3] - lm.bounds[2]) / 2;
}
function centerSvg(lm: MapLandmark): [number, number] {
  return worldToSvg(lm.center[0], lm.center[1]);
}
function labelWidth(lm: MapLandmark) {
  return Math.max(lm.label.length * 13 + 16, 44);
}
function badgeTransform(lm: MapLandmark) {
  const [cx, cy] = centerSvg(lm);
  return `translate(${cx + ellipseRx(lm) * 0.62}, ${cy - ellipseRy(lm) * 0.55})`;
}
function glyphPos(lm: MapLandmark): [number, number] {
  const [cx, cy] = centerSvg(lm);
  // 落在形状上半部，名称标签下移让出空间
  return [cx, cy - Math.max(ellipseRy(lm) * 0.22, 8)];
}
function treeTransform(t: [number, number]) {
  const [x, y] = worldToSvg(...t);
  return `translate(${x}, ${y})`;
}

function pan(dx: number, dy: number) {
  const step = Math.max(40, viewSpan.value * 0.08);
  const [nx, ny] = customStore.clampPos(panX.value + dx * step, panY.value + dy * step);
  panX.value = nx;
  panY.value = ny;
}

function clientToWorld(svg: SVGSVGElement, clientX: number, clientY: number): [number, number] {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return [0, 0];
  const sp = pt.matrixTransform(ctm.inverse());
  return [sp.x + MAP_BOUNDS.min, MAP_BOUNDS.max - sp.y];
}

/** 以世界坐标锚点缩放，保持锚点在视口中相对位置不变 */
function zoomAt(worldX: number, worldY: number, factor: number) {
  const oldSpan = viewSpan.value;
  const newSpan = _.clamp(oldSpan * factor, VIEW_SPAN_MIN, VIEW_SPAN_MAX);
  if (newSpan === oldSpan) return;
  const ratio = newSpan / oldSpan;
  const [nx, ny] = customStore.clampPos(worldX - (worldX - panX.value) * ratio, worldY - (worldY - panY.value) * ratio);
  panX.value = nx;
  panY.value = ny;
  viewSpan.value = newSpan;
}

function zoomBy(factor: number) {
  zoomAt(panX.value, panY.value, factor);
}

function resetView() {
  viewSpan.value = VIEW_SPAN_DEFAULT;
  const lm = selected.value || allLandmarks.value.find(l => l.id === 'mansion');
  if (lm) {
    const [nx, ny] = customStore.clampPos(lm.center[0], lm.center[1]);
    panX.value = nx;
    panY.value = ny;
  } else {
    panX.value = 0;
    panY.value = 0;
  }
}

function onWheel(e: WheelEvent) {
  if (interiorOpen.value) return;
  const svg = (e.currentTarget as SVGSVGElement) || svgRef.value;
  if (!svg) return;
  const [wx, wy] = clientToWorld(svg, e.clientX, e.clientY);
  const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
  zoomAt(wx, wy, factor);
}

function onPointerDown(e: PointerEvent) {
  if (interiorOpen.value) return;
  const svg = e.currentTarget as SVGSVGElement;
  if (formOpen.value && pickMode.value) {
    const [x, y] = customStore.clampPos(...clientToWorld(svg, e.clientX, e.clientY));
    form.x = Math.round(x / 10) * 10;
    form.y = Math.round(y / 10) * 10;
    pickMode.value = false;
    return;
  }
  const target = e.target as Element;
  if (target.closest?.('.map-landmark') || target.closest?.('.map-road-hit') || target.closest?.('.map-lamp')) return;
  dragging.value = true;
  dragStart.value = { x: e.clientX, y: e.clientY, panX: panX.value, panY: panY.value };
  svg.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || !dragStart.value) return;
  const scale = viewSpan.value / 400;
  const dx = (e.clientX - dragStart.value.x) * scale * 0.35;
  const dy = (e.clientY - dragStart.value.y) * scale * 0.35;
  const [nx, ny] = customStore.clampPos(dragStart.value.panX - dx, dragStart.value.panY + dy);
  panX.value = nx;
  panY.value = ny;
}

function onPointerUp() {
  dragging.value = false;
  dragStart.value = null;
}

function openCreate() {
  editingId.value = null;
  interiorOpen.value = false;
  const [x, y] = customStore.clampPos(panX.value + 120, panY.value + 80);
  form.name = '';
  form.blurb = '';
  form.x = Math.round(x / 10) * 10;
  form.y = Math.round(y / 10) * 10;
  formOpen.value = true;
  pickMode.value = true;
}

function startEdit(lm: MapLandmark) {
  if (!lm.custom) return;
  editingId.value = lm.id;
  form.name = lm.name;
  form.blurb = lm.blurb;
  form.x = lm.center[0];
  form.y = lm.center[1];
  formOpen.value = true;
  pickMode.value = false;
}

function saveForm() {
  const name = form.name.trim();
  if (!name) {
    toastr.warning('请填写建筑名称');
    return;
  }
  const [x, y] = customStore.clampPos(Number(form.x) || 0, Number(form.y) || 0);
  if (editingId.value) {
    customStore.update(editingId.value, { name, blurb: form.blurb, x, y, region: 'custom' });
    selectedId.value = editingId.value;
  } else {
    const id = customStore.add({ name, blurb: form.blurb, x, y, region: 'custom' });
    selectedId.value = id;
  }
  formOpen.value = false;
  pickMode.value = false;
  toastr.success('已保存自定义建筑');
}

function removeCustom(id: string) {
  customStore.remove(id);
  selectedId.value = 'mansion';
  toastr.info('已删除自定义建筑');
}

onMounted(() => {
  const user = people.value.find(p => p.key === 'user');
  if (user?.landmarkId) {
    selectedId.value = user.landmarkId;
    const lm = allLandmarks.value.find(l => l.id === user.landmarkId);
    if (lm) {
      panX.value = lm.center[0];
      panY.value = lm.center[1];
    }
    if (user.landmarkId === 'mansion') {
      if (user.floor) mansionFloor.value = user.floor;
      selectedRoomId.value = user.roomId;
      interiorOpen.value = true;
    }
  }
});
</script>
