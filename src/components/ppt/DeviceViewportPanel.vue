<script setup lang="ts">
import { NTable } from 'naive-ui'
import type {
  DeviceViewportRow,
  DeviceViewportTableMode,
  DeviceViewportVariant,
} from './deviceViewport'

withDefaults(defineProps<{
  title: string
  summary: string
  shareLabel?: string
  detailLabel?: string
  rows: DeviceViewportRow[]
  variant: DeviceViewportVariant
  tableMode?: DeviceViewportTableMode
}>(), {
  shareLabel: '',
  detailLabel: '主要代表',
  tableMode: 'metrics',
})
</script>

<template>
  <article class="device-panel" :class="`device-panel--${variant}`">
    <header class="device-panelHead">
      <div>
        <i aria-hidden="true"></i>
        <h3>{{ title }}</h3>
      </div>
      <span>{{ summary }}</span>
    </header>

    <div class="device-tableArea">
      <NTable
        class="device-viewportTable"
        :class="`device-viewportTable--${tableMode}`"
        :bordered="false"
        :single-line="false"
      >
        <colgroup v-if="tableMode === 'metrics'">
          <col class="device-viewportColumn" />
          <col class="device-countColumn" />
          <col class="device-shareColumn" />
          <col class="device-coverageColumn" />
        </colgroup>
        <colgroup v-else>
          <col class="device-detailViewportColumn" />
          <col class="device-detailColumn" />
        </colgroup>
        <thead>
          <tr v-if="tableMode === 'metrics'">
            <th>逻辑分辨率</th>
            <th>设备数</th>
            <th>{{ shareLabel }}</th>
            <th>累计覆盖</th>
          </tr>
          <tr v-else>
            <th>逻辑视口</th>
            <th>{{ detailLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.viewport">
            <td><strong>{{ row.viewport }}</strong></td>
            <template v-if="tableMode === 'metrics'">
              <td>{{ row.count }}</td>
              <td>{{ row.share }}</td>
              <td>{{ row.cumulativeCoverage }}</td>
            </template>
            <td v-else>{{ row.detail }}</td>
          </tr>
        </tbody>
      </NTable>
    </div>

    <footer class="device-matrix">
      <span>选入验收矩阵</span>
      <ul>
        <li v-for="row in rows" :key="`${row.viewport}-matrix`">
          {{ row.viewport }}
        </li>
      </ul>
    </footer>
  </article>
</template>

<style scoped>
.device-panel {
  min-width: 0;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(300px, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgba(18, 49, 47, 0.14);
  border-top: clamp(2px, 0.16cqw, 3px) solid #145c53;
  border-radius: clamp(8px, 0.62cqw, 12px);
  background: rgba(255, 255, 255, 0.48);
}

.device-panelHead {
  min-height: clamp(52px, 3.7cqw, 70px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(12px, 1cqw, 20px);
  padding: 0 clamp(15px, 1.15cqw, 22px);
  border-bottom: 1px solid rgba(18, 49, 47, 0.12);
}

.device-panelHead > div {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: clamp(7px, 0.52cqw, 10px);
}

.device-panelHead i {
  display: none;
  width: clamp(6px, 0.42cqw, 8px);
  height: clamp(6px, 0.42cqw, 8px);
  flex: 0 0 auto;
  border-radius: 50%;
  background: #ee764d;
}

.device-panel--iphone .device-panelHead i,
.device-panel--android-phone .device-panelHead i {
  display: block;
}

.device-panelHead h3 {
  margin: 0;
  color: #12312f;
  font-size: clamp(22px, 1.55cqw, 30px);
  font-weight: 860;
  line-height: 1.1;
}

.device-panelHead span {
  color: #58726e;
  font-size: clamp(13px, 0.88cqw, 17px);
  font-weight: 760;
  line-height: 1.2;
  white-space: nowrap;
}

.device-tableArea {
  min-height: clamp(300px, 17cqw, 360px);
  align-self: stretch;
}

.device-viewportTable {
  --n-font-size: clamp(13px, 0.9cqw, 17px) !important;
  --n-border-color: rgba(18, 49, 47, 0.1) !important;
  --n-th-color: rgba(20, 92, 83, 0.075) !important;
  --n-td-color: transparent !important;
  --n-th-text-color: #355753 !important;
  --n-td-text-color: #355753 !important;
  --n-th-font-weight: 800 !important;
}

.device-viewportColumn {
  width: 32%;
}

.device-countColumn {
  width: 18%;
}

.device-shareColumn {
  width: 24%;
}

.device-coverageColumn {
  width: 26%;
}

.device-detailViewportColumn {
  width: 30%;
}

.device-detailColumn {
  width: 70%;
}

:deep(.device-viewportTable th),
:deep(.device-viewportTable td) {
  height: clamp(38px, 2.35cqw, 48px);
  padding: 0 clamp(9px, 0.66cqw, 13px) !important;
}

:deep(.device-viewportTable th:not(:first-child)),
:deep(.device-viewportTable td:not(:first-child)) {
  text-align: right;
}

:deep(.device-viewportTable td) {
  font-variant-numeric: tabular-nums;
}

:deep(.device-viewportTable td:first-child) {
  text-align: left;
}

:deep(.device-viewportTable--details th:last-child),
:deep(.device-viewportTable--details td:last-child) {
  text-align: left;
}

:deep(.device-viewportTable td strong) {
  color: #12312f;
  font-weight: 860;
  font-variant-numeric: tabular-nums;
}

.device-matrix {
  min-height: clamp(88px, 6.4cqw, 122px);
  display: grid;
  align-content: center;
  gap: clamp(8px, 0.62cqw, 12px);
  padding: clamp(12px, 0.9cqw, 18px) clamp(15px, 1.15cqw, 22px);
  border-top: 1px solid rgba(18, 49, 47, 0.12);
  background: rgba(220, 239, 224, 0.4);
}

.device-panel--iphone .device-matrix,
.device-panel--android-phone .device-matrix {
  background: rgba(255, 242, 233, 0.38);
}

.device-matrix > span {
  color: #58726e;
  font-size: clamp(12px, 0.8cqw, 15px);
  font-weight: 820;
}

.device-matrix ul {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(6px, 0.48cqw, 9px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.device-matrix li {
  padding: clamp(5px, 0.36cqw, 7px) clamp(8px, 0.58cqw, 11px);
  border: 1px solid rgba(20, 92, 83, 0.16);
  border-radius: clamp(3px, 0.24cqw, 5px);
  color: #123f39;
  background: rgba(220, 239, 224, 0.84);
  font-size: clamp(13px, 0.88cqw, 17px);
  font-weight: 830;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.device-panel--iphone .device-matrix li,
.device-panel--android-phone .device-matrix li {
  border-color: rgba(238, 118, 77, 0.34);
  color: #71422f;
  background: rgba(255, 248, 242, 0.9);
}
</style>
