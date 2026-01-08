const userService = require('./utils/userService')

App({
  globalData: {
    user: null
  },
  onLaunch() {
    if (wx.cloud && wx.cloud.init) {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true
      })
    }
    this.globalData.user = userService.getUser()
  },
  setUser(user) {
    this.globalData.user = user
    userService.setUser(user)
  },
  clearUser() {
    this.globalData.user = null
    userService.clearUser()
  }
})
