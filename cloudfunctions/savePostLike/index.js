// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	db.collection('t_post_like').add({
		data:{
			_openid: event.userInfo.openId,
			postAuthor_openid: event.postAuthorOpenId,
			postId: event.postId,
			value: event.value,
			valueIndex: event.valueIndex,
			createdAt: new Date()
		}
	})

}