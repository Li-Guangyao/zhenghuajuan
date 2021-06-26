// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
	var likeValue = event.value

	await db.collection('t_post_like').add({
		data:{
			_openid: event.userInfo.openId,
			postAuthor_openid: event.postAuthorOpenId,
			postId: event.postId,
			value: event.value,
			valueIndex: event.valueIndex,
			createdAt: new Date()
		}
	})

	// 更新
	var res = await db.collection('t_post_like').aggregate()
		.match({postId: event.postId})
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