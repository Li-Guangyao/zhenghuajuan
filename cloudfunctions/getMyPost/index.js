// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

	// if (event.skipNum) {
	return db.collection('t_post').aggregate().match({
		_openid: event.userInfo.openId,
	}).sort({
		createdAt: -1
	}).skip(event.skipNum).end().then(res => {
		return res.list
	})
	// } else {
	// 	return db.collection('t_post').aggregate().match({
	// 		_openid: event.userInfo.openId
	// 	}).sort({
	// 		createdAt: -1
	// 	}).end().then(res => {
	// 		return res.list
	// 	})
	// }
}