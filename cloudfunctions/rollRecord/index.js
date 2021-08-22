// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

// 云函数入口函数
exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;

	// 测试鉴权
	var test = event.token == TOKEN;
	if (test && event.openid) openid = event.openid;

	// 函数参数
	var method = event.method;

	switch (method.toUpperCase()) {
		case "GET": // 获取蒸花卷记录
			var userOpenid = event.userOpenid; // 指定用户openid
			var startTime = event.startTime; // 开始时间
			var endTime = event.endTime; // 结束时间
			var cond = event.cond; // 附加条件

			return await getRollRecords(
				userOpenid, startTime, endTime, cond);

		case "GET_MY": // 获取我的蒸花卷记录
			var startTime = event.startTime; // 开始时间
			var endTime = event.endTime; // 结束时间
			var cond = event.cond; // 附加条件

			return await getRollRecords(
				openid, startTime, endTime, cond);
	
		case "START": // 开始蒸花卷
			var rollRecord = event.rollRecord; // 蒸花卷记录实例

			// 返回保存后的蒸花卷记录ID
			return await startRollRecord(openid, rollRecord);

		case "FAIL": // 蒸花卷失败
			var rollRecord = event.rollRecord; // 蒸花卷记录实例

			failRollRecord(openid, rollRecord); break;

		case "FINISH": // 蒸花卷成功
			var rollRecord = event.rollRecord; // 蒸花卷记录实例

			finishRollRecord(openid, rollRecord); break;
	}
}

queryRollRecords = matcher => db.collection('t_roll_record')
	.aggregate().match(matcher).sort({createdAt: -1});

queryRollRecord = recordId => db.collection('t_roll_record').doc(recordId)

queryUser = openid => db.collection('t_user').where({_openid: openid})

getRollRecords = async (userOpenid, startTime, endTime, cond) => {
	if (typeof(startTime) == 'number') startTime = new Date(startTime);
	if (typeof(endTime) == 'number') endTime = new Date(endTime);

	var matcher = {
		_openid: userOpenid,
		createdAt: _.and(_.gt(startTime), _.lt(endTime)),
		...cond
	}
	return (await queryRollRecords(matcher).end()).list;
}

startRollRecord = async (openid, data) => {
	data._openid = openid;
	data.createdAt = new Date();
	data.status = 0;

	var userInfo = (await queryUser(openid).get()).data[0];
	if (!userInfo.unlockFoods.includes(data.foodId))
		throw new Error("尚未解锁该菜品！");

	delete data._id;

	data._id = (await db.collection('t_roll_record').add({ data }))._id;
	return data;
}

failRollRecord = (openid, data) => {
	var id = data._id;

	data._openid = openid;
	data.terminatedAt = new Date();
	data.status = 2;

	delete data._id;
	delete data.createdAt;

	queryRollRecord(id).update({ data })
}

finishRollRecord = (openid, data) => {
	var id = data._id;

	data._openid = openid;
	data.terminatedAt = new Date();
	data.status = 1;

	delete data._id;
	delete data.createdAt;

	gainRoll(openid, data.rollCount);
	queryRollRecord(id).update({ data })
}

gainRoll = (openid, value) => {
	var data = {
		_openid: openid, value, createdAt: new Date()
	}
	db.collection('t_roll_gain').add({ data })
	queryUser(openid).update({
		data: { 
			rollCount: _.inc(value),
			totalRoll: _.inc(value)
		}
	})
}