// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

	return db.collection('t_post').add({
		data:{
			_openid: event.userInfo.openId,
			avatarUrl: event.avatarUrl,
			nickname: event.nickname,

			content: event.content,
			location: event.location,
			photoList: event.photoList,
			created_at: Date()
		}
	})
}