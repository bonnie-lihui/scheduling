import dayjs from 'dayjs'
Page({
  data: {
    // 更换指定日期
    show: false,

    // 上次上班日期
    lastWorkingDay: dayjs().format('YYYY-MM-DD'),

    // 排班周期
    minDate: dayjs().subtract(5, 'day').startOf('day').valueOf(),
    maxDate: dayjs().add(3, 'months').valueOf(), // 增加3个月作为最大日期
    selectedRanges: [
      //  { start: '2025-10-01', end: '2025-10-02' }
    ],
    formatter: null
  },

  /**
   * 计算上班、下班日期 周期
   */
  calculationPeriod() {
    const {
      lastWorkingDay
    } = this.data;
    const cycles = 35; // 计算未来30个周期
    const selectedRanges = [];

    let currentStart = dayjs(lastWorkingDay); // 第一个周期开始

    for (let i = 0; i < cycles; i++) {
      // 每个周期：start（夜班） + end（白班），连续两天
      const start = dayjs(currentStart).format('YYYY-MM-DD');
      const end = currentStart.add(1, 'day').format('YYYY-MM-DD');

      selectedRanges.push({
        start,
        end
      });

      // 例如：17(夜)、18(白) → 19、20、21(休) → 22(夜)、23(白)
      currentStart = currentStart.add(3, 'day');
    }
    this.setData({
      selectedRanges,
    });
  },

  /**
   * 设置一些内容
   */
  setFormatter() {
    this.setData({
      formatter: (day) => {
        const date = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;

        const isStart = this.data.selectedRanges.some(range => range.start === date);
        const isEnd = this.data.selectedRanges.some(range => range.end === date);

        // 判断是否在任意一个入住区间内（含 start 和 end）
        const isInRange = this.data.selectedRanges.some(range =>
          new Date(range.start) <= new Date(date) && new Date(date) <= new Date(range.end)
        );

        // 设置底部文字
        if (isStart) {
          day.bottomInfo = '上班';
        } else if (isEnd) {
          day.bottomInfo = '下班';
        }

        // 添加类名用于自定义样式
        if (isStart) {
          day.className = 'check-in-day'; // 入住日
        } else if (isEnd) {
          day.className = 'check-out-day'; // 离店日
        } else if (isInRange) {
          day.className = 'in-stay-range'; // 居住中
        }
        return day;
      }
    });
  },

  /**
   * 切换展示状态
   */
  onSwitchStatus() {
    console.log('clsssss')
    this.setData({
      show: !this.data.show
    })
  },
  onConfirm(event) {
    let _dateTxt = dayjs(event.detail).format('YYYY-MM-DD')
    console.log(' 选择的日期', _dateTxt)
    this.setData({
      lastWorkingDay: _dateTxt,
      show: false
    }, () => {
      this.calculationPeriod()
      this.setFormatter()
    })
  },


  onLoad() {
    this.calculationPeriod()
    this.setFormatter()
  }
});