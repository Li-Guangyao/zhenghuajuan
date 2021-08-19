// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;

	// 函数参数
	var method = event.method;
	var type = event.type; // 分享类型

	switch (method.toUpperCase()) {
		case "ADD": // 添加分享
			addShare(openid, type); break;

		case "GET": // 查询任意时间段数据
			var startTime = event.startTime; // 开始时间
			var endTime = event.endTime; // 结束时间
	
			// 返回分享记录列表
			return await getShare(openid, type, startTime, endTime);

		case "GET_TODAY": // 查询当天数据
			var startTime = new Date();
			startTime.setHours(0, 0, 0);
			var endTime = new Date();
			endTime.setHours(23, 59, 59);

			// 返回分享记录列表
			return await getShare(openid, type, startTime, endTime);
	}
}

function addShare(openid, type) {
	var data = {
		_openid: openid,
		type,
		createdAt: new Date()
	}
	db.collection('t_share').add({
		data
	})
}

async function getShare(openid, type, startTime, endTime) {
	if (typeof(startTime) == 'number') startTime = new Date(startTime);
	if (typeof(endTime) == 'number') endTime = new Date(endTime);

	var matcher = {
		_openid: openid,
		type,
		createdAt: _.and(_.lte(endTime), _.gte(startTime))
	}
	return (await db.collection('t_share').where(matcher).get()).data;
}