// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {

	// db.collection('t_post').doc(event.postId).update({
	// 	data: {
	// 		likeValue: _.inc(likeValue)
	// 	}
	// })

	await db.collection('t_post_like').where({
		_openid: event.userInfo.openId,
		postId: event.postId,
	}).remove()

	// 更新
	var res = await db.collection('t_post_like').aggregate()
		.match({postId: event.postId})
		.group({
			_id: event.postId,
			likeValue: $.sum('$value')
		})
		.end()
	
	db.collection('t_post').doc(event.postId).update({
		data: {
			likeValue: res.list[0] ? 
				res.list[0].likeValue : 0
		}
	})

	return res.list[0].likeValue
}