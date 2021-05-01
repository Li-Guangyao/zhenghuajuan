// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()

	return db.collection('t_user').where({
		_openid: wxContext.OPENID
	}).count().then(res => {
		if (res.total == 0) {
			return false
		} else {
			return true
		}
	})

}