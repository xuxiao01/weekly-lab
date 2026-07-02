import type { WeeklyReportWeek } from '../weeklyReports'

export const reportWeek2026W27: WeeklyReportWeek = {
  id: '2026-W27',
  weekLabel: '第 27 周',
  dateRange: '2026.06.29 - 2026.07.03',
  shortDateRange: '06.29 - 07.03',
  reports: [
    {
      id: 1,
      weekLabel: '第 27 周',
      dateRange: '2026.06.29 - 2026.07.03',
      shortDateRange: '06.29 - 07.03',
      partLabel: '第一部分',
      title: '小墨作文小游戏开发',
      completed: [
        {
          title: '翻翻卡点题目太难，由原先的 4*4，统一改为 3*2，3 组词语',
          description: '',
          images: [
            'https://typorabucket0308.oss-cn-beijing.aliyuncs.com/images/20260703002424735.png',
          ],
        },
        {
          title:
            '关卡的截断设计，每一小关设置轻提示或者不设置，每一个大关结束会有一个完成了几关的弹窗；如果这个大关是 5 或者 5 的倍数，出现一个进度弹窗',
          description: '',
          images: [
            'https://typorabucket0308.oss-cn-beijing.aliyuncs.com/images/20260703003640674.png',
            'https://typorabucket0308.oss-cn-beijing.aliyuncs.com/images/20260703003724997.png',
            'https://typorabucket0308.oss-cn-beijing.aliyuncs.com/images/20260703003813944.png',
          ],
        },
        {
          title:
            '组词消消乐，重新找了大词表，提取了判题数据，由原先的 1 万 8 千多个两字词改为 3 万 9 千多判断兜底',
          description: '',
        },
        {
          title: 'AB 实验与埋点，AB 实验是有无小游戏，埋点是小游戏点击率',
          description: '',
        },
        {
          title: '一些真机测试的 bug（TTS 触发时机，关卡页数字较小等）',
          description: '',
        },
      ],
      nextPlans: [
        {
          title:
            '句子拼拼乐，难度没有递进，句子可能过短、太简单，需要优化句子库',
          description: '',
        },
        {
          title: '上周提到的小程序的修改',
          description: '',
        },
      ],
    },
  ],
}
