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
	var nowStamp = Date.parse(new Date())
	//先统计出来一天有多少毫秒
	var day = 24 * 60 * 60 * 1000
	var dayAgoStamp = nowStamp - day

	var dayAgo = new Date(dayAgoStamp)


	return db.collection('t_post_like').aggregate().match({
		createdAt: _.lt(now),
		createdAt: _.gt(dayAgo)
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