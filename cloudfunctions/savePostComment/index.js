// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	var userAvatar = null
	var userNickname = null

	await db.collection('t_user').where({
		_openid: event.userInfo.openId
	}).get().then(res => {
		userAvatar = res.data[0].avatarUrl
		userNickname = res.data[0].nickName
	})

	return db.collection('t_post_comment').add({
		data: {
			_openid: event.userInfo.openId,
			postId: event.postId,
			avatar: userAvatar,
			nickname: userNickname,
			content: event.comment,
			createdAt: new Date()
		}
	})

}