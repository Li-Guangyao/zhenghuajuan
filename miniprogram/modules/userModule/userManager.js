
import NavigateUtils from '../../utils/navigateUtils';
import CFM from '../coreModule/cloudFuncManager'
import FoodManager from '../foodModule/foodManager';
import UserInfo from './userInfo'

function UserManager() {
	throw new Error('This is a static class');
}

// 云函数名称
UserManager.CF = {
	UserInfo: 'userInfo',
	UserStat: 'userStat'
}
UserManager.StroageKey = 'userInfo'
UserManager.LoginPage = '../my/my'

// 用户数据缓存
UserManager.userCache = {}

// 当前用户
UserManager.userInfo = null;

/**
 * 获取单个用户数据
 * @param {String} openid 用户Openid
 */
UserManager.get = async function(userOpenid) {
	if (userOpenid == this.userInfo.data._openid) 
		return this.userInfo.data;
		
	var res = this.userCache[userOpenid] ||= 
		await CFM.call(this.CF.UserInfo, 
			'get_basic', { userOpenid })
	return res;
}

/**
 * 设置用户信息（内部调用）
 */
UserManager._setUserInfo = function(data) {
	this._resetData(); // 重置相关数据
	wx.setStorage({key: this.StroageKey, data})
	return this.userInfo = new UserInfo(data);
}
UserManager._resetData = function() {
	FoodManager.foods = null;
}

/**
 * 登陆
 * @param {Boolean} force 强制登陆（刷新微信信息）
 * @param {String} desc 用途说明文本
 */
UserManager.login = async function(force, desc) {
	if (force || !this.userInfo) {
		desc ||= "获取用户信息";
		var profile = await wx.getUserProfile({desc});
		var res = await CFM.call(this.CF.UserInfo, 'save', 
				{ userInfo: profile.userInfo })
		console.log("login: ", res);

		this._setUserInfo(res.userInfo);
	}
	return this.userInfo
}

/**
 * 判断是否登陆
 * @param {String} title 提示文本
 * @param {Function} onConfirm 确认回调
 * @param {Function} onCancel 取消回调
 */
UserManager.judgeLogin = async function(
	refresh, title, onConfirm, onCancel) {
	if (!this.userInfo) {
		title ||= "卷王同志，请先登陆再来";
		onConfirm ||= () => NavigateUtils.goto(this.LoginPage);
		onCancel ||= () => NavigateUtils.pop();

		var response = await wx.showModal({ title, showCancel: true});
		if (response.confirm) onConfirm();
		else if (response.cancel) onCancel();

		throw new Error("未登录！该报错是为了中断后续程序运行，并非程序出错！")
	} else if (refresh) await this.refresh();

	return this.userInfo;
}

/**
 * 刷新用户信息
 */
UserManager.refresh = async function() {
	var data = await CFM.call(this.CF.UserInfo, 'get')
	return this._setUserInfo(data);
}

/**
 * 获取今日数据
 */
UserManager.getTodayData = async function() {
	return await CFM.call(this.CF.UserStat, "today");
}

/**
 * 获取累计数据
 */
UserManager.getTotalData = async function() {
	return await CFM.call(this.CF.UserStat, "total");
}

export default UserManager;