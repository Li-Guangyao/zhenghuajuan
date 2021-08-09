// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function updateResult(result, now, start, end) {
	db.collection('t_rank_tmp')
		.where({
			type: "month"
		}).remove()
		.then(_ => addResult(result, now, start, end))
		.catch(_ => addResult(result, now, start, end))
}

function addResult(result, now, start, end) {
	db.collection('t_rank_tmp').add({
		data: {
			type: "month",
			rankList: result,
			createdAt: now,
			start,
			end
		}
	})
}

// 统计本月的卷王名单
exports.main = async (event, context) => {

	var now = new Date()

	var date = now.getDate();
	var month = now.getMonth();
	var year = now.getFullYear();
	var hour = now.getHours();
	var minute = now.getMinutes();

	var monthStart = new Date(year, month, 1, 0, 0, 0);
	var monthEnd = new Date(year, month, date, hour, minute, 0);

	return db.collection('t_post_like').aggregate().match({
		createdAt: _.lt(monthEnd),
		createdAt: _.gt(monthStart)
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
		updateResult(res.list, now, monthStart, monthEnd)
	})
}