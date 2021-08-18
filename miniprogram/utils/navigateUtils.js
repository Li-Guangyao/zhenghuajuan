var NavigateUtils = {}

/**
 * 进入页面（页面栈的Push操作）
 * @param {String} page 页面地址
 * @param {Object} data 要传递的数据
 */
NavigateUtils.push = function(page, data, force) {
	if (!force && this.isCurPage(page)) return;

	var url = this._makePageUrl(page, data);	
	console.log("NavigateUtils.push: ", url)
	wx.navigateTo({ url })
}

/**
 * 改变当前页面（先Pop再Push）
 * @param {String} page 页面地址
 * @param {Object} data 要传递的数据
 */
NavigateUtils.change = function(page, data, force) {
	if (!force && this.isCurPage(page)) return;

	var url = this._makePageUrl(page, data);	
	console.log("NavigateUtils.change: ", url)
	wx.redirectTo({ url })
}

/**
 * 强制跳转页面（先Clear再Push）
 * @param {String} page 页面地址
 * @param {Object} data 要传递的数据
 */
NavigateUtils.goto = function(page, data, force) {
	if (!force && this.isCurPage(page)) return;

	var url = this._makePageUrl(page, data);	
	console.log("NavigateUtils.switch: ", url)
	wx.reLaunch({ url })
}

/**
 * 返回页面（页面栈的Pop操作）
 * @param {Number} delta 返回层数
 */
NavigateUtils.pop = function(delta) {
	delta ||= 1;
	wx.navigateBack({ delta })
	console.log("NavigateUtils.back: ", delta)
}

/**
 * 切换页面（同switchTab）
 * @param {String} page 页面地址
 * @param {Object} data 要传递的数据
 */
NavigateUtils.switch = function(page, data, force) {
	if (!force && this.isCurPage(page)) return;

	var url = this._makePageUrl(page, data);	
	console.log("NavigateUtils.switch: ", url)
	wx.switchTab({ url })
}

/**
 * 获取页面名称
 * @param {String} page 页面路径
 */
NavigateUtils.pageName = page => {
	var strs = page.split('/');
	return strs[strs.length - 1];
}

/**
 * 当前页面名称
 */
NavigateUtils.curPageName = () => {
	var page = getCurrentPages()[0];
	return NavigateUtils.pageName(page.__route__);
}

/**
 * 判断两个页面是否一致（判断名称一致）
 */
NavigateUtils.isSamePage = (page1, page2) => {
	return NavigateUtils.pageName(page1) ==
		NavigateUtils.pageName(page2);
}

/**
 * 判断是否当前页面
 */
NavigateUtils.isCurPage = (page) => {
	return NavigateUtils.pageName(page) ==
		NavigateUtils.curPageName();
}

NavigateUtils._makePageUrl = (page, data) => {
	return data ? page + "?" + NavigateUtils._makeParams(data) : page;
}
NavigateUtils._makeParams = (data) => {
	var res = "";
	for (var key in data)
		res += key + "=" + data[key] + "&";
	return res;
}

export default NavigateUtils