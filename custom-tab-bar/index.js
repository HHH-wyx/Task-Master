Component({
  data: {
    selected: 0,
    list: [
      { pagePath: "/pages/home/index", text: "任务", icon: "□" },
      { pagePath: "/pages/calendar/index", text: "日历", icon: "▦" },
      { pagePath: "/pages/stats/index", text: "统计", icon: "▤" },
      { pagePath: "/pages/profile/index", text: "我的", icon: "◉" }
    ]
  },
  methods: {
    onChange(e) {
      const index = Number(e.currentTarget.dataset.index)
      const item = this.data.list[index]
      if (!item) return
      wx.switchTab({
        url: item.pagePath
      })
      this.setData({ selected: index })
    }
  }
})
