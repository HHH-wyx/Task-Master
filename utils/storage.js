function get(key, defaultValue) {
  try {
    const v = wx.getStorageSync(key)
    if (v === '' || v === undefined || v === null) return defaultValue
    return v
  } catch (e) {
    return defaultValue
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    return false
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    return false
  }
}

module.exports = {
  get,
  set,
  remove
}
