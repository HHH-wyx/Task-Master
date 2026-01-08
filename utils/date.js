function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatYMD(timestampMs) {
  const d = new Date(timestampMs)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function todayYMD() {
  return formatYMD(Date.now())
}

function isOverdue(ymd) {
  if (!ymd) return false
  const today = todayYMD()
  return ymd < today
}

function isToday(ymd) {
  if (!ymd) return false
  return ymd === todayYMD()
}

module.exports = {
  formatYMD,
  todayYMD,
  isOverdue,
  isToday
}
