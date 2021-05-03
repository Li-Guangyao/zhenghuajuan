// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 统计前一天的卷王名单
exports.main = async (event, context) => {
	var now = new Date()
	var nowStamp = Date.parse(new Date())
	//先统计出来一天有多少毫秒
	var day = 24 * 60 * 60 * 1000
	var dayAgoStamp = now - day

	var dayAgo = new Date(dayAgoStamp)


	return db.collection('t_post_like').aggregate().match({
		createdAt: _.in([dayAgo, now])
	}).group({
		_id: '$postAuthor_openid',
		totalValue: $.sum('$value')
	}).end()

}