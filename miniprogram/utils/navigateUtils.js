var navigateUtils = {}

/**
 * 进入页面
 * @param {String} page 页面地址
 * @param {Object} data 要传递的数据
 */
navigateUtils.push = function(page, data) {
	var url = page;
	if (data) url += "?" + this.makeParams(data);
	
	console.log("navigateUtils.push: ", url)

	wx.navigateTo({ url })
}

navigateUtils.makeParams = (data) => {
	var res = "";
	for (var key in data)
		res += key + "=" + data[key] + "&";
	return res;
}

export { navigateUtils }