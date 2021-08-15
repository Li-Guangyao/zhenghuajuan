// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 保存蒸花卷的记录
exports.main = async (event, context) => {

	var queryPost = db.collection('t_post').doc(event.postId);
	var queryUser = db.collection('t_user').where({
		_openid: event.postAuthorOpenId,
	})

	var value = parseInt(event.count); 
	var valueIndex = parseInt(event.duration); 

	// 用户蒸花卷保存在Post中，这里相当于系统给这个帖子点了多少赞
	await db.collection('t_post_like').add({
		data: {
			_openid: "system_roll",
			postAuthor_openid: event.postAuthorOpenId,
			postId: event.postId,
			value, valueIndex,
			createdAt: new Date()
		}
	})
	
	// 更新
	queryPost.update({
		data: { likeValue: _.inc(value) }
	})
	queryUser.update({
		data: { rollCount: _.inc(value) }
	})
}