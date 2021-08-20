import CFM from "../coreModule/cloudFuncManager"
import RollRecord from "./rollRecord"

function RollManager() {
	throw new Error('This is a static class');
}

// 云函数名称
RollManager.CF = {
	RollRecord: 'rollRecord',
	PosterSharing: 'posterSharing',
}

// 当前蒸花卷记录
RollManager.curRollRecord = null;
// 当前当天分享情况
RollManager.curSharings = null;

/**
 * 查询指定用户蒸花卷记录
 * @param {String} userOpenid 用户openid
 * @param {Number | Date} startTime 开始时间
 * @param {Number | Date} endTime 结束时间
 * @param {Object} cond 附加参数
 */
RollManager.get = async function(userOpenid, 
	startTime, endTime, cond) {
	if (startTime instanceof Date)
		startTime = startTime.getTime();
	if (endTime instanceof Date)
		endTime = endTime.getTime();
	
	var dataList = await CFM.call(this.CF.RollRecord, 
		"get", {userOpenid, startTime, endTime, cond});
		
	return this._processRollRecords(dataList);
}

/**
 * 查询我的蒸花卷记录
 * @param {Number | Date} startTime 开始时间
 * @param {Number | Date} endTime 结束时间
 * @param {Object} cond 附加参数
 */
RollManager.getMy = async function(
	startTime, endTime, cond) {
	if (startTime instanceof Date)
		startTime = startTime.getTime();
	if (endTime instanceof Date)
		endTime = endTime.getTime();
	
	var dataList = await CFM.call(this.CF.RollRecord, 
		"get_my", {startTime, endTime, cond});
		
	return this._processRollRecords(dataList);
}

// 内部调用
RollManager._processRollRecords = function(dataList) {
	return dataList.map(this._processRollRecord);
}
RollManager._processRollRecord = function(data) {
	return new RollRecord(data);
}

/**
 * 开始一个蒸花卷
 * @param {RollRecord} rollRecord 蒸花卷
 */
RollManager.start = async function(rollRecord) {
	this.curRollRecord = rollRecord;
	await this.getTodayShares();

	var data = await CFM.call(this.CF.RollRecord, 
		"start", { rollRecord: rollRecord.data }, false);
	return rollRecord.data = data;
}

/**
 * 蒸花卷失败
 */
RollManager.fail = async function() {
	await CFM.call(this.CF.RollRecord, "fail", 
		{ rollRecord: this.curRollRecord.data });
	this.terminate();
}

/**
 * 蒸花卷完成
 */
RollManager.finish = async function() {
	await CFM.call(this.CF.RollRecord, "finish", 
		{ rollRecord: this.curRollRecord.data });
	this.terminate();
}

/**
 * 获取分享记录
 * @param {'wx' | 'post'} type 分享类型
 */
RollManager.getShare = async function(type) {
	return await CFM.call(this.CF.PosterSharing, 
		"get", { type }, false)
}

/**
 * 获取当天分享记录
 * @param {'wx' | 'post'} type 分享类型
 */
RollManager.getTodayShare = async function(type) {
	return this.curSharings ? // 如果有缓存则使用缓存
		this.curSharings[type == 'wx' ? 0 : 1] :
		await CFM.call(this.CF.PosterSharing, 
			"get_today", { type }, false)
}

/**
 * 获取当天分享记录
 */
RollManager.getTodayShares = async function() {
	if (!this.curSharings) {
		var wx = await this.getTodayShare('wx');
		var post = await this.getTodayShare('post');

		this.curSharings = [wx, post];
	}
	return this.curSharings;
}

/**
 * 添加分享
 * @param {'wx' | 'post'} type 分享类型
 * @param {String} postId 分享的帖子ID
 */
RollManager.addShare = async function(type, postId) {
	var data = this.curRollRecord.data;
	var shared = await this.getTodayShare(type);
	shared = shared.length > 0;

	// 如果首次分享，奖励翻倍
	if (!shared) data.rollCount *= 2;
	if (type == 'post' && postId) data.postId = postId;
	
	// await this.finish();

	return await CFM.call(this.CF.PosterSharing, 
		"add", { type })
}

/**
 * 蒸花卷结束（完全结束）
 */
RollManager.terminate = function() {
	this.curRollRecord = null;
	this.curSharings = null;
}

export default RollManager;