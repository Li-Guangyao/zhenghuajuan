import CFM from '../coreModule/cloudFuncManager'
import UserManager from '../userModule/userManager'
import Notice from './notice'
import MathUtils from '../../utils/mathUtils'

function NoticeManager() {
	throw new Error('This is a static class');
}

// 云函数名称
NoticeManager.CF = {
	Notice: 'notice'
}
NoticeManager.notices = [];

/**
 * 刷新数据
 */
NoticeManager.refreshData = function() {
	this.notices.forEach(n => n.refresh());
}

/**
 * 加载通知
 */
NoticeManager.load = async function() {
	var res = await CFM.call(this.CF.Notice, 'get');
	return this.notices = this._processNotices(res);
}
NoticeManager._processNotices = function(notices) {
	return notices.map(f => new Notice(f));
}

/**
 * 阅读通知
 * @param {String} noticeId 通知ID
 */
NoticeManager.read = async function(noticeId) {
	var userInfo = await UserManager.judgeLogin();
	var userData = userInfo.data;

	if (userData.readNotices.includes(noticeId))
		return; // 已经阅读过了

	userData.readNotices.push(noticeId);
	CFM.call(this.CF.Notice, "read", {noticeId})
	this.refreshData();
}

export default NoticeManager;