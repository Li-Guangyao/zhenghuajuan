var DateUtils = {}

DateUtils._curTimeRanges = null;
DateUtils._lastTimeRanges = null;

DateUtils.getTimeRages = function() {
	var now = new Date();

	if (this._curTimeRanges == null || !this._lastTimeRanges ||
		this._lastTimeRanges.getDate() != now.getDate() ) {
		this._lastTimeRanges = now;

		var date = now.getDate(),
			day = now.getDay() || 7, // 星期数（if (day == 0) day = 7）
			month = now.getMonth(),
			year = now.getFullYear();
	
		var dayStart = new Date(year, month, date);
		var dayEnd = new Date(year, month, date + 1);
	
		var weekStart = new Date(year, month, date - day + 1);
		var weekEnd = new Date(year, month, date - day + 8);
	
		var monthStart = new Date(year, month, 1);
		var monthEnd = new Date(year, month + 1, 0);
	
		var yearStart = new Date(year, 0, 1);
		var yearEnd = new Date(year + 1, 0, 0);
	
		this._curTimeRanges = [
			[dayStart, dayEnd],
			[weekStart, weekEnd],
			[monthStart, monthEnd],
			[yearStart, yearEnd]
		];
	}
	return this._curTimeRanges;
}

/**
 * 接收一个时间戳，返回这个时间戳距离现在的时间长短
 * 如果天数>30, 直接调用YMD返回日期
 * 如果天数在30天内，算出差了几天
 * 如果在24小时内，算出差了几个小时
 * 如果在1小时内，算出差了多少分钟
 * 如果在1分钟内，返回“刚刚”
 * @param {String | Number | Date} date 原始时间
 */
DateUtils.getDateOff = (date) => {
	if (typeof(date) == 'string') date = Date.parse(date);
	if (date instanceof Date) date = date.getTime(); 

	var result = '';
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = now - date;
	if (diffValue < 0) return;

	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;

	if (monthC >= 1) {
		// result = "" + parseInt(monthC) + "月前"
		result = DateUtils.date2YMD(date);
	// } else if (weekC >= 1) {
	// 	// result = "" + parseInt(weekC) + "周前"
	// 	result = DateUtils.date2YMD(date)
	} else if (dayC >= 1) {
		result = "" + parseInt(dayC) + "天前";
	} else if (hourC >= 1) {
		result = "" + parseInt(hourC) + "小时前";
	} else if (minC >= 1) {
		result = "" + parseInt(minC) + "分钟前";
	} else {
		result = "刚刚"
	}
	return result
}

/**
 * 转化为YMD格式
 * @param {Date | Number} date 日期
 */
DateUtils.date2YMD = function(date) {
	if (typeof(date) == 'number') date = new Date(date);

	var y = date.getFullYear();	
	var m = date.getMonth() + 1 + '';
	var d = date.getDate() + '';

	m = m.padStart(2, 0);
	d = d.padStart(2, 0);

	return y + "-" + m + "-" + d;

	/*
	var Y = date.getFullYear() + '-';
	var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
	var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());

	// var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
	// var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ' ';
	return Y + M + D;
	*/
}

/**
 * 转化为年月日格式
 * @param {Date | Number} date 日期
 */
DateUtils.date2YMDChi = function(date) {
	if (typeof(date) == 'number') date = new Date(date);

	var y = date.getFullYear();	
	var m = date.getMonth() + 1;
	var d = date.getDate();

	return y + "年" + m + "月" + d + "日";
}

/**
 * 转化为年月日格式
 * @param {Date | Number} date 日期
 */
DateUtils.date2MDHM = function(date) {
	if (typeof(date) == 'number') date = new Date(date);

	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours() + '';
	var min = date.getMinutes() + '';

	h = h.padStart(2, 0);
	min = min.padStart(2, 0);

	return m + "月" + d + "日 " + h + ":" + min;
}

export default DateUtils;