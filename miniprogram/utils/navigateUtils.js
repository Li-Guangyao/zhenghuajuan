var navigateUtils = {}

/**
 * 进入页面
 * @param {String} page 页面地址
 * @param {Object} data 要传递的数据
 */
navigateUtils.push = function(page, data) {
	var url = this.makePageUrl(page, data);	
	console.log("navigateUtils.push: ", url)
	wx.navigateTo({ url })
}
navigateUtils.switch = function(page, data) {
	var url = this.makePageUrl(page, data);	
	console.log("navigateUtils.switch: ", url)
	wx.redirectTo({ url })
}
navigateUtils.goto = function(page, data) {
	var url = this.makePageUrl(page, data);	
	console.log("navigateUtils.switch: ", url)
	wx.reLaunch({ url })
}
navigateUtils.pop = function(delta) {
	delta ||= 1;
	wx.navigateBack({ delta })
	console.log("navigateUtils.back: ", delta)
}

navigateUtils.makePageUrl = (page, data) => {
	return data ? page + "?" + navigateUtils.makeParams(data) : page;
}
navigateUtils.makeParams = (data) => {
	var res = "";
	for (var key in data)
		res += key + "=" + data[key] + "&";
	return res;
}

export { navigateUtils }