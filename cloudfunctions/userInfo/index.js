const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;

	// 测试鉴权
	var test = event.token == TOKEN;
	if (test && event.openid) openid = event.openid;

	// 函数参数
	var method = event.method;

	// 函数主体
	switch (method.toUpperCase()) {
		case "GET": // 获取用户数据
			return await getUserInfo(openid);
		case "GET_BASIC": // 获取用户基本数据
			var userOpenid = event.userOpenid; // 要获取的用户openid

			return await getBasicUserInfo(userOpenid);
		case "SAVE": // 更新用户数据
			var userInfo = event.userInfo; // 新的用户数据（从wx官方获取的）

			return await saveUserInfo(openid, userInfo);
	}
}

queryUser = openid => db.collection('t_user').where({_openid: openid});

getUserInfo = async (openid) =>
	(await queryUser(openid).get()).data[0];

getBasicUserInfo = async (userOpenid) =>
	(await queryUser(userOpenid).field({
		_openid: true,
		nickName: true, avatarUrl: true, gender: true,
		country: true, province: true, city: true,
		language: true, displayName: true, shopName: true,
		createdAt: true, status: true
	}).get()).data[0];

saveUserInfo = async (openid, userInfo) => {
	userInfo._openid = openid;
	// nickName可能不同，每次都需要更新一下 displayName
	userInfo.displayName = getDisplayNickName(userInfo.nickName)

	var data = await getUserInfo(openid); 
	return data ? updateUserInfo(data, userInfo)
		: createUserInfo(userInfo);
}

createUserInfo = (userInfo) => {
	// 额外数据（默认值）
	var extra = {
		shopName: "破旧的小店",
		lastEditTime: null, // 上次修改时间
		unlockFoods: ["cd045e756105f4e2018e3f8300be0e06"],
		unlockTools: ["8937eaa96105f5660145d4605ce77780"],	
		rollCount: 0,	
		totalRoll: 0
	}
	Object.assign(userInfo, extra)

	db.collection('t_user').add({ data: userInfo })

	return userInfo;
}

updateUserInfo = (data, userInfo) => {
	Object.assign(data, userInfo)
	delete data['_id']

	queryUser(userInfo._openid).update({data})

	return data
}

getDisplayNickName = (nickName) => {
	const maxLen = 10;
	if (nickName.length <= maxLen) return nickName; 
	return nickName.substr(0, maxLen - 1) + "..."
}