const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	var res = await db.collection('t_user').where({
		_openid: event.userInfo.openId
	}).get();
	return res.data[0]
}