const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
	var openId = cloud.getWXContext().OPENID

	var userInfo = {
		_openid: openId, 
		...event.userInfo,
	}

	userInfo.displayName = getDisplayNickName(userInfo.nickName)

	if (!await judgeUserExist(openId)){
		Object.assign(userInfo, {
			// 额外数据（默认值）
			shopName: "破旧的小店",
			lastEditTime: null, // 上次修改时间
			unlockFoods: ["cd045e756105f4e2018e3f8300be0e06"],
			unlockTools: ["8937eaa96105f5660145d4605ce77780"],	
			rollCount: 0,	
		})
		db.collection('t_user').add({
			data: {
				...userInfo,
			}
		})
		return userInfo
	} else{
		var data = (await db.collection('t_user').where({
			_openid: openId
		}).get()).data[0]

		Object.assign(data, userInfo)
		delete data['_id']

		db.collection('t_user').where({
			_openid: openId
		}).update({ data })

		return {userInfo: data}
	}
}

// 检查这个用户是否已经存在了
// 存在返回true，不存在返回fasle
async function judgeUserExist(openId) {
	return (await db.collection('t_user').where({
		_openid: openId
	}).count()).total != 0;
}

function getDisplayNickName(nickName) {
	const maxLen = 10;
	if (nickName.length <= maxLen) return nickName; 
	return nickName.substr(0, maxLen - 1) + "..."
}