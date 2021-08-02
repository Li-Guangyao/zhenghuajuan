// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

	const wxContext = cloud.getWXContext()

	var userInfo = {
		_openid: wxContext.OPENID, ...event.userInfo,
		// avatarUrl: event.userInfo.avatarUrl,
		// country: event.userInfo.country,
		// province: event.userInfo.province,
		// city: event.userInfo.city,
		// gender: event.userInfo.gender,
		// language: event.userInfo.language,
		// nickName: event.userInfo.nickName,		
	}

	userInfo.displayName = getDisplayNickName(userInfo.nickName)

	if (!await judgeUserExist(wxContext.OPENID)){
		db.collection('t_user').add({
			data: {
				...userInfo,
				// 额外数据（默认值）
				shopName: "自习早餐店",
				lastEditTime: null, // 上次修改时间
				unlockFoods: ["cd045e756105f4e2018e3f8300be0e06"],
				unlockTools: ["8937eaa96105f5660145d4605ce77780"],	
				rollCount: 0,	
			}
		})
	} else{
		db.collection('t_user').where({
			_openid: wxContext.OPENID
		}).update({ data: userInfo })
	}

	return userInfo;
}

// 检查这个用户是否已经存在了
async function judgeUserExist(openId) {
	return (await db.collection('t_user').where({
		_openid: openId
	}).count()).total == 0;
	// .then(res=>{
	// 	if(res.total == 0){
	// 		return false
	// 	}else{
	// 		return true
	// 	}
	// })
}

function getDisplayNickName(nickName) {
	const maxLen = 10;
	if (nickName.length <= maxLen) return nickName; 
	return nickName.substr(0, maxLen - 1) + "..."
}