var userUtils = {}

userUtils.Key = "userInfo";

/**
 * 获取用户信息
 */
userUtils.getUserInfo = async function() {
	var res = await wx.cloud.callFunction({name: 'getUser'});
	wx.setStorageSync('userInfo', res.result)
	return res.result;
}

/**
 * 登陆
 * @param {强制登陆} force 
 * @param {登陆描述} desc 
 */
userUtils.login = async function(force, desc) {
	var res = wx.getStorageSync(userUtils.Key)
	if (force || !res) {
		desc ||= "获取用户信息";
		var profile = await wx.getUserProfile({desc});
		res = (await wx.cloud.callFunction({
			name: 'userInfo',
			data: { userInfo: profile.userInfo },
		})).result.userInfo
		
		console.log(res)
		wx.setStorageSync(userUtils.Key, res)
	}
	return res;
}

/**
 * 判断是否登陆
 * @param {提示标题} title 
 * @param {确认回调} onConfirm 
 * @param {取消回调} onCancel 
 */
userUtils.judgeLogin = async function(title, onConfirm, onCancel) {
	var userInfo = wx.getStorageSync(userUtils.Key)
	if (!userInfo) {
		title ||= "卷王同志，请先登陆再来";
		onConfirm ||= () => wx.switchTab({url: '../my/my'});
		onCancel ||= () => wx.navigateBack({ delta: 1 });

		var response = await wx.showModal({ title, showCancel: true});
		if (response.confirm) onConfirm();
		else if (response.cancel) onCancel();
	}

	return userInfo;
}

export { userUtils };