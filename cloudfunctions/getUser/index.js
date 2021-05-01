const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	var openId = event.userInfo.openId
	var userInfo = null

	await db.collection('t_user').where({
		_openid: openId
	}).get().then(res=>{
		userInfo = res.data[0]
	})

	return userInfo

}