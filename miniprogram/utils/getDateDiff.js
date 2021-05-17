import YMD from "./YMD"

// 接收一个时间戳，返回这个时间戳距离现在的时间长短
// 如果天数>30, 直接调用YMD返回日期
// 如果天数在30天内，算出差了几天
// 如果在24小时内，算出差了几个小时
// 如果在1小时内，算出差了多少分钟
// 如果在1分钟内，返回“刚刚”
export default function getDateDiff(date) {
	var dateTimeStamp = Date.parse(date)

	var result = ''
	var minute = 1000 * 60
	var hour = minute * 60
	var day = hour * 24
	var month = day * 30
	var now = new Date().getTime()
	var diffValue = now - dateTimeStamp
	if (diffValue < 0) return

	var monthC = diffValue / month
	var weekC = diffValue / (7 * day)
	var dayC = diffValue / day
	var hourC = diffValue / hour
	var minC = diffValue / minute

	if (monthC >= 1) {
		// result = "" + parseInt(monthC) + "月前"
		result = YMD(dateTimeStamp)
	// } else if (weekC >= 1) {
	// 	// result = "" + parseInt(weekC) + "周前"
	// 	result = YMD(dateTimeStamp)
	} else if (dayC >= 1) {
		result = "" + parseInt(dayC) + "天前"
	} else if (hourC >= 1) {
		result = "" + parseInt(hourC) + "小时前"
	} else if (minC >= 1) {
		result = "" + parseInt(minC) + "分钟前"
	} else {
		result = "刚刚"
	}
	return result
}