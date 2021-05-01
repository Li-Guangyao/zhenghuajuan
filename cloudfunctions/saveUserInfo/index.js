// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

	const wxContext = cloud.getWXContext()
	
	return db.collection('t_user').add({
		data:{
			_openid: wxContext.OPENID,
			avatarUrl: event.userInfo.avatarUrl,
			country:event.userInfo.country,
			province:event.userInfo.province,
			city: event.userInfo.city,
			gender:event.userInfo.gender,
			language:event.userInfo.language,
			nickName:event.userInfo.nickName
		}
	})
}