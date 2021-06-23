// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function updateResult(result, now, start, end) {
	db.collection('t_rank_tmp')
		.where({ type: "day" }).remove()
		.then(_ => addResult(result, now, start, end))
		.catch(_ => addResult(result, now, start, end))
}

function addResult(result, now, start, end) {
	db.collection('t_rank_tmp').add({
		data: {
			type: "day",
			dayRankList: result,
			createdAt: now,
			start, end
		}
	})	
}

// 统计前一天的卷王名单
exports.main = async (event, context) => {
	var now = new Date()

	var timeZone = 8;

	var date = now.getDate()
	var month = now.getMonth();
	var year = now.getFullYear();

	var dayStart = new Date(
		year, month, date, -timeZone, 0, 0);
	var dayEnd = new Date(
		year, month, date + 1, -timeZone, 0, 0);

	return db.collection('t_post_like').aggregate().match({
		createdAt: _.lt(dayEnd),
		createdAt: _.gt(dayStart)
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
		updateResult(res.list, now, dayStart, dayEnd)
	})

}