// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {

	return db.collection('t_post_comment').aggregate().match({
		postId: event.postId
	}).sort({
		createdAt: -1
	}).lookup({
		from: 't_user',
		localField: '_openid',
		foreignField: '_openid',
		as: 'userInfo'
	}).replaceRoot({
		newRoot: $.mergeObjects([$.arrayElemAt(['$userInfo', 0]), '$$ROOT'])
	}).project({
		userInfo: 0,
	}).end().then(res => {
		return res.list
	})
}