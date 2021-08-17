// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();

	var method = event.method;
	var type = event.type;
	var startTime = event.startTime;
	var endTime = event.endTime;
	var openid = event.openid || wxContext.OPENID;

	switch (method.toUpperCase()) {
		case "ADD":
			addShare(openid, type);
			break;
		case "QUERY":
			return await queryShare(openid, type, startTime, endTime);
		case "TODAY":
			var startTime = new Date();
			startTime.setHours(0, 0, 0);
			var endTime = new Date();
			endTime.setHours(23, 59, 59);
			return await queryShare(openid, type, startTime, endTime);
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

async function queryShare(openid, type, startTime, endTime) {
	var matcher = {
		_openid: openid,
		type,
		createdAt: _.and(_.lte(endTime), _.gte(startTime))
	}
	return (await db.collection('t_share').where(matcher).get()).data;
}