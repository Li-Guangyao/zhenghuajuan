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

	switch (method.toUpperCase()) {
		case "ADD": addShare(wxContext, type); break;
		case "QUERY": return await queryShare(wxContext, type, startTime, endTime);
	}
}

function addShare(wxContext, type) {
	var data = {
		_openid: wxContext.OPENID, type, 
		createAt: new Date()
	}
	db.collection('t_share').add({ data })
}

async function queryShare(wxContext, type, startTime, endTime) {
	var matcher = {
		_openid: wxContext.OPENID, type, 
    createdAt: _.and(_.lte(endTime), _.gte(startTime))
	}
	return (await db.collection('t_share').where(matcher).get()).data;
}