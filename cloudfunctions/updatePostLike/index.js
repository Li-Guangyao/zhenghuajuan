// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
	db.collection('t_post_like').where({
			_openid: event.userInfo.openId,
			postId: event.postId,
	}).update({
		data:{
			value: event.value,
			valueIndex: event.valueIndex,
		}
	})

	db.collection('t_post').doc(event.postId).update({
		data:{
			likeValue: _.inc(event.value),
			likeValue: _.inc(-event.originValue)
		}
	})
}