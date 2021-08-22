import UserManager from "../userModule/userManager";

function Notice() {
	this.initialize.apply(this, arguments);
}

Notice.prototype.initialize = function(data) {

	this.data = {
		_id: null, // 公告ID
		title: '', // 公告标题
		content: '', // 公告内容

		createdAt: null, // 发布时间
		startAt: null, // 开始时间（毫秒数）
		endAt: null, // 过期时间（毫秒数）
	}
	Object.assign(this.data, data);

	this.isRead = false;

	this.refresh();
};

/**
 * 是否已阅读
 */
Notice.prototype.judgeRead = function() {
	var userInfo = UserManager.userInfo;
	if (!userInfo) return false;

	var now = Date.now();
	if (now < this.data.startAt || now > this.data.endAt) return true;

	return userInfo.data.readNotices.includes(this.data._id);
}

/**
 * 刷新
 */
Notice.prototype.refresh = function() {
	this.isRead = this.judgeRead();
}

export default Notice;