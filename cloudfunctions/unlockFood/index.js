// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	var _openid = cloud.getWXContext().OPENID

	db.collection('t_user').where({
		_openid
	}).update({
		data:{
			rollCount: event.rollCount,
			unlockFoods: event.unlockFoods
		}
	})
}