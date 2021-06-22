// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function saveResult(result, now) {
	db.collection('t_rank_day').add({
		data: {
			dayRankList: result,
			createdAt: now
		}
	})
}

// 统计前一天的卷王名单
exports.main = async (event, context) => {
	var now = new Date()

	var day = now.getDay()
	var month = now.getMonth();
	var year = now.getFullYear();

	var dayStart = new Date(year, month, day);
	var dayEnd = new Date(year, month, day + 1);

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
		saveResult(res.list, now)
	})

}