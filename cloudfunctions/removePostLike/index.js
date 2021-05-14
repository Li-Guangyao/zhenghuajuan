// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
	var likeValue = -event.originValue

	db.collection('t_post').doc(event.postId).update({
		data: {
			likeValue: _.inc(likeValue)
		}
	})

	db.collection('t_post_like').where({
		_openid: event.userInfo.openId,
		postId: event.postId,
	}).remove()

}