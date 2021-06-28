// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function updateResult(result, now, start, end) {
	db.collection('t_rank_tmp')
		.where({ type: "week" }).remove()
		.then(_ => addResult(result, now, start, end))
		.catch(_ => addResult(result, now, start, end))
}

function addResult(result, now, start, end) {
	db.collection('t_rank_tmp').add({
		data: {
			type: "week",
			weekRankList: result,
			createdAt: now,
			start, end
		}
	})	
}

// 统计本周的卷王名单
exports.main = async (event, context) => {
	var now = new Date()

	var timeZone = 8;

	var date = now.getDate();
	var month = now.getMonth();
	var year = now.getFullYear();
	var day = now.getDay(); // 星期

	var hour = now.getHours();
	if (hour + timeZone >= 24) {
		date += 1; day = day + 1 % 7;
	}
	if (day == 0) day = 7;

	var sDate = date - day + 1;
	var eDate = sDate + 7;

	var weekStart = new Date(
		year, month, sDate, -timeZone, 0, 0);
	var weekEnd = new Date(
		year, month, eDate, -timeZone, 0, 0);

	//先统计出来一周有多少毫秒
	// var week = 7 * 24 * 60 * 60 * 1000
	// var endStamp = nowStamp - week

	// var end = new Date(endStamp)
	
	return db.collection('t_post_like').aggregate().match({
		createdAt: _.lt(weekEnd),
		createdAt: _.gt(weekStart)
	}).group({
		_id: '$postAuthor_openid',
		totalValue: $.sum('$value')
	}).sort({
		totalValue: -1
	}).project({
		_id: 1,
		totalValue: 1
	}).lookup({
		from: 't_user',
		localField: '_id',
		foreignField: '_openid',
		as: 'userInfo'
	}).replaceRoot({
		newRoot: $.mergeObjects([$.arrayElemAt(['$userInfo', 0]), '$$ROOT'])
	}).project({
		userInfo: 0
	}).end().then(res => {
		updateResult(res.list, now, weekStart, weekEnd)
	})
}