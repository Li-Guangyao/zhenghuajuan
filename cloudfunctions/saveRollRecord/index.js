// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 保存蒸花卷的记录
exports.main = async (event, context) => {

	// 用户蒸花卷保存在Post中，这里相当于系统给这个帖子点了多少赞
	await db.collection('t_post_like').add({
		data: {
			_openid: "system_roll",
			postAuthor_openid: event.postAuthorOpenId,
			postId: event.postId,
			value: parseInt(event.count),
			valueIndex: parseInt(event.duration),
			createdAt: new Date()
		}
	})

	// 更新
	var res = await db.collection('t_post_like').aggregate()
		.match({
			postId: event.postId
		})
		.group({
			_id: event.postId,
			likeValue: $.sum('$value')
		})
		.end()

	await db.collection('t_post').doc(event.postId).update({
		data: {
			likeValue: res.list[0].likeValue
		}
	})

	return res.list[0].likeValue
}