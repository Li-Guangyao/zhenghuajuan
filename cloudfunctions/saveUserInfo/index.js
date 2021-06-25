// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 检查这个用户是否已经存在了
async function judgeUserExist(openId) {
	return db.collection('t_user').where({
		_openid: openId
	}).count().then(res=>{
		if(res.total == 0){
			return false
		}else{
			return true
		}
	})
}

// 云函数入口函数
exports.main = async (event, context) => {

	const wxContext = cloud.getWXContext()

	if(! await judgeUserExist(wxContext.OPENID)){
		return db.collection('t_user').add({
			data: {
				_openid: wxContext.OPENID,
				avatarUrl: event.userInfo.avatarUrl,
				country: event.userInfo.country,
				province: event.userInfo.province,
				city: event.userInfo.city,
				gender: event.userInfo.gender,
				language: event.userInfo.language,
				nickName: event.userInfo.nickName
			}
		})
	}else{
		return db.collection('t_user').where({
			_openid: wxContext.OPENID
		}).update({
			data:{
				avatarUrl: event.userInfo.avatarUrl,
				country: event.userInfo.country,
				province: event.userInfo.province,
				city: event.userInfo.city,
				gender: event.userInfo.gender,
				language: event.userInfo.language,
				nickName: event.userInfo.nickName
			}
		})
	}

}