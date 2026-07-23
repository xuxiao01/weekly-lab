<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { NTable } from 'naive-ui'
import DeviceViewportPanel from '@/components/ppt/DeviceViewportPanel.vue'
import WorkflowLane from '@/components/ppt/WorkflowLane.vue'
import type { DeviceViewportRow } from '@/components/ppt/deviceViewport'
import type { WorkflowStep } from '@/components/ppt/workflow'
import viewportLabOverviewUrl from '@/assets/images/viewport-lab-overview.png'
import viewportEffectFlipCardUrl from '@/assets/images/viewport01.png'
import viewportEffectWordGameUrl from '@/assets/images/viewport02.png'
import viewportEffectHomeUrl from '@/assets/images/viewport03.png'
import viewportEffectRankingUrl from '@/assets/images/viewport04.png'
import viewportAgentPlaceholderOneUrl from '@/assets/images/viewport05.png'
import viewportAgentPlaceholderTwoUrl from '@/assets/images/viewport06.png'
import viewportIssueLevelUrl from '@/assets/images/viewport07.png'
import viewportIssueLetterUrl from '@/assets/images/viewport08.png'
import viewportIssueTreasureUrl from '@/assets/images/viewport09.png'
import viewportRepairLevelUrl from '@/assets/images/viewport10.png'

echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
])

const currentSlide = ref(1)
const totalSlides = 19
const galleryIndex = ref(0)
const isGalleryOpen = ref(false)
const platformChartRef = ref<HTMLDivElement | null>(null)
const deviceTypeChartRef = ref<HTMLDivElement | null>(null)
const platformTypeChartRef = ref<HTMLDivElement | null>(null)
const chartInstances: echarts.ECharts[] = []
let chartResizeObserver: ResizeObserver | null = null

const basicGalleryImages = [
  {
    src: viewportEffectFlipCardUrl,
    title: '汉字翻翻卡',
    description: '17 个视口 · 完整任务结果',
    alt: '汉字翻翻卡在 17 个逻辑视口下的完整任务效果长截图',
  },
  {
    src: viewportEffectWordGameUrl,
    title: '组词消消乐',
    description: '17 个视口 · 完整任务结果',
    alt: '组词消消乐在 17 个逻辑视口下的完整任务效果长截图',
  },
  {
    src: viewportEffectHomeUrl,
    title: '线上新首页',
    description: '17 个视口 · 完整任务结果',
    alt: '线上新首页在 17 个逻辑视口下的完整任务效果长截图',
  },
  {
    src: viewportEffectRankingUrl,
    title: '排行榜',
    description: '17 个视口 · 完整任务结果',
    alt: '排行榜在 17 个逻辑视口下的完整任务效果长截图',
  },
]

const agentGalleryImages = [
  {
    src: viewportAgentPlaceholderOneUrl,
    title: '拓展功能占位图 01',
    description: '待替换 · Agent 操作效果截图',
    alt: '拓展功能效果截图占位图一',
  },
  {
    src: viewportAgentPlaceholderTwoUrl,
    title: '拓展功能占位图 02',
    description: '待替换 · Agent 操作效果截图',
    alt: '拓展功能效果截图占位图二',
  },
]

const issueGalleryImages = [
  {
    src: viewportIssueLevelUrl,
    title: '平板关卡页问题',
    description: '问题 01 · 平板关卡按钮过小',
    alt: '平板关卡页中关卡按钮尺寸过小的问题截图',
  },
  {
    src: viewportIssueLetterUrl,
    title: '汤圆信箱信纸布局问题',
    description: '问题 02 · 平板信纸布局不稳定',
    alt: '汤圆信箱在平板中的信纸布局问题截图',
  },
  {
    src: viewportIssueTreasureUrl,
    title: '平板百宝箱首屏问题',
    description: '问题 03 · 小游戏卡片首屏几乎不可见',
    alt: '苹果平板和安卓平板百宝箱首屏小游戏卡片不可见的问题截图',
  },
  {
    src: viewportRepairLevelUrl,
    title: '关卡页平板适配修复',
    description: '解决方案 · 关卡按钮布局调整结果',
    alt: '关卡页平板适配问题修复后的效果截图',
  },
]

const coverAgenda = [
  '为什么要做多端适配',
  '理解移动端逻辑视口',
  '用真实设备数据建立视口矩阵',
  'Viewport Lab：多视口检查工具',
  '基本功能：批量截图验证',
  '拓展功能：Agent 自动操作',
  '工具发现的真实适配问题',
  '从单点修复到可验证闭环',
]

const viewportLabCapabilities = [
  {
    number: '01',
    title: '创建截图任务',
    description: '输入目标 URL，按平台全选或逐个勾选预设视口；支持填写任务备注。',
  },
  {
    number: '02',
    title: '批量执行截图',
    description: '使用 Playwright Chromium 依次截图；支持网络空闲后截图或额外等待 30 秒。',
  },
  {
    number: '03',
    title: '集中查看结果',
    description: '按平台和逻辑视口查看设备参数、执行状态与完整截图，快速定位布局异常。',
  },
  {
    number: '04',
    title: '管理历史批次',
    description: '保留独立批次，可回看历史结果、按原 URL 与视口配置重跑，并删除无用批次。',
  },
]

const activeGalleryImages = computed(() => {
  if (currentSlide.value === 14) return agentGalleryImages
  if (currentSlide.value >= 15 && currentSlide.value <= 18) {
    return [issueGalleryImages[currentSlide.value - 15]!]
  }
  return basicGalleryImages
})
const currentGalleryImage = computed(() =>
  activeGalleryImages.value[galleryIndex.value] ?? activeGalleryImages.value[0]!,
)
const issueOneImage = issueGalleryImages[0]!
const issueTwoImage = issueGalleryImages[1]!
const issueThreeImage = issueGalleryImages[2]!
const repairLevelImage = issueGalleryImages[3]!

const oldWorkflowSteps: WorkflowStep[] = [
  {
    stage: '输入',
    title: '模糊适配要求',
    description: '只告诉 AI：“兼容手机和平板”',
    tag: '目标不清晰',
  },
  {
    stage: '规则',
    title: 'AI 自行推断',
    description: '断点、尺寸和布局策略没有统一约束',
    tag: '缺少统一规则',
  },
  {
    stage: '执行',
    title: '通用经验生成',
    description: 'AI 根据当前代码和通用经验完成布局',
    tag: '缺少统一基线',
  },
  {
    stage: '验证',
    title: '少量视口抽查',
    description: '只在 DevTools 中查看少量尺寸',
    tag: '覆盖范围有限',
  },
  {
    stage: '反馈',
    title: '上线后被动修补',
    description: '真机或用户反馈暴露问题后，再针对单点修改',
    tag: '发现滞后、缺少复验',
  },
]

const newWorkflowSteps: WorkflowStep[] = [
  {
    stage: '输入',
    title: '建立验收视口矩阵',
    description: '根据真实用户设备数据，明确需要覆盖的逻辑视口',
    tag: '适配目标明确',
  },
  {
    stage: '规则',
    title: '沉淀项目级布局规范',
    description: '结合 App 统一 1242 设计基准，定义三类布局策略',
    tag: '规则可以复用',
  },
  {
    stage: '执行',
    title: '用明确规则驱动 AI',
    description: '将视口范围、布局策略和验收标准一起交给 AI',
    tag: '适配实现有依据',
  },
  {
    stage: '验证',
    title: '固定矩阵批量验证',
    description: '每次修改后生成一批截图，集中检查不同视口结果',
    tag: '修改结果可观察',
  },
  {
    stage: '反馈',
    title: '依据截图持续迭代',
    description: '人定位异常，AI 按规则修改，再用相同矩阵复验',
    tag: '结果可以复验',
  },
]

const workflowStages = oldWorkflowSteps.map((step) => step.stage)

function selectGalleryImage(index: number) {
  galleryIndex.value = index
}

function previousGalleryImage() {
  const imageCount = activeGalleryImages.value.length
  galleryIndex.value =
    (galleryIndex.value - 1 + imageCount) % imageCount
}

function nextGalleryImage() {
  galleryIndex.value = (galleryIndex.value + 1) % activeGalleryImages.value.length
}

function openGallery(index = galleryIndex.value) {
  selectGalleryImage(index)
  isGalleryOpen.value = true
}

function closeGallery() {
  isGalleryOpen.value = false
}

const ipadModels = [
  ['iPad12,1', 'iPad（第 9 代）', '2021', '687', '15.44%', '810×1080'],
  ['iPad15,7', 'iPad（A16）', '2025', '386', '8.67%', '820×1180'],
  ['iPad7,5', 'iPad（第 6 代）', '2018', '310', '6.97%', '768×1024'],
  ['iPad13,18', 'iPad（第 10 代）', '2022', '291', '6.54%', '820×1180'],
  ['iPad11,6', 'iPad（第 8 代）', '2020', '286', '6.43%', '810×1080'],
  ['iPad6,11', 'iPad（第 5 代）', '2017', '284', '6.38%', '768×1024'],
  ['iPad5,3', 'iPad Air 2', '2014', '235', '5.28%', '768×1024'],
  ['iPad13,16', 'iPad Air（第 5 代）', '2022', '213', '4.79%', '820×1180'],
  ['iPad7,11', 'iPad（第 7 代）', '2019', '184', '4.13%', '810×1080'],
  ['iPad15,3', 'iPad Air 11 英寸（M3）', '2025', '151', '3.39%', '820×1180'],
  ['iPad14,8', 'iPad Air 11 英寸（M2）', '2024', '106', '2.38%', '820×1180'],
  ['iPad11,3', 'iPad Air（第 3 代）', '2019', '102', '2.29%', '834×1112'],
  ['iPad13,4', 'iPad Pro 11 英寸（第 3 代）', '2021', '98', '2.20%', '834×1194'],
  ['iPad5,1', 'iPad mini 4', '2015', '85', '1.91%', '768×1024'],
  ['iPad13,1', 'iPad Air（第 4 代）', '2020', '85', '1.91%', '820×1180'],
]

const iphoneModels = [
  ['iPhone14,5', 'iPhone 13', '2021', '273', '9.27%', '390×844'],
  ['iPhone18,2', 'iPhone 17 Pro Max', '2025', '193', '6.56%', '440×956'],
  ['iPhone16,2', 'iPhone 15 Pro Max', '2023', '179', '6.08%', '430×932'],
  ['iPhone14,7', 'iPhone 14', '2022', '160', '5.43%', '390×844'],
  ['iPhone15,4', 'iPhone 15', '2023', '158', '5.37%', '393×852'],
  ['iPhone18,3', 'iPhone 17', '2025', '148', '5.03%', '402×874'],
  ['iPhone17,2', 'iPhone 16 Pro Max', '2024', '145', '4.93%', '440×956'],
  ['iPhone15,3', 'iPhone 14 Pro Max', '2022', '141', '4.79%', '430×932'],
  ['iPhone13,2', 'iPhone 12', '2020', '133', '4.52%', '390×844'],
  ['iPhone16,1', 'iPhone 15 Pro', '2023', '133', '4.52%', '393×852'],
  ['iPhone15,2', 'iPhone 14 Pro', '2022', '130', '4.42%', '393×852'],
  ['iPhone17,1', 'iPhone 16 Pro', '2024', '130', '4.42%', '402×874'],
  ['iPhone18,1', 'iPhone 17 Pro', '2025', '128', '4.35%', '402×874'],
  ['iPhone17,3', 'iPhone 16', '2024', '111', '3.77%', '393×852'],
  ['iPhone14,3', 'iPhone 13 Pro Max', '2021', '103', '3.50%', '428×926'],
]

const androidTabletModels = [
  ['S8', '步步高 AI 学习机 S8', '2024', '328', '3.50%', '2328×1600', '型号和屏幕参数匹配'],
  ['X3', '步步高 AI 学习机 X3', '2024', '268', '2.86%', '1752×1280', '高度匹配，建议设备侧再确认品牌字段'],
  ['BTK-W00', 'HUAWEI MatePad 11.5（2023）', '2023', '249', '2.66%', '2200×1440', '已确认'],
  ['S9', '步步高家教机 S9', '2026', '231', '2.47%', '2328×1600', '型号和屏幕参数匹配'],
  ['X6', '步步高 AI 学习机 X6', '2025', '218', '2.33%', '1752×1280', '高度匹配，建议设备侧再确认品牌字段'],
  ['S6', '步步高家教机 S6', '2021', '191', '2.04%', '2176×1600', '官方产品页可核对'],
  ['23073RPBFC', 'Redmi Pad SE（中国版）', '2023', '190', '2.03%', '1200×984 / 1920×1200 等', '已确认；同型号多种采集尺寸'],
  ['DBY-W09', 'HUAWEI MatePad 11', '2021', '160', '1.71%', '2560×1600', '华为官方型号资料可核对'],
  ['TGR-W10', 'HUAWEI MatePad 11.5"S 系列', '2024', '132', '1.41%', '2800×1840', '系列已确认'],
  ['A8', '步步高学习机 A8', '2025', '124', '1.32%', '2176×1600', '结合型号和屏幕参数判断'],
  ['TB331FC', '联想小新 Pad 2024', '2023', '124', '1.32%', '1200×959 / 1920×1200 等', '已确认；同型号多种采集尺寸'],
  ['BTKR-W00', 'HUAWEI MatePad 11.5 柔光版（2024）', '2024', '122', '1.30%', '2200×1440', '已确认'],
  ['AGS6-W00', 'HUAWEI MatePad SE 11（2024）', '2024', '118', '1.26%', '1920×1200', '已确认'],
  ['TALIH-PD2', '学而思旗舰学习机 12.35 英寸（xPad Pro）', '2024', '111', '1.19%', '2000×1600 / 2560×1600', '官方型号已确认；采集尺寸有差异'],
  ['A7', '步步高学习机 A7', '2023', '109', '1.16%', '1752×1280', '结合型号和屏幕参数判断'],
]

const androidPhoneModels = [
  ['ALN-AL00', 'HUAWEI Mate 60 Pro', '2023', '88', '1.49%', '2720×1260'],
  ['HBN-AL00', 'HUAWEI Pura 70 Pro', '2024', '87', '1.47%', '2844×1260'],
  ['BRA-AL00', 'HUAWEI Mate 60', '2023', '56', '0.95%', '2688×1216'],
  ['ALI-AN00', 'HONOR X50', '2023', '49', '0.83%', '2652×1200'],
  ['ADY-AL00', 'HUAWEI Pura 70', '2024', '48', '0.81%', '2760×1256'],
  ['23127PN0CC', 'Xiaomi 14', '2023', '47', '0.79%', '2670×1200'],
  ['BVL-AN00', 'HONOR Magic6', '2024', '45', '0.76%', '2800×1264'],
  ['VYG-AL00', 'HUAWEI Mate 80', '2025', '43', '0.73%', '2832×1280'],
  ['ADY-AL10', 'HUAWEI Pura 70 系列变体', '2024', '42', '0.71%', '2760×1256'],
  ['ALN-AL80', 'HUAWEI Mate 60 Pro 变体', '2023', '41', '0.69%', '2720×1260'],
  ['BLK-AL80', 'HUAWEI nova 13', '2024', '37', '0.62%', '2412×1084'],
  ['NTH-AN00', 'HONOR 50', '2021', '36', '0.61%', '2340×1080'],
  ['V2464A', 'vivo S30', '2025', '35', '0.59%', '2400×1080'],
  ['24129PN74C', 'Xiaomi 15', '2024', '34', '0.57%', '2670×1200'],
  ['24117RK2CC', 'REDMI K80', '2024', '34', '0.57%', '2400×1080 为主'],
]

const ipadViewports: DeviceViewportRow[] = [
  { viewport: '820×1180', count: '1,268', share: '28.49%', cumulativeCoverage: '28.49%' },
  { viewport: '768×1024', count: '1,240', share: '27.87%', cumulativeCoverage: '56.36%' },
  { viewport: '810×1080', count: '1,186', share: '26.65%', cumulativeCoverage: '83.01%' },
]

const iphoneViewports: DeviceViewportRow[] = [
  { viewport: '390×844', count: '674', share: '22.89%', cumulativeCoverage: '22.89%' },
  { viewport: '393×852', count: '531', share: '18.04%', cumulativeCoverage: '40.93%' },
  { viewport: '402×874', count: '399', share: '13.55%', cumulativeCoverage: '54.48%' },
  { viewport: '430×932', count: '380', share: '12.91%', cumulativeCoverage: '67.39%' },
  { viewport: '440×956', count: '331', share: '11.24%', cumulativeCoverage: '78.63%' },
]

const appleViewportPanels = [
  {
    title: 'iPad',
    summary: '3 个视口 · 累计覆盖 83.01%',
    shareLabel: '占 iPad',
    rows: ipadViewports,
    variant: 'ipad' as const,
  },
  {
    title: 'iPhone',
    summary: '5 个视口 · 累计覆盖 78.63%',
    shareLabel: '占 iPhone',
    rows: iphoneViewports,
    variant: 'iphone' as const,
  },
]

const androidTabletViewports: DeviceViewportRow[] = [
  { viewport: '800×1280', detail: '2560×1600、1920×1200 两大主流档' },
  { viewport: '640×876', detail: 'X3、X6、A7 等学习机窄屏档' },
  { viewport: '800×1088', detail: 'S6、A8、S7 等步步高学习机' },
  { viewport: '800×1164', detail: '步步高 S8 / S9' },
  { viewport: '720×1100', detail: 'HUAWEI MatePad 11.5' },
  { viewport: '920×1400', detail: 'HUAWEI MatePad 11.5"S 等大屏平板' },
]

const androidPhoneViewports: DeviceViewportRow[] = [
  { viewport: '360×800', detail: 'Android 窄屏主流档；覆盖 2400×1080@3、1600×720@2' },
  { viewport: '393×873', detail: 'Android 中等逻辑宽度；代表 1080 宽屏幕在 DPR 2.75 下的情况' },
  { viewport: '420×933', detail: 'Android 较宽手机；代表 2800×1260 等 1.5K 屏幕档' },
]

const androidViewportPanels = [
  {
    title: 'Android 平板',
    summary: '6 个视口 · 覆盖主流屏幕档位',
    detailLabel: '主要代表',
    rows: androidTabletViewports,
    variant: 'android-tablet' as const,
  },
  {
    title: 'Android 手机',
    summary: '3 个视口 · 覆盖窄 / 中 / 宽三档',
    detailLabel: '代表场景',
    rows: androidPhoneViewports,
    variant: 'android-phone' as const,
  },
]

function previousSlide() {
  if (currentSlide.value > 1) currentSlide.value -= 1
}

function nextSlide() {
  if (currentSlide.value < totalSlides) currentSlide.value += 1
}

function disposeCharts() {
  chartResizeObserver?.disconnect()
  chartResizeObserver = null
  chartInstances.splice(0).forEach((chart) => chart.dispose())
}

function createShareChart(
  element: HTMLDivElement,
  data: Array<{ name: string; value: number }>,
  colors: [string, string],
) {
  const chart = echarts.init(element)
  chart.setOption({
    animationDuration: 500,
    color: colors,
    title: {
      text: '22,684',
      subtext: '设备总数',
      left: 'center',
      top: '29%',
      textStyle: { color: '#12312f', fontSize: 23, fontWeight: 800 },
      subtextStyle: { color: '#58726e', fontSize: 12, fontWeight: 600 },
    },
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 台（{d}%）' },
    legend: {
      left: 'center',
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      textStyle: { color: '#355753', fontSize: 12, fontWeight: 600 },
    },
    series: [{
      type: 'pie',
      radius: ['54%', '76%'],
      center: ['50%', '40%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: { borderColor: '#f5f5ed', borderWidth: 3 },
      data,
    }],
  })
  return chart
}

function initCharts() {
  if (!platformChartRef.value || !deviceTypeChartRef.value || !platformTypeChartRef.value) return

  const platformChart = createShareChart(platformChartRef.value, [
    { name: 'Android  15,290 · 67.40%', value: 15290 },
    { name: 'iOS / iPadOS  7,394 · 32.60%', value: 7394 },
  ], ['#145c53', '#ee764d'])
  const deviceTypeChart = createShareChart(deviceTypeChartRef.value, [
    { name: '平板  13,816 · 60.91%', value: 13816 },
    { name: '手机  8,868 · 39.09%', value: 8868 },
  ], ['#355f5a', '#a9b9b1'])
  const platformTypeChart = echarts.init(platformTypeChartRef.value)

  platformTypeChart.setOption({
    animationDuration: 600,
    grid: { top: 8, right: 235, bottom: 12, left: 94 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'value',
      max: 45,
      axisLabel: { formatter: '{value}%', color: '#6a807c', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(18, 49, 47, 0.1)' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: ['Android 平板', 'Android 手机', 'iPad', 'iPhone'],
      axisLabel: { color: '#12312f', fontSize: 12, fontWeight: 700 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      barWidth: 15,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      label: {
        show: true,
        position: 'right',
        color: '#355753',
        fontSize: 11,
        fontWeight: 600,
        formatter: '{b}',
      },
      data: [
        {
          value: 41.29,
          name: '9,366 台 · 全部 41.29% · 平台内 61.26%',
          itemStyle: { color: '#145c53' },
        },
        {
          value: 26.12,
          name: '5,924 台 · 全部 26.12% · 平台内 38.74%',
          itemStyle: { color: '#79a69e' },
        },
        {
          value: 19.62,
          name: '4,450 台 · 全部 19.62% · 平台内 60.18%',
          itemStyle: { color: '#ee764d' },
        },
        {
          value: 12.98,
          name: '2,944 台 · 全部 12.98% · 平台内 39.82%',
          itemStyle: { color: '#f2ad89' },
        },
      ],
    }],
  })

  chartInstances.push(platformChart, deviceTypeChart, platformTypeChart)
  chartResizeObserver = new ResizeObserver(() => {
    chartInstances.forEach((chart) => chart.resize())
  })
  ;[platformChartRef.value, deviceTypeChartRef.value, platformTypeChartRef.value].forEach(
    (element) => chartResizeObserver?.observe(element),
  )
}

watch(currentSlide, async (slide) => {
  disposeCharts()
  if (slide >= 13 && slide <= 18) {
    galleryIndex.value = 0
  }
  if (slide === 5) {
    await nextTick()
    initCharts()
  }
})

onBeforeUnmount(disposeCharts)
</script>

<template>
  <main
    class="ppt-showcase-page"
    :class="{ 'is-effects-gallery-slide': currentSlide === 13 || currentSlide === 14 }"
    aria-label="前端多端适配实践 PPT"
  >
    <section
      v-if="currentSlide === 1"
      class="ppt-slide"
      aria-labelledby="ppt-cover-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-coverIntro">
        <h1 id="ppt-cover-title" class="ppt-coverTitle">前端多端适配实践</h1>
        <p class="ppt-coverSubtitle">从真实设备数据到可验证的 AI 适配闭环</p>
      </div>

      <ol class="ppt-coverAgenda" aria-label="内容目录">
        <li v-for="(item, index) in coverAgenda" :key="item">
          <span class="ppt-coverNumber">{{ String(index + 1).padStart(2, '0') }}</span>
          <span>{{ item }}</span>
        </li>
      </ol>
    </section>

    <section
      v-else-if="currentSlide === 2"
      class="ppt-slide ppt-slide--reason"
      aria-labelledby="ppt-reason-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-reasonHeader">
        <span class="ppt-sectionEyebrow">01 · 为什么要做多端适配</span>
        <h2 id="ppt-reason-title">为什么要做多端适配？</h2>
      </header>

      <div class="ppt-reasonColumns">
        <article class="ppt-reasonColumn">
          <p class="ppt-reasonLabel">用户视角</p>
          <ul>
            <li>用户分布在手机、平板等不同设备上，任何一种设备适配不佳，都会损害对应用户的使用体验</li>
            <li>按钮过小、内容遮挡和布局错位，会直接影响任务完成与核心功能使用</li>
            <li>持续的体验障碍会进一步影响用户留存与付费转化，因此适配也是产品质量和业务指标问题</li>
          </ul>
        </article>

        <article class="ppt-reasonColumn">
          <p class="ppt-reasonLabel">AI 时代的开发者视角</p>
          <ul>
            <li>AI 提高了页面生成速度，但不保证多端正确</li>
            <li>与 AI 协作时，很容易陷入“发现适配问题 → 让 AI 修改 → 反复查看 DevTools → 再次修改”的循环</li>
            <li>页面写得越快，人工逐个检查越容易成为瓶颈</li>
            <li>开发者正从“完成页面”转向“验证页面”</li>
          </ul>
        </article>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 3"
      class="ppt-slide ppt-slide--concept"
      aria-labelledby="ppt-concept-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader">
        <span class="ppt-sectionEyebrow">02 · 理解移动端逻辑视口</span>
        <h2 id="ppt-concept-title">理解移动端视口</h2>
      </header>

      <div class="ppt-conceptFlow">
        <article class="ppt-conceptBlock">
          <h3>物理分辨率</h3>
          <p>屏幕真实拥有的物理像素数量，不能直接代表网页空间，需要结合 DPR 计算逻辑分辨率</p>
          <strong>例如：1179 × 2556 px</strong>
        </article>

        <article class="ppt-conceptBlock ppt-conceptBlock--logical">
          <h3>逻辑分辨率</h3>
          <p>抛开浏览器工具栏、App 原生容器、安全区、分屏等影响后，可以近似理解为这台设备能够提供的最大网页视口</p>
          <strong>例如：393 × 852</strong>
        </article>

        <article class="ppt-conceptBlock ppt-conceptBlock--dpr">
          <h3>DPR</h3>
          <p>Device Pixel Ratio，表示一个 CSS 像素由多少个物理像素来显示</p>
          <strong>例如：DPR = 3</strong>
        </article>

        <article class="ppt-conceptBlock ppt-conceptBlock--viewport">
          <h3>网页视口</h3>
          <p>页面真正可用的 CSS 空间</p>
          <strong>宽度 × 高度</strong>
        </article>
      </div>

      <div class="ppt-formula">
        <p>
          <span>逻辑分辨率</span>
          <b>=</b>
          <span>物理分辨率</span>
          <b>÷</b>
          <span>DPR</span>
        </p>
        <small>1179 × 2556 ÷ 3 = 393 × 852</small>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 4"
      class="ppt-slide ppt-slide--resolution"
      aria-labelledby="ppt-resolution-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader">
        <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
        <h2 id="ppt-resolution-title">寻找常用逻辑分辨率</h2>
        <p>设备组合无法穷举，需要把适配范围收敛到一组可验证的高频视口</p>
      </header>

      <div class="ppt-resolutionContent">
        <article class="ppt-dprOverview">
          <h3>不同设备的 DPR 并不固定</h3>
          <p class="ppt-resolutionLead">
            物理分辨率需要结合 DPR 换算，才能得到页面实际使用的逻辑视口。
          </p>
          <NTable
            class="ppt-dprTable"
            size="small"
            :bordered="false"
            :single-line="false"
            :bottom-bordered="true"
          >
            <thead>
              <tr>
                <th>设备类型</th>
                <th>常见 DPR</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>普通电脑显示器</td><td>1</td></tr>
              <tr><td>高分屏电脑</td><td>1.25、1.5、2</td></tr>
              <tr><td>iPad</td><td>通常为 2</td></tr>
              <tr><td>iPhone</td><td>通常为 2 或 3</td></tr>
              <tr><td>Android 手机</td><td>常见 2～4</td></tr>
            </tbody>
          </NTable>
        </article>

        <article class="ppt-deviceQuestion">
          <h3>为什么不能覆盖所有设备？</h3>
          <p class="ppt-deviceQuestionLead">
            设备类型、屏幕比例和 DPR 的组合众多，不可能逐台穷举。
          </p>
          <div class="ppt-platformCompare">
            <section>
              <span>iOS</span>
              <strong>产品线相对集中</strong>
              <p>设备和 DPR 组合较稳定，常用逻辑视口相对容易归纳。</p>
            </section>
            <section>
              <span>Android</span>
              <strong>型号与屏幕高度碎片化</strong>
              <p>品牌、比例和 DPR 组合复杂，无法依赖少量标准设备完整覆盖。</p>
            </section>
          </div>
          <p class="ppt-deviceQuestionKey">
            不追求大而全，而是优先覆盖真实用户的高频逻辑视口
          </p>
        </article>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 5"
      class="ppt-slide ppt-slide--data"
      aria-labelledby="ppt-data-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader">
        <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
        <h2 id="ppt-data-title">从用户数据中看设备分布</h2>
        <p>22,684 台真实设备：Android 占近 2/3，平板占 60.91%</p>
      </header>

      <div class="ppt-dataGrid">
        <article class="ppt-chartPanel">
          <h3>平台分布</h3>
          <div ref="platformChartRef" class="ppt-shareChart" aria-label="Android 与 iOS 设备占比图"></div>
        </article>

        <article class="ppt-chartPanel">
          <h3>设备类型分布</h3>
          <div ref="deviceTypeChartRef" class="ppt-shareChart" aria-label="平板与手机设备占比图"></div>
        </article>

        <article class="ppt-chartPanel ppt-chartPanel--wide">
          <div class="ppt-chartPanelTitle">
            <h3>平台 × 类型</h3>
            <div class="ppt-chartLegend" aria-label="图表颜色说明">
              <span><i class="ppt-chartLegendDot ppt-chartLegendDot--android"></i>Android</span>
              <span><i class="ppt-chartLegendDot ppt-chartLegendDot--apple"></i>iOS / iPadOS</span>
              <small>深色：平板　浅色：手机</small>
            </div>
          </div>
          <div ref="platformTypeChartRef" class="ppt-platformTypeChart" aria-label="各平台设备类型分布图"></div>
        </article>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 6"
      class="ppt-slide ppt-slide--deviceTable"
      aria-labelledby="ppt-ipad-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader ppt-deviceTableHeader">
        <div>
          <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
          <h2 id="ppt-ipad-title">高频 iPad</h2>
          <p>按设备数排序，观察高频型号最终对应哪些逻辑分辨率</p>
        </div>
        <strong>iPad 样本 4,450 台</strong>
      </header>

      <NTable class="ppt-deviceTable ppt-deviceTable--ipad" :bordered="false" :single-line="false">
        <colgroup>
          <col class="ppt-ipadTableName" />
          <col class="ppt-ipadTableYear" />
          <col class="ppt-ipadTableNumber" />
          <col class="ppt-ipadTableShare" />
          <col class="ppt-ipadTableViewport" />
        </colgroup>
        <thead>
          <tr>
            <th>商品型号</th><th>上市年份</th><th>设备数</th><th>占 iPad</th><th>主要逻辑分辨率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(model, index) in ipadModels" :key="model[0]" :class="{ 'is-top-ten': index < 10 }">
            <td>{{ model[1] }}</td><td>{{ model[2] }}</td><td>{{ model[3] }}</td><td>{{ model[4] }}</td>
            <td><span class="ppt-viewportTag">{{ model[5] }}</span></td>
          </tr>
        </tbody>
      </NTable>

      <p class="ppt-deviceTableConclusion">
        前 10 个 iPad 型号合计 <strong>3,027 台</strong>，覆盖约 <strong>68.02%</strong> 的 iPad 样本。
      </p>
    </section>

    <section
      v-else-if="currentSlide === 7"
      class="ppt-slide ppt-slide--deviceTable"
      aria-labelledby="ppt-iphone-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader ppt-deviceTableHeader">
        <div>
          <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
          <h2 id="ppt-iphone-title">高频 iPhone</h2>
          <p>型号很多，但高频设备集中在少量逻辑分辨率组合</p>
        </div>
        <strong>iPhone 样本 2,944 台</strong>
      </header>

      <NTable class="ppt-deviceTable ppt-deviceTable--year" :bordered="false" :single-line="false">
        <colgroup>
          <col class="ppt-yearTableName" />
          <col class="ppt-yearTableYear" />
          <col class="ppt-yearTableNumber" />
          <col class="ppt-yearTableShare" />
          <col class="ppt-yearTableViewport" />
        </colgroup>
        <thead>
          <tr>
            <th>商品型号</th><th>上市年份</th><th>设备数</th><th>占 iPhone</th><th>主要逻辑分辨率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="model in iphoneModels" :key="model[0]">
            <td>{{ model[1] }}</td><td>{{ model[2] }}</td><td>{{ model[3] }}</td><td>{{ model[4] }}</td>
            <td><span class="ppt-viewportTag">{{ model[5] }}</span></td>
          </tr>
        </tbody>
      </NTable>
    </section>

    <section
      v-else-if="currentSlide === 8"
      class="ppt-slide ppt-slide--deviceTable"
      aria-labelledby="ppt-android-tablet-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader ppt-deviceTableHeader">
        <div>
          <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
          <h2 id="ppt-android-tablet-title">高频 Android 平板</h2>
          <p>型号更加分散，部分设备还存在同型号采集到多种分辨率的情况</p>
        </div>
        <strong>Android 平板样本 9,366 台</strong>
      </header>

      <NTable
        class="ppt-deviceTable ppt-deviceTable--androidTablet"
        :bordered="false"
        :single-line="false"
      >
        <colgroup>
          <col class="ppt-androidTableName" />
          <col class="ppt-androidTableYear" />
          <col class="ppt-androidTableNumber" />
          <col class="ppt-androidTableShare" />
          <col class="ppt-androidTableResolution" />
          <col class="ppt-androidTableNote" />
        </colgroup>
        <thead>
          <tr>
            <th>商品型号</th><th>上市年份</th><th>设备数</th><th>占 Android 平板</th>
            <th>主要采集分辨率</th><th>可信度 / 备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="model in androidTabletModels" :key="model[0]">
            <td>{{ model[1] }}</td><td>{{ model[2] }}</td><td>{{ model[3] }}</td><td>{{ model[4] }}</td>
            <td><span class="ppt-viewportTag">{{ model[5] }}</span></td><td>{{ model[6] }}</td>
          </tr>
        </tbody>
      </NTable>
    </section>

    <section
      v-else-if="currentSlide === 9"
      class="ppt-slide ppt-slide--deviceTable"
      aria-labelledby="ppt-android-phone-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader ppt-deviceTableHeader">
        <div>
          <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
          <h2 id="ppt-android-phone-title">高频 Android 手机</h2>
          <p>头部型号占比低，进一步说明 Android 设备覆盖不能依赖少量标准机型</p>
        </div>
        <strong>Android 手机样本 5,924 台</strong>
      </header>

      <NTable class="ppt-deviceTable ppt-deviceTable--year" :bordered="false" :single-line="false">
        <colgroup>
          <col class="ppt-yearTableName" />
          <col class="ppt-yearTableYear" />
          <col class="ppt-yearTableNumber" />
          <col class="ppt-yearTableShare" />
          <col class="ppt-yearTableViewport" />
        </colgroup>
        <thead>
          <tr>
            <th>商品型号</th><th>上市年份</th><th>设备数</th><th>占 Android 手机</th><th>主要物理分辨率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="model in androidPhoneModels" :key="model[0]">
            <td>{{ model[1] }}</td><td>{{ model[2] }}</td><td>{{ model[3] }}</td><td>{{ model[4] }}</td>
            <td><span class="ppt-viewportTag ppt-viewportTag--android">{{ model[5] }}</span></td>
          </tr>
        </tbody>
      </NTable>
    </section>

    <section
      v-else-if="currentSlide === 10"
      class="ppt-slide ppt-slide--selection ppt-slide--selectionMatrix"
      aria-labelledby="ppt-apple-selection-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader ppt-selectionHeader">
        <div>
          <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
          <h2 id="ppt-apple-selection-title">Apple 代表视口矩阵</h2>
          <p>从高频设备中收敛出 8 个用于验收的逻辑视口</p>
        </div>
        <div class="ppt-selectionTotal">
          <strong>共 8 个视口</strong>
          <span>iPad 3 个 · iPhone 5 个</span>
        </div>
      </header>

      <div class="ppt-devicePanelGrid">
        <DeviceViewportPanel
          v-for="panel in appleViewportPanels"
          :key="panel.variant"
          :title="panel.title"
          :summary="panel.summary"
          :share-label="panel.shareLabel"
          :rows="panel.rows"
          :variant="panel.variant"
        />
      </div>

      <p class="ppt-matrixConclusion">
        最终选取 <strong>8 个 Apple 逻辑视口</strong>，覆盖
        <b>iPad 83.01%</b>、<b>iPhone 78.63%</b> 的高频设备样本。
      </p>
    </section>

    <section
      v-else-if="currentSlide === 11"
      class="ppt-slide ppt-slide--selection ppt-slide--selectionMatrix"
      aria-labelledby="ppt-android-selection-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader ppt-selectionHeader">
        <div>
          <span class="ppt-sectionEyebrow">03 · 用真实设备数据建立视口矩阵</span>
          <h2 id="ppt-android-selection-title">Android 代表视口矩阵</h2>
          <p>从主流屏幕档位中收敛出 9 个用于验收的逻辑视口</p>
        </div>
        <div class="ppt-selectionTotal">
          <strong>共 9 个视口</strong>
          <span>平板 6 个 · 手机 3 个</span>
        </div>
      </header>

      <div class="ppt-devicePanelGrid">
        <DeviceViewportPanel
          v-for="panel in androidViewportPanels"
          :key="panel.variant"
          :title="panel.title"
          :summary="panel.summary"
          :detail-label="panel.detailLabel"
          :rows="panel.rows"
          :variant="panel.variant"
          table-mode="details"
        />
      </div>

      <p class="ppt-matrixConclusion">
        最终选取 <strong>9 个 Android 逻辑视口</strong>，与
        <b>Apple 8 个视口</b> 共同组成 17 个代表视口。
      </p>
    </section>

    <section
      v-else-if="currentSlide === 12"
      class="ppt-slide ppt-slide--viewportLab"
      aria-labelledby="ppt-viewport-lab-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-viewportLabCopy">
        <header class="ppt-viewportLabHeader">
          <span>04 · 多视口检查工具</span>
          <h2 id="ppt-viewport-lab-title">Viewport Lab</h2>
          <p>将 17 个代表视口沉淀为可重复执行、可追踪的页面检查任务</p>
        </header>

        <section class="ppt-viewportLabIntro" aria-labelledby="ppt-viewport-lab-intro-title">
          <h3 id="ppt-viewport-lab-intro-title">工具介绍</h3>
          <p>
            输入目标页面 URL，选择需要验证的设备视口，即可批量生成截图并集中查看结果。
            每次执行都会形成独立批次，便于回看、重跑和清理历史记录。
          </p>
        </section>

        <section class="ppt-viewportLabFeature" aria-labelledby="ppt-viewport-lab-feature-title">
          <div class="ppt-viewportLabSectionTitle">
            <h3 id="ppt-viewport-lab-feature-title">基本功能</h3>
            <div>
              <strong>17 个代表视口</strong>
              <span>iPhone 5 · iPad 3 · Android 手机 3 · Android 平板 6</span>
            </div>
          </div>

          <ol class="ppt-viewportLabCapabilities">
            <li v-for="capability in viewportLabCapabilities" :key="capability.number">
              <span>{{ capability.number }}</span>
              <strong>{{ capability.title }}</strong>
              <p>{{ capability.description }}</p>
            </li>
          </ol>
        </section>

      </div>

      <figure class="ppt-viewportLabVisual">
        <div class="ppt-viewportLabVisualHead">
          <div>
            <span>批量任务配置</span>
            <small>一个入口完成设备与视口组合选择</small>
          </div>
          <b>4 类设备 · 17 个视口</b>
        </div>
        <img
          :src="viewportLabOverviewUrl"
          alt="Viewport Lab 创建截图任务界面，展示四类设备和苹果手机视口预设"
        />
        <figcaption>
          <span>按类别多选</span>
          <span>预设自由勾选</span>
          <span>批量执行截图</span>
        </figcaption>
      </figure>
    </section>

    <section
      v-else-if="currentSlide === 13"
      class="ppt-slide ppt-slide--effects ppt-slide--largeEffectsCopy ppt-slide--basicGallery"
      aria-labelledby="ppt-basic-effects-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-effectsCopy">
        <header class="ppt-effectsHeader">
          <span>05 · 基本功能：批量截图验证</span>
          <h2 id="ppt-basic-effects-title">基本功能<br />效果截图</h2>
          <p>
            批量截图完成后，将同一页面在 17 个逻辑视口下的结果集中展示，
            便于直接比较不同设备档位的真实页面效果。
          </p>
        </header>

        <ul class="ppt-effectsPoints">
          <li>
            <strong>多视口覆盖</strong>
            <span>一次任务产出 Apple 与 Android 共 17 种截图</span>
          </li>
          <li>
            <strong>集中查看</strong>
            <span>按设备类别汇总结果，快速横向比较布局差异</span>
          </li>
          <li>
            <strong>完整长图</strong>
            <span>点击结果图后向下滚动，检查页面全部内容</span>
          </li>
        </ul>

        <p class="ppt-effectsHint">
          基本流程：创建任务 → 批量截图 → 对比与查看结果
        </p>
      </div>

      <div class="ppt-effectsGallery">
        <div class="ppt-effectsGalleryHead">
          <div>
            <span>任务效果预览</span>
            <strong>{{ currentGalleryImage.title }}</strong>
          </div>
          <small>
            {{ String(galleryIndex + 1).padStart(2, '0') }}
            /
            {{ String(basicGalleryImages.length).padStart(2, '0') }}
          </small>
        </div>

        <button
          type="button"
          class="ppt-effectsStage"
          :aria-label="`查看${currentGalleryImage.title}完整长截图`"
          @click.stop="openGallery()"
        >
          <img
            :src="currentGalleryImage.src"
            :alt="currentGalleryImage.alt"
          />
          <span class="ppt-effectsZoom">点击查看完整长图 ↗</span>
        </button>

        <div class="ppt-effectsControls" @click.stop>
          <button
            type="button"
            class="ppt-effectsTurn"
            aria-label="上一张效果图"
            @click.stop="previousGalleryImage"
          >
            ←
          </button>

          <div class="ppt-effectsThumbs" aria-label="效果图分页">
            <button
              v-for="(image, index) in basicGalleryImages"
              :key="image.src"
              type="button"
              class="ppt-effectsThumb"
              :class="{ 'is-active': galleryIndex === index }"
              :aria-label="`切换到${image.title}`"
              :aria-current="galleryIndex === index ? 'true' : undefined"
              @click.stop="selectGalleryImage(index)"
            >
              <img :src="image.src" :alt="image.alt" />
              <span>
                <b>{{ image.title }}</b>
                <small>{{ image.description }}</small>
              </span>
            </button>
          </div>

          <button
            type="button"
            class="ppt-effectsTurn"
            aria-label="下一张效果图"
            @click.stop="nextGalleryImage"
          >
            →
          </button>
        </div>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 14"
      class="ppt-slide ppt-slide--effects ppt-slide--agentEffects ppt-slide--largeEffectsCopy"
      aria-labelledby="ppt-agent-effects-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-effectsCopy">
        <header class="ppt-effectsHeader">
          <span>06 · 拓展功能：Agent 自动操作</span>
          <h2 id="ppt-agent-effects-title">拓展功能<br />效果截图</h2>
          <p>
            不只检查页面首次打开的静态画面，还可以让 Agent 进入页面，
            执行点击、对话等操作，再截取交互后的关键页面状态。
          </p>
        </header>

        <ul class="ppt-effectsPoints ppt-agentEffectsPoints">
          <li>
            <strong>自然语言驱动</strong>
            <span>不需要先编写完整测试代码，用一句话描述需要完成的页面操作。</span>
          </li>
          <li>
            <strong>全过程截图留痕</strong>
            <span>记录每一步操作、观察结果、问题点和页面截图，方便定位和复盘。</span>
          </li>
          <li>
            <strong>自动沉淀回归测试</strong>
            <span>将探索路径生成可复跑脚本，后续可以使用相同任务再次验证。</span>
          </li>
        </ul>

        <p class="ppt-effectsHint">
          拓展流程：自然语言任务 → Agent 探索执行 → 截图留痕 → 沉淀回归脚本
        </p>
      </div>

      <div class="ppt-effectsGallery">
        <div class="ppt-effectsGalleryHead">
          <div>
            <span>拓展效果预览</span>
            <strong>{{ currentGalleryImage.title }}</strong>
          </div>
          <small>
            {{ String(galleryIndex + 1).padStart(2, '0') }}
            /
            {{ String(agentGalleryImages.length).padStart(2, '0') }}
          </small>
        </div>

        <button
          type="button"
          class="ppt-effectsStage"
          :aria-label="`查看${currentGalleryImage.title}完整长截图`"
          @click.stop="openGallery()"
        >
          <img
            :src="currentGalleryImage.src"
            :alt="currentGalleryImage.alt"
          />
          <span class="ppt-effectsZoom">点击查看完整长图 ↗</span>
        </button>

        <div class="ppt-effectsControls" @click.stop>
          <button
            type="button"
            class="ppt-effectsTurn"
            aria-label="上一张拓展效果图"
            @click.stop="previousGalleryImage"
          >
            ←
          </button>

          <div class="ppt-effectsThumbs" aria-label="拓展效果图分页">
            <button
              v-for="(image, index) in agentGalleryImages"
              :key="`agent-${image.src}`"
              type="button"
              class="ppt-effectsThumb"
              :class="{ 'is-active': galleryIndex === index }"
              :aria-label="`切换到${image.title}`"
              :aria-current="galleryIndex === index ? 'true' : undefined"
              @click.stop="selectGalleryImage(index)"
            >
              <img :src="image.src" :alt="image.alt" />
              <span>
                <b>{{ image.title }}</b>
                <small>交互操作后截图 · 暂用占位图</small>
              </span>
            </button>
          </div>

          <button
            type="button"
            class="ppt-effectsTurn"
            aria-label="下一张拓展效果图"
            @click.stop="nextGalleryImage"
          >
            →
          </button>
        </div>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 15"
      class="ppt-slide ppt-slide--effects ppt-slide--issue"
      aria-labelledby="ppt-issue-one-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-effectsCopy ppt-issueCopy">
        <header class="ppt-effectsHeader">
          <span>07 · 工具发现的真实适配问题</span>
          <h2 id="ppt-issue-one-title">工具发现了什么问题？</h2>
        </header>

        <article class="ppt-issueSummary">
          <span class="ppt-issueNumber">问题 01</span>
          <h3>关卡页：平板关卡按钮过小</h3>
        </article>

        <dl class="ppt-issueEvidence">
          <div>
            <dt>现象</dt>
            <dd>关卡按钮占屏比例偏低，页面留白明显增多</dd>
          </div>
          <div>
            <dt>影响</dt>
            <dd>视觉焦点不突出，点击目标与平板操作习惯不匹配</dd>
          </div>
        </dl>
      </div>

      <div class="ppt-effectsGallery ppt-issueGallery">
        <div class="ppt-effectsGalleryHead">
          <div>
            <span>问题截图预览</span>
            <strong>平板关卡页</strong>
          </div>
          <small>ISSUE 01</small>
        </div>

        <button
          type="button"
          class="ppt-effectsStage"
          aria-label="查看平板关卡页完整问题截图"
          @click="openGallery(0)"
        >
          <img
            :src="issueOneImage.src"
            :alt="issueOneImage.alt"
          />
          <span class="ppt-effectsZoom">点击查看完整长图 ↗</span>
        </button>

        <div class="ppt-issuePreviewFooter">
          <span>问题 01</span>
          <strong>平板关卡按钮尺寸问题截图</strong>
          <button type="button" @click="openGallery(0)">查看长图</button>
        </div>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 16"
      class="ppt-slide ppt-slide--effects ppt-slide--issue"
      aria-labelledby="ppt-issue-two-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-effectsCopy ppt-issueCopy">
        <header class="ppt-effectsHeader">
          <span>07 · 工具发现的真实适配问题</span>
          <h2 id="ppt-issue-two-title">工具发现了什么问题？</h2>
        </header>

        <article class="ppt-issueSummary">
          <span class="ppt-issueNumber">问题 02</span>
          <h3>汤圆信箱：信纸布局不稳定</h3>
        </article>

        <dl class="ppt-issueEvidence">
          <div>
            <dt>现象</dt>
            <dd>布局没有考虑 App 头部安全区和顶部间距，不同平板下信纸位置不稳定</dd>
          </div>
          <div>
            <dt>影响</dt>
            <dd>部分平板中信纸头部会被 App 头部遮挡，影响内容阅读与操作</dd>
          </div>
        </dl>
      </div>

      <div class="ppt-effectsGallery ppt-issueGallery">
        <div class="ppt-effectsGalleryHead">
          <div>
            <span>问题截图预览</span>
            <strong>汤圆信箱信纸布局</strong>
          </div>
          <small>ISSUE 02</small>
        </div>

        <button
          type="button"
          class="ppt-effectsStage"
          aria-label="查看汤圆信箱信纸布局完整问题截图"
          @click="openGallery(0)"
        >
          <img
            :src="issueTwoImage.src"
            :alt="issueTwoImage.alt"
          />
          <span class="ppt-effectsZoom">点击查看完整长图 ↗</span>
        </button>

        <div class="ppt-issuePreviewFooter">
          <span>问题 02</span>
          <strong>汤圆信箱信纸布局问题截图</strong>
          <button type="button" @click="openGallery(0)">查看长图</button>
        </div>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 17"
      class="ppt-slide ppt-slide--effects ppt-slide--issue"
      aria-labelledby="ppt-issue-three-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-effectsCopy ppt-issueCopy">
        <header class="ppt-effectsHeader">
          <span>07 · 工具发现的真实适配问题</span>
          <h2 id="ppt-issue-three-title">工具发现了什么问题？</h2>
        </header>

        <article class="ppt-issueSummary">
          <span class="ppt-issueNumber">问题 03</span>
          <h3>百宝箱：平板小游戏卡片首屏不可见</h3>
        </article>

        <dl class="ppt-issueEvidence">
          <div>
            <dt>现象</dt>
            <dd>苹果平板和安卓平板的小游戏卡片大多位于首屏可视区域下方，首屏展示性较差</dd>
          </div>
          <div>
            <dt>影响</dt>
            <dd>核心入口曝光不足，用户难以及时发现小游戏，降低页面吸引力和功能进入率</dd>
          </div>
        </dl>
      </div>

      <div class="ppt-effectsGallery ppt-issueGallery">
        <div class="ppt-effectsGalleryHead">
          <div>
            <span>问题截图预览</span>
            <strong>平板百宝箱首屏</strong>
          </div>
          <small>ISSUE 03</small>
        </div>

        <button
          type="button"
          class="ppt-effectsStage"
          aria-label="查看平板百宝箱首屏完整问题截图"
          @click="openGallery(0)"
        >
          <img
            :src="issueThreeImage.src"
            :alt="issueThreeImage.alt"
          />
          <span class="ppt-effectsZoom">点击查看完整长图 ↗</span>
        </button>

        <div class="ppt-issuePreviewFooter">
          <span>问题 03</span>
          <strong>平板百宝箱首屏问题截图</strong>
          <button type="button" @click="openGallery(0)">查看长图</button>
        </div>
      </div>
    </section>

    <section
      v-else-if="currentSlide === 18"
      class="ppt-slide ppt-slide--effects ppt-slide--repair"
      aria-labelledby="ppt-repair-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <div class="ppt-effectsCopy ppt-repairCopy">
        <header class="ppt-effectsHeader">
          <span>08 · 从单点修复到可验证闭环</span>
          <h2 id="ppt-repair-title">以关卡页为例，如何快速解决<br />平板适配问题？</h2>
          <p>定位问题原因、明确适配规则，再使用相同视口矩阵完成复验。</p>
        </header>

        <ol class="ppt-repairSteps">
          <li>
            <span>01</span>
            <div>
              <strong>生成验收参数文档</strong>
              <p>根据多端适配配置参数，整理设备分类、逻辑视口和验收范围，形成可直接交给 AI 的验收参数文档。</p>
            </div>
          </li>
          <li class="ppt-repairRuleStep">
            <span>02</span>
            <div>
              <strong>确定三类布局规范</strong>
              <p>结合小墨作文统一宽度 1242 的设计基准，将验收视口归纳为三类：</p>
              <ul class="ppt-repairRules">
                <li>
                  <b>紧凑型平板</b>
                  <span>768×1024、810×1080、640×876、800×1088 · 约 1656–1700 · 压缩间距和非核心区域，主体优先</span>
                </li>
                <li>
                  <b>标准平板</b>
                  <span>820×1180、800×1164、720×1100、920×1400、800×1280 · 约 1790–1990 · 使用标准设计布局</span>
                </li>
                <li>
                  <b>高屏手机</b>
                  <span>全部手机预设 · 约 2690–2760 · 沿用手机端纵向布局</span>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>让固定布局动态化</strong>
              <p>让 AI 根据三类布局差异，将固定尺寸、固定间距和固定排列调整为基于容器宽度的动态规则。</p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <strong>AI 修改并循环复验</strong>
              <p>让 AI 修改关卡按钮内部布局；每完成一次修改就重跑当前批次。若结果不正确，让 AI 查看对应批次截图后继续调整。</p>
            </div>
          </li>
        </ol>

        <p class="ppt-repairConclusion">
          验收参数文档 + 布局规范 + 批次截图，形成可持续复验的修复闭环
        </p>
      </div>

      <div class="ppt-effectsGallery ppt-repairGallery">
        <div class="ppt-effectsGalleryHead">
          <div>
            <span>修复效果预览</span>
            <strong>关卡页平板适配</strong>
          </div>
          <small>CASE 01</small>
        </div>

        <button
          type="button"
          class="ppt-effectsStage"
          aria-label="查看关卡页适配修复长图"
          @click="openGallery(0)"
        >
          <img
            :src="repairLevelImage.src"
            :alt="repairLevelImage.alt"
          />
          <span class="ppt-effectsZoom">点击查看完整长图 ↗</span>
        </button>

        <div class="ppt-issuePreviewFooter">
          <span>修复结果</span>
          <strong>关卡页平板适配解决截图</strong>
          <button type="button" @click="openGallery(0)">查看长图</button>
        </div>
      </div>
    </section>

    <section
      v-else
      class="ppt-slide ppt-slide--workflow"
      aria-labelledby="ppt-workflow-title"
    >
      <div class="ppt-slideDecor" aria-hidden="true"></div>

      <header class="ppt-topicHeader ppt-workflowHeader">
        <span>08 · 从单点修复到可验证闭环</span>
        <h2 id="ppt-workflow-title">AI 多端适配：从模糊要求到可验证闭环</h2>
      </header>

      <div class="ppt-workflowScroll">
        <div class="ppt-workflowCanvas">
          <div class="ppt-workflowStages" aria-label="工作流阶段">
            <div
              v-for="stage in workflowStages"
              :key="stage"
              class="ppt-workflowStage"
            >
              <span>{{ stage }}</span>
              <i aria-hidden="true"></i>
            </div>
          </div>

          <WorkflowLane
            title="旧工作流"
            variant="old"
            :steps="oldWorkflowSteps"
          />

          <div class="ppt-workflowTransition">
            <span aria-hidden="true">↓</span>
            <strong>从临场推断到规则驱动</strong>
          </div>

          <WorkflowLane
            title="新工作流"
            variant="new"
            :steps="newWorkflowSteps"
          />
        </div>
      </div>

      <p class="ppt-workflowTakeaway">
        验收视口矩阵 + 项目级布局规范 + Viewport Lab，让 AI 多端适配变得可描述、可检查、可复验。
      </p>
    </section>

    <Teleport to="body">
      <div
        v-if="isGalleryOpen"
        class="ppt-imageViewer"
        role="dialog"
        aria-modal="true"
        :aria-label="`${currentGalleryImage.title}完整长截图`"
        @click.self="closeGallery"
      >
        <div class="ppt-imageViewerPanel">
          <header>
            <div>
              <span>完整长截图</span>
              <strong>{{ currentGalleryImage.title }}</strong>
              <small>{{ currentGalleryImage.description }}</small>
            </div>
            <button type="button" aria-label="关闭完整截图" @click="closeGallery">
              ×
            </button>
          </header>

          <div class="ppt-imageViewerScroll">
            <img
              :src="currentGalleryImage.src"
              :alt="currentGalleryImage.alt"
            />
          </div>

          <footer>
            <button type="button" @click="previousGalleryImage">← 上一张</button>
            <span>上下滚动查看完整页面</span>
            <button type="button" @click="nextGalleryImage">下一张 →</button>
          </footer>
        </div>
      </div>
    </Teleport>

    <div class="ppt-pageNumberLayer" aria-hidden="true">
      <span>
        {{ String(currentSlide).padStart(2, '0') }}
        <i>/</i>
        {{ String(totalSlides).padStart(2, '0') }}
      </span>
    </div>

    <button
      v-if="currentSlide > 1"
      type="button"
      class="ppt-navZone ppt-navZone--previous"
      aria-label="上一页"
      @click="previousSlide"
    >
      <span class="ppt-navArrow" aria-hidden="true">←</span>
    </button>

    <button
      v-if="currentSlide < totalSlides"
      type="button"
      class="ppt-navZone ppt-navZone--next"
      aria-label="下一页"
      @click="nextSlide"
    >
      <span class="ppt-navArrow" aria-hidden="true">→</span>
    </button>
  </main>
</template>

<style scoped>
.ppt-showcase-page {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #07191a;
}

.ppt-pageNumberLayer {
  position: fixed;
  z-index: 5;
  top: 50%;
  left: 50%;
  container-type: inline-size;
  width: min(100vw, calc(100svh * 16 / 9));
  aspect-ratio: 16 / 9;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ppt-pageNumberLayer > span {
  position: absolute;
  right: 2.15cqw;
  bottom: 1.45cqw;
  display: inline-flex;
  align-items: center;
  gap: 0.34cqw;
  color: rgba(18, 49, 47, 0.48);
  font-size: clamp(10px, 0.66cqw, 13px);
  font-weight: 780;
  line-height: 1;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
}

.ppt-pageNumberLayer i {
  color: rgba(238, 118, 77, 0.72);
  font-style: normal;
  font-weight: 850;
}

.ppt-slide {
  position: relative;
  container-type: inline-size;
  width: min(100vw, calc(100svh * 16 / 9));
  max-height: 100svh;
  aspect-ratio: 16 / 9;
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
  gap: 2.2cqw;
  padding: 4.5cqw 7.2cqw;
  overflow: hidden;
  color: #12312f;
  background:
    radial-gradient(circle at 0 100%, rgba(238, 118, 77, 0.14), transparent 29%),
    linear-gradient(135deg, #f8f5eb 0%, #f1f5ec 100%);
}

.ppt-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1.05cqw;
  height: 100%;
  background: #ee764d;
}

.ppt-slideDecor {
  position: absolute;
  top: -9cqw;
  right: -8cqw;
  width: 24cqw;
  height: 24cqw;
  border: 0.12cqw solid rgba(20, 92, 83, 0.16);
  border-radius: 50%;
  box-shadow:
    0 0 0 3.2cqw rgba(20, 92, 83, 0.04),
    0 0 0 6.4cqw rgba(20, 92, 83, 0.025);
}

.ppt-coverIntro {
  position: relative;
  z-index: 1;
  text-align: center;
  transform: translateY(-1.8cqw);
}

.ppt-coverTitle {
  margin: 0;
  font-size: 4.15cqw;
  font-weight: 850;
  line-height: 1.12;
  letter-spacing: -0.045em;
}

.ppt-coverSubtitle {
  margin: 0.72cqw 0 0;
  color: #58726e;
  font-size: 1.32cqw;
  font-weight: 650;
  line-height: 1.6;
}

.ppt-coverAgenda {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(4, minmax(0, 1fr));
  grid-auto-flow: column;
  gap: 0;
  margin: 0;
  padding: 0;
  width: 82cqw;
  justify-self: center;
  align-self: start;
  transform: translateY(-1.8cqw);
  list-style: none;
  border-top: 0.1cqw solid rgba(18, 49, 47, 0.16);
}

.ppt-coverAgenda li {
  display: grid;
  grid-template-columns: 3.8cqw minmax(0, 1fr);
  align-items: center;
  min-height: 4.55cqw;
  border-bottom: 0.1cqw solid rgba(18, 49, 47, 0.16);
  color: #183f3b;
  font-size: 1.48cqw;
  font-weight: 750;
  line-height: 1.35;
  white-space: nowrap;
}

.ppt-coverAgenda li:nth-child(n + 5) {
  padding-left: 2.2cqw;
  border-left: 0.1cqw solid rgba(18, 49, 47, 0.16);
}

.ppt-coverNumber {
  color: #ee764d;
  font-size: 1cqw;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.ppt-slide--reason {
  grid-template-rows: auto minmax(0, 1fr);
  align-content: stretch;
  gap: 3cqw;
  padding: 4.2cqw 7.2cqw;
}

.ppt-reasonHeader {
  position: relative;
  z-index: 1;
}

.ppt-sectionEyebrow {
  display: block;
  margin-bottom: 0.42cqw;
  color: #ee764d;
  font-size: 0.78cqw;
  font-weight: 850;
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.ppt-reasonHeader h2 {
  margin: 0;
  color: #12312f;
  font-size: 3.55cqw;
  font-weight: 850;
  line-height: 1.15;
  letter-spacing: -0.045em;
}

.ppt-reasonColumns {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4.8cqw;
}

.ppt-reasonColumn {
  padding-top: 1.45cqw;
  border-top: 0.18cqw solid #ee764d;
}

.ppt-reasonColumn + .ppt-reasonColumn {
  border-top-color: #145c53;
}

.ppt-reasonLabel {
  margin: 0 0 1.55cqw;
  color: #12312f;
  font-size: 2cqw;
  font-weight: 820;
}

.ppt-reasonColumn ul {
  display: grid;
  gap: 1.25cqw;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ppt-reasonColumn li {
  position: relative;
  padding-left: 1.4cqw;
  color: #355753;
  font-size: 1.42cqw;
  font-weight: 620;
  line-height: 1.48;
}

.ppt-reasonColumn li::before {
  content: '';
  position: absolute;
  top: 0.62em;
  left: 0;
  width: 0.42cqw;
  height: 0.42cqw;
  border-radius: 50%;
  background: #ee764d;
}

.ppt-reasonColumn + .ppt-reasonColumn li::before {
  background: #145c53;
}

.ppt-slide--concept,
.ppt-slide--resolution {
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: stretch;
  gap: 2.35cqw;
  padding: 4.2cqw 7.2cqw;
}

.ppt-slide--resolution {
  grid-template-rows: auto minmax(0, 1fr);
}

.ppt-slide--resolution .ppt-topicHeader p {
  margin-top: 0.62cqw;
  font-size: 1.34cqw;
  font-weight: 700;
}

.ppt-topicHeader {
  position: relative;
  z-index: 1;
}

.ppt-topicHeader h2 {
  margin: 0;
  color: #12312f;
  font-size: 3.55cqw;
  font-weight: 850;
  line-height: 1.15;
  letter-spacing: -0.045em;
}

.ppt-topicHeader p {
  margin: 0.75cqw 0 0;
  color: #58726e;
  font-size: 1.12cqw;
  font-weight: 620;
}

.ppt-conceptFlow {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: 0;
}

.ppt-conceptBlock {
  display: grid;
  grid-template-columns: 15cqw minmax(0, 1fr) 14cqw;
  align-items: center;
  gap: 1.2cqw;
  padding: 1cqw 0;
  border-top: 0.12cqw solid rgba(18, 49, 47, 0.18);
}

.ppt-conceptBlock:last-child {
  border-bottom: 0.12cqw solid rgba(18, 49, 47, 0.18);
}

.ppt-conceptBlock h3 {
  margin: 0;
  color: #12312f;
  font-size: 2.05cqw;
  font-weight: 840;
}

.ppt-conceptBlock p {
  margin: 0;
  color: #4d6b67;
  font-size: 1.34cqw;
  font-weight: 650;
  line-height: 1.46;
}

.ppt-conceptBlock strong {
  color: #12312f;
  font-size: 1.22cqw;
  font-weight: 800;
  text-align: right;
}

.ppt-formula {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.5cqw;
  padding: 1.15cqw;
  border-top: 0.1cqw solid rgba(18, 49, 47, 0.18);
  border-bottom: 0.1cqw solid rgba(18, 49, 47, 0.18);
}

.ppt-formula p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.15cqw;
  margin: 0;
  color: #12312f;
  font-size: 1.52cqw;
  font-weight: 780;
}

.ppt-formula b {
  color: #ee764d;
  font-size: 1.82cqw;
}

.ppt-formula small {
  color: #58726e;
  font-size: 1.04cqw;
  font-weight: 650;
}

.ppt-resolutionContent {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4.8cqw;
}

.ppt-deviceQuestion,
.ppt-dprOverview {
  padding-top: 1.45cqw;
  border-top: 0.2cqw solid #ee764d;
}

.ppt-dprOverview {
  border-top-color: #145c53;
}

.ppt-deviceQuestion h3,
.ppt-dprOverview h3 {
  margin: 0 0 1.25cqw;
  color: #12312f;
  font-size: 2cqw;
  font-weight: 830;
}

.ppt-deviceQuestionLead {
  margin: 0 0 1.25cqw;
  color: #58726e;
  font-size: 1.22cqw;
  font-weight: 680;
  line-height: 1.5;
}

.ppt-resolutionLead {
  margin: -0.45cqw 0 1cqw;
  color: #58726e;
  font-size: 1.16cqw;
  font-weight: 650;
  line-height: 1.48;
}

.ppt-platformCompare {
  display: grid;
  gap: 0.8cqw;
}

.ppt-platformCompare section {
  display: grid;
  grid-template-columns: 5.3cqw minmax(0, 1fr);
  column-gap: 1cqw;
  padding: 1cqw 1.1cqw;
  border-left: 0.22cqw solid #145c53;
  background: rgba(20, 92, 83, 0.055);
}

.ppt-platformCompare section:last-child {
  border-left-color: #ee764d;
  background: rgba(238, 118, 77, 0.055);
}

.ppt-platformCompare span {
  grid-row: 1 / span 2;
  align-self: center;
  color: #ee764d;
  font-size: 1.36cqw;
  font-weight: 850;
}

.ppt-platformCompare section:first-child span {
  color: #145c53;
}

.ppt-platformCompare strong {
  color: #12312f;
  font-size: 1.3cqw;
  font-weight: 820;
}

.ppt-platformCompare p {
  margin: 0.35cqw 0 0;
  color: #58726e;
  font-size: 1.08cqw;
  font-weight: 650;
  line-height: 1.45;
}

.ppt-deviceQuestionKey {
  margin: 1.15cqw 0 0;
  padding: 0.82cqw 1cqw;
  border-left: 0.24cqw solid #ee764d;
  color: #12312f;
  background: rgba(238, 118, 77, 0.08);
  font-size: 1.28cqw;
  font-weight: 820;
  line-height: 1.5;
}

.ppt-dprTable {
  --n-font-size: 1.12cqw !important;
  --n-th-padding: 0.66cqw 0.82cqw !important;
  --n-td-padding: 0.61cqw 0.82cqw !important;
  --n-border-color: rgba(18, 49, 47, 0.16) !important;
  --n-th-color: rgba(20, 92, 83, 0.08) !important;
  --n-td-color: transparent !important;
  --n-th-text-color: #12312f !important;
  --n-td-text-color: #355753 !important;
  --n-th-font-weight: 800 !important;
}

.ppt-slide--data {
  grid-template-rows: auto minmax(0, 1fr);
  align-content: stretch;
  gap: 1.45cqw;
  padding: 3.5cqw 7.2cqw;
}

.ppt-dataGrid {
  position: relative;
  z-index: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: 17.8cqw minmax(0, 1fr);
  gap: 1.15cqw 1.4cqw;
}

.ppt-chartPanel {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  padding: 1cqw 1.2cqw 0.85cqw;
  border-top: 0.2cqw solid #145c53;
  background: rgba(255, 255, 255, 0.3);
}

.ppt-chartPanel--wide {
  grid-column: 1 / -1;
}

.ppt-chartPanel h3 {
  margin: 0;
  color: #12312f;
  font-size: 1.45cqw;
  font-weight: 830;
}

.ppt-chartPanelTitle {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 2cqw;
}

.ppt-chartLegend {
  display: flex;
  align-items: center;
  gap: 1.2cqw;
  color: #355753;
  font-size: 0.82cqw;
  font-weight: 700;
}

.ppt-chartLegend span {
  display: inline-flex;
  align-items: center;
  gap: 0.42cqw;
}

.ppt-chartLegend small {
  padding-left: 1cqw;
  border-left: 0.1cqw solid rgba(18, 49, 47, 0.18);
  color: #6a807c;
  font-size: 0.78cqw;
  font-weight: 650;
}

.ppt-chartLegendDot {
  width: 0.68cqw;
  height: 0.68cqw;
  border-radius: 50%;
  background: #145c53;
}

.ppt-chartLegendDot--apple {
  background: #ee764d;
}

.ppt-shareChart,
.ppt-platformTypeChart {
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.ppt-slide--deviceTable {
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: stretch;
  gap: 1.05cqw;
  padding: 2.85cqw 6.2cqw;
}

.ppt-deviceTableHeader {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2cqw;
}

.ppt-deviceTableHeader h2 {
  font-size: 3.15cqw;
}

.ppt-deviceTableHeader > strong {
  padding: 0.62cqw 0.9cqw;
  color: #145c53;
  background: rgba(20, 92, 83, 0.08);
  font-size: 0.95cqw;
  font-weight: 800;
  white-space: nowrap;
}

.ppt-deviceTable {
  position: relative;
  z-index: 1;
  align-self: stretch;
  --n-font-size: 0.88cqw !important;
  --n-th-padding: 0.52cqw 0.72cqw !important;
  --n-td-padding: 0.39cqw 0.72cqw !important;
  --n-border-color: rgba(18, 49, 47, 0.13) !important;
  --n-th-color: #dfe7de !important;
  --n-td-color: rgba(255, 255, 255, 0.18) !important;
  --n-th-text-color: #12312f !important;
  --n-td-text-color: #355753 !important;
  --n-th-font-weight: 820 !important;
}

.ppt-deviceTableCode {
  width: 15%;
}

.ppt-deviceTableName {
  width: 37%;
}

.ppt-deviceTableNumber {
  width: 12%;
}

.ppt-deviceTableShare {
  width: 14%;
}

.ppt-deviceTableViewport {
  width: 22%;
}

.ppt-deviceTable--ipad {
  --n-font-size: 1cqw !important;
  --n-th-padding: 0.56cqw 0.78cqw !important;
  --n-td-padding: 0.41cqw 0.78cqw !important;
}

.ppt-ipadTableName {
  width: 38%;
}

.ppt-ipadTableYear {
  width: 12%;
}

.ppt-ipadTableNumber {
  width: 12%;
}

.ppt-ipadTableShare {
  width: 14%;
}

.ppt-ipadTableViewport {
  width: 24%;
}

.ppt-deviceTable--year {
  --n-font-size: 1cqw !important;
  --n-th-padding: 0.56cqw 0.78cqw !important;
  --n-td-padding: 0.41cqw 0.78cqw !important;
}

.ppt-yearTableName {
  width: 38%;
}

.ppt-yearTableYear {
  width: 12%;
}

.ppt-yearTableNumber {
  width: 12%;
}

.ppt-yearTableShare {
  width: 14%;
}

.ppt-yearTableViewport {
  width: 24%;
}

:deep(.ppt-deviceTable th:nth-child(n + 3)),
:deep(.ppt-deviceTable td:nth-child(n + 3)) {
  text-align: right;
}

:deep(.ppt-deviceTable td:first-child) {
  color: #58726e;
  font-variant-numeric: tabular-nums;
}

:deep(.ppt-deviceTable td:nth-child(3)),
:deep(.ppt-deviceTable td:nth-child(4)) {
  font-variant-numeric: tabular-nums;
  font-weight: 720;
}

:deep(.ppt-deviceTable--ipad th:nth-child(2)),
:deep(.ppt-deviceTable--ipad td:nth-child(2)),
:deep(.ppt-deviceTable--year th:nth-child(2)),
:deep(.ppt-deviceTable--year td:nth-child(2)) {
  text-align: center;
}

:deep(.ppt-deviceTable--ipad td:first-child),
:deep(.ppt-deviceTable--year td:first-child) {
  color: #355753;
  font-weight: 700;
  font-variant-numeric: normal;
}

:deep(.ppt-deviceTable--ipad td:nth-child(2)),
:deep(.ppt-deviceTable--year td:nth-child(2)) {
  color: #58726e;
  font-weight: 740;
  font-variant-numeric: tabular-nums;
}

.ppt-viewportTag {
  display: inline-flex;
  padding: 0.18cqw 0.56cqw;
  color: #12312f;
  background: rgba(238, 118, 77, 0.13);
  font-weight: 830;
  font-variant-numeric: tabular-nums;
}

.ppt-viewportTag--android {
  color: #0d4f48;
  background: rgba(20, 92, 83, 0.11);
}

.ppt-deviceTable--androidTablet {
  --n-font-size: 0.76cqw !important;
  --n-th-padding: 0.45cqw 0.5cqw !important;
  --n-td-padding: 0.33cqw 0.5cqw !important;
}

.ppt-androidTableName {
  width: 26%;
}

.ppt-androidTableYear {
  width: 9%;
}

.ppt-androidTableNumber {
  width: 8%;
}

.ppt-androidTableShare {
  width: 10%;
}

.ppt-androidTableResolution {
  width: 20%;
}

.ppt-androidTableNote {
  width: 27%;
}

:deep(.ppt-deviceTable--androidTablet th:nth-child(2)),
:deep(.ppt-deviceTable--androidTablet td:nth-child(2)) {
  text-align: center;
}

:deep(.ppt-deviceTable--androidTablet td:first-child) {
  color: #355753;
  font-weight: 700;
  font-variant-numeric: normal;
}

:deep(.ppt-deviceTable--androidTablet td:nth-child(2)) {
  color: #58726e;
  font-weight: 740;
  font-variant-numeric: tabular-nums;
}

:deep(.ppt-deviceTable--androidTablet th:last-child),
:deep(.ppt-deviceTable--androidTablet td:last-child) {
  text-align: left;
}

:deep(.ppt-deviceTable--androidTablet td:last-child) {
  color: #58726e;
  line-height: 1.35;
}

:deep(.ppt-deviceTable tr.is-top-ten td) {
  background: rgba(20, 92, 83, 0.025);
}

.ppt-deviceTableConclusion {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 0.78cqw 1.1cqw;
  border-left: 0.26cqw solid #ee764d;
  color: #355753;
  background: rgba(20, 92, 83, 0.055);
  font-size: 0.98cqw;
  font-weight: 670;
}

.ppt-deviceTableConclusion strong {
  color: #12312f;
  font-weight: 850;
}

.ppt-slide--selection {
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: stretch;
  gap: 1.35cqw;
  padding: 3.2cqw 6.2cqw;
}

.ppt-slide--selectionMatrix {
  grid-template-rows: auto auto auto;
  align-content: center;
  gap: clamp(10px, 0.82cqw, 16px);
  padding: 2.45cqw 5.65cqw 2.15cqw 6.2cqw;
}

.ppt-slide--selectionMatrix .ppt-slideDecor {
  opacity: 0.42;
}

.ppt-slide--selectionMatrix .ppt-selectionHeader p {
  margin-top: 0.5cqw;
  font-size: 1.18cqw;
  font-weight: 680;
}

.ppt-selectionHeader {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2cqw;
}

.ppt-selectionHeader h2 {
  font-size: 3.2cqw;
}

.ppt-selectionHeader > strong {
  padding: 0.68cqw 0.95cqw;
  color: #12312f;
  background: rgba(238, 118, 77, 0.12);
  font-size: 1cqw;
  font-weight: 850;
  white-space: nowrap;
}

.ppt-selectionTotal {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: end;
  gap: clamp(4px, 0.28cqw, 6px);
  padding: clamp(9px, 0.68cqw, 13px) clamp(12px, 0.9cqw, 17px);
  border-left: clamp(3px, 0.22cqw, 4px) solid #ee764d;
  background: rgba(255, 255, 255, 0.42);
}

.ppt-selectionTotal strong {
  color: #12312f;
  font-size: clamp(15px, 1.02cqw, 20px);
  font-weight: 860;
}

.ppt-selectionTotal span {
  color: #58726e;
  font-size: clamp(11px, 0.74cqw, 14px);
  font-weight: 750;
  white-space: nowrap;
}

.ppt-selectionGrid {
  position: relative;
  z-index: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.2cqw;
}

.ppt-devicePanelGrid {
  position: relative;
  z-index: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(28px, 2.1cqw, 42px);
  align-items: stretch;
}

.ppt-selectionGroup {
  min-width: 0;
  padding-top: 1cqw;
  border-top: 0.2cqw solid #145c53;
}

.ppt-selectionGroup--iphone {
  border-top-color: #ee764d;
}

.ppt-selectionGroup > header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1cqw;
  margin-bottom: 0.75cqw;
}

.ppt-selectionGroup h3 {
  margin: 0;
  color: #12312f;
  font-size: 1.7cqw;
  font-weight: 850;
}

.ppt-selectionGroup > header span {
  color: #58726e;
  font-size: 0.86cqw;
  font-weight: 750;
}

.ppt-selectionTable {
  --n-font-size: 0.79cqw !important;
  --n-th-padding: 0.44cqw 0.48cqw !important;
  --n-td-padding: 0.38cqw 0.48cqw !important;
  --n-border-color: rgba(18, 49, 47, 0.13) !important;
  --n-th-color: rgba(20, 92, 83, 0.08) !important;
  --n-td-color: rgba(255, 255, 255, 0.2) !important;
  --n-th-text-color: #12312f !important;
  --n-td-text-color: #355753 !important;
  --n-th-font-weight: 800 !important;
}

:deep(.ppt-selectionTable th:not(:first-child)),
:deep(.ppt-selectionTable td:not(:first-child)) {
  text-align: right;
}

:deep(.ppt-selectionTable td strong) {
  color: #12312f;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
}

.ppt-matrixConclusion {
  position: relative;
  z-index: 1;
  min-height: clamp(56px, 3.8cqw, 72px);
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 clamp(14px, 1cqw, 20px);
  border-left: clamp(3px, 0.24cqw, 5px) solid #ee764d;
  color: #355753;
  background: rgba(220, 239, 224, 0.62);
  font-size: clamp(13px, 0.9cqw, 17px);
  font-weight: 700;
  line-height: 1.4;
}

.ppt-matrixConclusion strong,
.ppt-matrixConclusion b {
  color: #12312f;
  font-weight: 860;
}

.ppt-selectionNotes {
  display: grid;
  gap: 0.68cqw;
  margin: 0.9cqw 0 0;
  padding: 0;
  list-style: none;
}

.ppt-selectionNotes li {
  display: grid;
  grid-template-columns: 6.8cqw minmax(0, 1fr);
  gap: 0.8cqw;
  padding-left: 0.7cqw;
  border-left: 0.2cqw solid rgba(20, 92, 83, 0.45);
}

.ppt-selectionNotes--compact {
  gap: 0.45cqw;
}

.ppt-selectionNotes--compact li {
  grid-template-columns: 6.4cqw minmax(0, 1fr);
}

.ppt-selectionNotes li > strong {
  color: #12312f;
  font-size: 0.88cqw;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
}

.ppt-selectionNotes li div {
  display: grid;
  gap: 0.12cqw;
}

.ppt-selectionNotes span {
  color: #355753;
  font-size: 0.77cqw;
  font-weight: 720;
  line-height: 1.35;
}

.ppt-selectionNotes small {
  color: #718580;
  font-size: 0.68cqw;
  font-weight: 620;
  line-height: 1.35;
}

.ppt-selectionTable--android {
  --n-font-size: 0.92cqw !important;
  --n-th-padding: 0.65cqw 0.65cqw !important;
  --n-td-padding: 0.62cqw 0.65cqw !important;
}

:deep(.ppt-selectionTable--android th:last-child),
:deep(.ppt-selectionTable--android td:last-child) {
  text-align: left;
}

:deep(.ppt-selectionTable--android th:first-child),
:deep(.ppt-selectionTable--android td:first-child) {
  width: 32%;
  text-align: center;
}

.ppt-selectionConclusion {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 0.9cqw 1.2cqw;
  border-left: 0.28cqw solid #ee764d;
  color: #355753;
  background: rgba(20, 92, 83, 0.06);
  font-size: 1.1cqw;
  font-weight: 720;
  text-align: center;
}

.ppt-selectionConclusion strong,
.ppt-selectionConclusion b {
  color: #12312f;
  font-weight: 880;
}

.ppt-slide--viewportLab {
  grid-template-columns: 0.78fr 1.22fr;
  grid-template-rows: minmax(0, 1fr);
  align-content: stretch;
  align-items: stretch;
  gap: 3.2cqw;
  padding: 3.25cqw 5.2cqw 3.25cqw 6.2cqw;
}

.ppt-viewportLabCopy,
.ppt-viewportLabVisual {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.ppt-viewportLabCopy {
  display: flex;
  flex-direction: column;
}

.ppt-viewportLabHeader > span {
  display: block;
  margin-bottom: 0.55cqw;
  color: #ee764d;
  font-size: 0.82cqw;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.ppt-viewportLabHeader h2 {
  margin: 0;
  color: #12312f;
  font-size: 3.35cqw;
  font-weight: 880;
  line-height: 1;
  letter-spacing: -0.045em;
}

.ppt-viewportLabHeader > p {
  margin: 0.8cqw 0 0;
  color: #58726e;
  font-size: 1.02cqw;
  font-weight: 650;
  line-height: 1.5;
}

.ppt-viewportLabIntro,
.ppt-viewportLabFeature,
.ppt-viewportLabExtension {
  padding-top: 1.05cqw;
  border-top: 0.12cqw solid rgba(18, 49, 47, 0.16);
}

.ppt-viewportLabIntro {
  margin-top: 1.45cqw;
}

.ppt-viewportLabIntro h3,
.ppt-viewportLabFeature h3,
.ppt-viewportLabExtension h3 {
  margin: 0;
  color: #12312f;
  font-size: 1.26cqw;
  font-weight: 850;
}

.ppt-viewportLabIntro p {
  margin: 0.55cqw 0 0;
  color: #4d6b67;
  font-size: 0.88cqw;
  font-weight: 620;
  line-height: 1.55;
}

.ppt-viewportLabFeature {
  margin-top: 1.05cqw;
  padding-top: 1.2cqw;
}

.ppt-viewportLabFeature h3 {
  font-size: clamp(20px, 1.45cqw, 28px);
}

.ppt-viewportLabSectionTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1cqw;
}

.ppt-viewportLabSectionTitle h3 {
  flex: 0 0 auto;
}

.ppt-viewportLabSectionTitle > div {
  min-width: 0;
  display: grid;
  justify-items: end;
  gap: 0.1cqw;
}

.ppt-viewportLabSectionTitle strong {
  color: #145c53;
  font-size: clamp(15px, 1cqw, 19px);
  font-weight: 880;
}

.ppt-viewportLabSectionTitle span {
  overflow: hidden;
  max-width: 25cqw;
  color: #718580;
  font-size: clamp(11px, 0.72cqw, 14px);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppt-viewportLabCapabilities {
  display: grid;
  gap: 0.58cqw;
  margin: 0.95cqw 0 0;
  padding: 0;
  list-style: none;
}

.ppt-viewportLabCapabilities li {
  display: grid;
  grid-template-columns: 2cqw minmax(0, 1fr);
  grid-template-areas:
    'number title'
    'number description';
  column-gap: 0.7cqw;
  row-gap: 0.2cqw;
  align-items: start;
  min-height: 4.15cqw;
  padding: 0.62cqw 0.72cqw;
  border-left: 0.18cqw solid #145c53;
  background: rgba(20, 92, 83, 0.035);
}

.ppt-viewportLabCapabilities li:nth-child(even) {
  border-left-color: #ee764d;
  background: rgba(238, 118, 77, 0.035);
}

.ppt-viewportLabCapabilities li > span {
  grid-area: number;
  align-self: start;
  padding-top: 0.08cqw;
  color: #ee764d;
  font-size: clamp(12px, 0.82cqw, 16px);
  font-weight: 900;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}

.ppt-viewportLabCapabilities li > strong {
  grid-area: title;
  color: #12312f;
  font-size: clamp(14px, 0.92cqw, 18px);
  font-weight: 850;
  line-height: 1.25;
  white-space: nowrap;
}

.ppt-viewportLabCapabilities li > p {
  grid-area: description;
  margin: 0;
  color: #58726e;
  font-size: clamp(12px, 0.8cqw, 15px);
  font-weight: 650;
  line-height: 1.48;
}

.ppt-viewportLabExtension {
  display: grid;
  grid-template-columns: 6.4cqw minmax(0, 1fr);
  align-items: baseline;
  gap: 0.8cqw;
}

.ppt-viewportLabExtension p {
  margin: 0;
  color: #ee764d;
  font-size: 0.76cqw;
  font-weight: 800;
  line-height: 1.45;
}

.ppt-viewportLabVisual {
  align-self: center;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: 100%;
  height: 38.2cqw;
  padding: 1.35cqw;
  border: 0.1cqw solid rgba(18, 49, 47, 0.14);
  border-radius: 1.5cqw;
  background: rgba(255, 255, 255, 0.68);
  box-shadow: 0 1.2cqw 3cqw rgba(18, 49, 47, 0.09);
}

.ppt-viewportLabVisualHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.2cqw;
  padding: 0.15cqw 0.2cqw 1cqw;
}

.ppt-viewportLabVisualHead > div {
  display: grid;
  gap: 0.18cqw;
}

.ppt-viewportLabVisualHead span {
  color: #12312f;
  font-size: 1.25cqw;
  font-weight: 850;
}

.ppt-viewportLabVisualHead small {
  color: #718580;
  font-size: 0.7cqw;
  font-weight: 650;
}

.ppt-viewportLabVisualHead b {
  padding: 0.42cqw 0.65cqw;
  color: #145c53;
  background: rgba(20, 92, 83, 0.08);
  font-size: 0.72cqw;
  font-weight: 850;
  white-space: nowrap;
}

.ppt-viewportLabVisual img {
  width: 100%;
  min-height: 0;
  align-self: center;
  display: block;
  object-fit: contain;
  border: 0.08cqw solid rgba(18, 49, 47, 0.11);
  border-radius: 0.8cqw;
  background: #fff;
}

.ppt-viewportLabVisual figcaption {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8cqw;
  padding: 1cqw 0.2cqw 0.1cqw;
}

.ppt-viewportLabVisual figcaption span {
  padding-top: 0.65cqw;
  border-top: 0.14cqw solid #ee764d;
  color: #355753;
  font-size: 0.76cqw;
  font-weight: 760;
  text-align: center;
}

.ppt-viewportLabVisual figcaption span:nth-child(2) {
  border-top-color: #145c53;
}

.ppt-viewportLabVisual figcaption span:nth-child(3) {
  border-top-color: #79a69e;
}

.ppt-slide--effects {
  grid-template-columns: 0.66fr 1.34fr;
  grid-template-rows: minmax(0, 1fr);
  align-content: stretch;
  align-items: stretch;
  gap: 3.5cqw;
  padding: 3.5cqw 5.3cqw 3.5cqw 6.2cqw;
}

.ppt-effectsCopy,
.ppt-effectsGallery {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.ppt-effectsCopy {
  display: flex;
  flex-direction: column;
}

.ppt-effectsHeader > span {
  display: block;
  margin-bottom: 0.8cqw;
  color: #ee764d;
  font-size: 0.82cqw;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.ppt-effectsHeader h2 {
  margin: 0;
  color: #12312f;
  font-size: 3.45cqw;
  font-weight: 880;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.ppt-effectsHeader p {
  margin: 1.1cqw 0 0;
  color: #58726e;
  font-size: 1cqw;
  font-weight: 640;
  line-height: 1.62;
}

.ppt-effectsPoints {
  display: grid;
  gap: 1.15cqw;
  margin: 2cqw 0 0;
  padding: 1.5cqw 0 0;
  border-top: 0.12cqw solid rgba(18, 49, 47, 0.16);
  list-style: none;
}

.ppt-effectsPoints li {
  display: grid;
  grid-template-columns: 6.6cqw minmax(0, 1fr);
  gap: 0.8cqw;
  align-items: baseline;
  padding-left: 0.8cqw;
  border-left: 0.18cqw solid #145c53;
}

.ppt-effectsPoints li:nth-child(2) {
  border-left-color: #ee764d;
}

.ppt-effectsPoints li:nth-child(3) {
  border-left-color: #79a69e;
}

.ppt-effectsPoints strong {
  color: #12312f;
  font-size: 1.05cqw;
  font-weight: 850;
}

.ppt-effectsPoints span {
  color: #58726e;
  font-size: 0.8cqw;
  font-weight: 650;
  line-height: 1.45;
}

.ppt-effectsHint {
  margin: auto 0 0;
  padding-top: 1cqw;
  border-top: 0.1cqw solid rgba(18, 49, 47, 0.16);
  color: #ee764d;
  font-size: 0.78cqw;
  font-weight: 820;
}

.ppt-slide--largeEffectsCopy .ppt-effectsHeader > span {
  font-size: clamp(13px, 0.92cqw, 18px);
}

.ppt-slide--largeEffectsCopy .ppt-effectsHeader p {
  font-size: clamp(16px, 1.12cqw, 22px);
  line-height: 1.58;
}

.ppt-slide--largeEffectsCopy .ppt-effectsPoints {
  gap: 1.3cqw;
}

.ppt-slide--largeEffectsCopy .ppt-effectsPoints strong {
  font-size: clamp(16px, 1.16cqw, 22px);
}

.ppt-slide--largeEffectsCopy .ppt-effectsPoints span {
  font-size: clamp(13px, 0.9cqw, 17px);
  line-height: 1.5;
}

.ppt-slide--largeEffectsCopy .ppt-effectsHint {
  font-size: clamp(12px, 0.86cqw, 16px);
}

.ppt-slide--agentEffects .ppt-effectsHeader > span,
.ppt-slide--agentEffects .ppt-effectsHint {
  color: #145c53;
}

.ppt-agentEffectsPoints li:first-child {
  border-left-color: #ee764d;
}

.ppt-agentEffectsPoints li {
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 0.38cqw;
  min-height: 5.4cqw;
  padding: 0.72cqw 0.85cqw;
}

.ppt-agentEffectsPoints strong,
.ppt-agentEffectsPoints span {
  display: block;
  min-width: 0;
}

.ppt-agentEffectsPoints li:nth-child(2) {
  border-left-color: #145c53;
}

.ppt-agentEffectsPoints li:nth-child(3) {
  border-left-color: #79a69e;
}

.ppt-slide--issue .ppt-effectsHeader > span {
  color: #ee764d;
  font-size: clamp(13px, 0.9cqw, 17px);
}

.ppt-slide--issue .ppt-effectsHeader h2 {
  font-size: clamp(36px, 2.55cqw, 50px);
  line-height: 1.08;
  white-space: nowrap;
}

.ppt-issueSummary {
  margin-top: 2cqw;
  padding-top: 1.55cqw;
  border-top: 0.12cqw solid rgba(18, 49, 47, 0.16);
}

.ppt-issueNumber {
  display: inline-flex;
  padding: 0.35cqw 0.65cqw;
  color: #fff;
  background: #ee764d;
  font-size: clamp(12px, 0.82cqw, 16px);
  font-weight: 850;
  letter-spacing: 0.06em;
}

.ppt-issueSummary h3 {
  margin: 1cqw 0 0;
  color: #12312f;
  font-size: clamp(25px, 1.65cqw, 32px);
  font-weight: 880;
  line-height: 1.3;
  letter-spacing: -0.035em;
  white-space: nowrap;
}

.ppt-issueEvidence {
  display: grid;
  gap: 1.1cqw;
  margin: 1.7cqw 0 0;
}

.ppt-issueEvidence > div {
  display: grid;
  grid-template-columns: 4.6cqw minmax(0, 1fr);
  gap: 0.9cqw;
  align-items: baseline;
  min-height: 3.5cqw;
  padding: 0.65cqw 0 0.65cqw 0.85cqw;
  border-left: 0.2cqw solid #145c53;
  background: rgba(20, 92, 83, 0.035);
}

.ppt-issueEvidence > div:nth-child(2) {
  border-left-color: #ee764d;
  background: rgba(238, 118, 77, 0.035);
}

.ppt-issueEvidence dt {
  color: #12312f;
  font-size: clamp(16px, 1.05cqw, 20px);
  font-weight: 850;
}

.ppt-issueEvidence dd {
  margin: 0;
  color: #58726e;
  font-size: clamp(14px, 0.92cqw, 18px);
  font-weight: 680;
  line-height: 1.5;
}

.ppt-issueGallery {
  border-top: 0.24cqw solid #ee764d;
}

.ppt-issuePreviewFooter {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75cqw;
  align-items: center;
  padding-top: 0.9cqw;
}

.ppt-issuePreviewFooter span {
  padding: 0.3cqw 0.55cqw;
  color: #9a4b31;
  background: rgba(238, 118, 77, 0.11);
  font-size: 0.66cqw;
  font-weight: 820;
  white-space: nowrap;
}

.ppt-issuePreviewFooter strong {
  overflow: hidden;
  color: #58726e;
  font-size: 0.7cqw;
  font-weight: 720;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppt-issuePreviewFooter button {
  min-height: 2.4cqw;
  padding: 0 0.8cqw;
  border: 0.08cqw solid #12312f;
  border-radius: 0.55cqw;
  color: #fff;
  background: #12312f;
  font: inherit;
  font-size: 0.68cqw;
  font-weight: 800;
  cursor: zoom-in;
}

.ppt-slide--repair {
  grid-template-columns: 0.88fr 1.12fr;
  gap: 2.8cqw;
}

.ppt-repairCopy {
  justify-content: flex-start;
}

.ppt-repairCopy .ppt-effectsHeader h2 {
  margin-top: 0;
  font-size: clamp(28px, 2.05cqw, 40px);
  line-height: 1.08;
}

.ppt-repairCopy .ppt-effectsHeader p {
  max-width: 31cqw;
  margin-top: 0.72cqw;
  font-size: clamp(13px, 0.86cqw, 17px);
  line-height: 1.5;
}

.ppt-repairSteps {
  display: grid;
  gap: 0.48cqw;
  margin: 0.95cqw 0 0;
  padding: 0.85cqw 0 0;
  border-top: 0.12cqw solid rgba(18, 49, 47, 0.16);
  list-style: none;
}

.ppt-repairSteps > li {
  min-width: 0;
  display: grid;
  grid-template-columns: 2.35cqw minmax(0, 1fr);
  gap: 0.75cqw;
  align-items: center;
  min-height: 3.75cqw;
  padding: 0.52cqw 0.7cqw;
  border-left: 0.2cqw solid #145c53;
  background: rgba(20, 92, 83, 0.04);
}

.ppt-repairSteps > li > span {
  color: #ee764d;
  font-size: clamp(13px, 0.88cqw, 17px);
  font-weight: 880;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.ppt-repairSteps > li:nth-child(even) {
  border-left-color: #ee764d;
  background: rgba(238, 118, 77, 0.04);
}

.ppt-repairSteps > li > div {
  min-width: 0;
}

.ppt-repairSteps strong {
  display: block;
  color: #12312f;
  font-size: clamp(15px, 1cqw, 19px);
  font-weight: 850;
  line-height: 1.25;
}

.ppt-repairSteps p {
  margin: 0.25cqw 0 0;
  color: #58726e;
  font-size: clamp(12px, 0.78cqw, 15px);
  font-weight: 660;
  line-height: 1.45;
}

.ppt-repairRuleStep {
  align-items: start !important;
}

.ppt-repairRules {
  display: grid;
  gap: 0.25cqw;
  margin: 0.45cqw 0 0;
  padding: 0;
  list-style: none;
}

.ppt-repairRules li {
  display: grid;
  grid-template-columns: 5.6cqw minmax(0, 1fr);
  gap: 0.5cqw;
  align-items: baseline;
}

.ppt-repairRules b {
  color: #12312f;
  font-size: clamp(11px, 0.68cqw, 13px);
  font-weight: 850;
  white-space: nowrap;
}

.ppt-repairRules span {
  color: #58726e;
  font-size: clamp(10px, 0.63cqw, 12px);
  font-weight: 640;
  line-height: 1.35;
}

.ppt-repairConclusion {
  margin: auto 0 0;
  padding: 0.62cqw 0.78cqw;
  border-left: 0.22cqw solid #145c53;
  color: #294f49;
  background: rgba(220, 239, 224, 0.7);
  font-size: clamp(11px, 0.72cqw, 14px);
  font-weight: 800;
  line-height: 1.4;
}

.ppt-repairGallery {
  border-top: 0.24cqw solid #145c53;
}

.ppt-slide--workflow {
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: start;
  gap: clamp(12px, 0.86cqw, 17px);
  padding: 3.05cqw 4.8cqw 1.8cqw 5.8cqw;
}

.ppt-slide--workflow .ppt-slideDecor {
  opacity: 0.48;
}

.ppt-workflowHeader {
  display: grid;
  gap: 0.28cqw;
}

.ppt-workflowHeader > span {
  display: block;
  color: #ee764d;
  font-size: 0.74cqw;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.ppt-workflowHeader h2 {
  overflow: hidden;
  font-size: 2.9cqw;
  line-height: 1.08;
  text-overflow: clip;
  white-space: nowrap;
}

.ppt-workflowScroll {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-color: rgba(20, 92, 83, 0.34) transparent;
  scrollbar-width: thin;
}

.ppt-workflowCanvas {
  --workflow-arrow-width: clamp(24px, 1.7cqw, 33px);
  min-width: 0;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto minmax(0, 1fr);
  gap: clamp(7px, 0.5cqw, 10px);
}

.ppt-workflowStages {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.ppt-workflowStage {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--workflow-arrow-width);
  color: #738783;
  font-size: clamp(12px, 0.8cqw, 16px);
  font-weight: 820;
  letter-spacing: 0.08em;
  text-align: center;
}

.ppt-workflowStage span {
  min-width: 0;
}

.ppt-workflowStage i {
  display: block;
}

.ppt-workflowTransition {
  min-height: clamp(26px, 1.75cqw, 34px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 0.55cqw, 11px);
  color: #355753;
}

.ppt-workflowTransition span {
  color: #ee764d;
  font-size: clamp(15px, 1cqw, 19px);
  font-weight: 900;
}

.ppt-workflowTransition strong {
  font-size: clamp(12px, 0.78cqw, 15px);
  font-weight: 850;
}

.ppt-workflowTakeaway {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: clamp(10px, 0.7cqw, 14px) clamp(16px, 1.15cqw, 22px);
  border-left: clamp(3px, 0.22cqw, 4px) solid #145c53;
  color: #294f49;
  background: rgba(220, 239, 224, 0.64);
  font-size: clamp(12px, 0.8cqw, 16px);
  font-weight: 760;
  line-height: 1.35;
  text-align: center;
  white-space: nowrap;
}

@media (max-width: 1199px) {
  .ppt-workflowCanvas {
    min-width: 1090px;
    padding-bottom: 6px;
  }
}

.ppt-effectsGallery {
  z-index: 11;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100%;
  padding: 1.3cqw;
  border: 0.1cqw solid rgba(18, 49, 47, 0.14);
  border-radius: 1.5cqw;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 1.2cqw 3cqw rgba(18, 49, 47, 0.09);
}

.ppt-effectsGalleryHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.2cqw;
  padding: 0.1cqw 0.2cqw 0.9cqw;
}

.ppt-effectsGalleryHead > div {
  display: flex;
  align-items: baseline;
  gap: 0.75cqw;
}

.ppt-effectsGalleryHead span {
  color: #718580;
  font-size: 0.72cqw;
  font-weight: 720;
}

.ppt-effectsGalleryHead strong {
  color: #12312f;
  font-size: 1.22cqw;
  font-weight: 850;
}

.ppt-effectsGalleryHead small {
  color: #ee764d;
  font-size: 0.88cqw;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
}

.ppt-effectsStage {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  border: 0.08cqw solid rgba(18, 49, 47, 0.12);
  border-radius: 0.9cqw;
  background:
    linear-gradient(135deg, rgba(20, 92, 83, 0.08), rgba(238, 118, 77, 0.08)),
    #fff;
  cursor: zoom-in;
}

.ppt-effectsStage img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center top;
  transition: transform 220ms ease;
}

.ppt-effectsStage:hover img {
  transform: scale(1.018);
}

.ppt-effectsZoom {
  position: absolute;
  right: 0.75cqw;
  bottom: 0.75cqw;
  padding: 0.48cqw 0.72cqw;
  border-radius: 999px;
  color: #fff;
  background: rgba(7, 25, 26, 0.82);
  font-size: 0.68cqw;
  font-weight: 760;
  backdrop-filter: blur(0.4cqw);
}

.ppt-effectsControls {
  display: grid;
  grid-template-columns: 2.6cqw minmax(0, 1fr) 2.6cqw;
  gap: 0.8cqw;
  align-items: stretch;
  padding-top: 0.9cqw;
}

.ppt-effectsTurn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0.08cqw solid rgba(18, 49, 47, 0.18);
  border-radius: 0.65cqw;
  color: #12312f;
  background: rgba(255, 255, 255, 0.82);
  font: inherit;
  font-size: 1.1cqw;
  font-weight: 850;
  cursor: pointer;
}

.ppt-effectsTurn:hover {
  color: #fff;
  border-color: #12312f;
  background: #12312f;
}

.ppt-effectsThumbs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65cqw;
}

.ppt-slide--basicGallery .ppt-effectsThumbs {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.ppt-slide--basicGallery .ppt-effectsThumb {
  grid-template-columns: 2.7cqw minmax(0, 1fr);
  gap: 0.45cqw;
}

.ppt-slide--basicGallery .ppt-effectsThumb img {
  width: 2.7cqw;
  height: 2.7cqw;
}

.ppt-effectsThumb {
  min-width: 0;
  display: grid;
  grid-template-columns: 3.2cqw minmax(0, 1fr);
  gap: 0.65cqw;
  align-items: center;
  padding: 0.4cqw;
  border: 0.08cqw solid rgba(18, 49, 47, 0.13);
  border-radius: 0.65cqw;
  color: #355753;
  background: rgba(255, 255, 255, 0.62);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.ppt-effectsThumb.is-active {
  border-color: #ee764d;
  background: rgba(238, 118, 77, 0.07);
  box-shadow: inset 0 0 0 0.08cqw rgba(238, 118, 77, 0.18);
}

.ppt-effectsThumb img {
  width: 3.2cqw;
  height: 3.2cqw;
  display: block;
  object-fit: cover;
  object-position: center top;
  border-radius: 0.4cqw;
}

.ppt-effectsThumb > span {
  min-width: 0;
  display: grid;
  gap: 0.12cqw;
}

.ppt-effectsThumb b,
.ppt-effectsThumb small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppt-effectsThumb b {
  color: #12312f;
  font-size: 0.76cqw;
  font-weight: 820;
}

.ppt-effectsThumb small {
  color: #718580;
  font-size: 0.62cqw;
  font-weight: 650;
}

.ppt-imageViewer {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 3vh 3vw;
  background: rgba(7, 25, 26, 0.9);
  backdrop-filter: blur(10px);
}

.ppt-imageViewerPanel {
  width: min(1120px, 94vw);
  height: 94vh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: #f8f5eb;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.4);
}

.ppt-imageViewerPanel > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(18, 49, 47, 0.12);
  background: #fff;
}

.ppt-imageViewerPanel > header > div {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.ppt-imageViewerPanel > header span,
.ppt-imageViewerPanel > header small {
  color: #718580;
  font-size: 13px;
  font-weight: 650;
}

.ppt-imageViewerPanel > header strong {
  color: #12312f;
  font-size: 18px;
  font-weight: 850;
}

.ppt-imageViewerPanel > header button {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: #12312f;
  font: inherit;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.ppt-imageViewerScroll {
  min-height: 0;
  overflow: auto;
  padding: 28px;
  overscroll-behavior: contain;
  background:
    radial-gradient(circle at 50% 0, rgba(20, 92, 83, 0.08), transparent 40%),
    #ecefe8;
}

.ppt-imageViewerScroll img {
  width: min(760px, 100%);
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 18px 50px rgba(18, 49, 47, 0.16);
}

.ppt-imageViewerPanel > footer {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 12px 18px;
  border-top: 1px solid rgba(18, 49, 47, 0.12);
  color: #58726e;
  background: #fff;
  font-size: 13px;
  font-weight: 680;
  text-align: center;
}

.ppt-imageViewerPanel > footer button {
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid rgba(18, 49, 47, 0.18);
  border-radius: 8px;
  color: #12312f;
  background: #fff;
  font: inherit;
  font-weight: 760;
  cursor: pointer;
}

.ppt-imageViewerPanel > footer button:hover {
  color: #fff;
  border-color: #12312f;
  background: #12312f;
}

.ppt-navZone {
  position: fixed;
  z-index: 10;
  top: 0;
  bottom: 0;
  width: 16%;
  display: flex;
  align-items: center;
  padding: 0 2.2cqw;
  border: 0;
  color: #12312f;
  background: transparent;
  cursor: pointer;
}

.ppt-navZone--previous {
  left: 0;
  justify-content: flex-start;
}

.ppt-navZone--next {
  right: 0;
  justify-content: flex-end;
}

.ppt-navArrow {
  width: 3.4cqw;
  height: 3.4cqw;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0.1cqw solid #ee764d;
  border-radius: 50%;
  background: rgba(248, 245, 235, 0.94);
  font-size: 1.75cqw;
  line-height: 1;
  opacity: 0;
  transition: opacity 160ms ease;
}

.ppt-navZone:hover .ppt-navArrow,
.ppt-navZone:focus-visible .ppt-navArrow {
  opacity: 1;
  color: #f8f5eb;
  border-color: #12312f;
  background: #12312f;
}

.ppt-navZone:focus-visible {
  outline: 0;
}

.ppt-showcase-page.is-effects-gallery-slide .ppt-navZone {
  width: 4.8cqw;
  padding-inline: 0.7cqw;
}

@media (hover: none) {
  .ppt-navArrow {
    opacity: 0.72;
  }
}
</style>
