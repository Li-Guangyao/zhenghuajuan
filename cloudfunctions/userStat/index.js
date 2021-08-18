const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

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
		case "TOTAL": // 获取用户所有数据
			var userOpenid = event.userOpenid || openid; // 指定用户openid

			return await getUserStat(userOpenid);
			
		case "TODAY": // 获取用户本日数据
			var userOpenid = event.userOpenid || openid; // 指定用户openid

			var startTime = new Date();
			startTime.setHours(0, 0, 0);
			var endTime = new Date();
			endTime.setHours(23, 59, 59);

			return await getUserStat(userOpenid, startTime, endTime);
	}
}

getUserStat = async (userOpenid, startTime, endTime) => {

	var matcher = { status: 1 };

	matcher._openid = userOpenid;
	
	if (startTime && !endTime) 
		matcher.createdAt = _.gt(startTime)
	else if (!startTime && endTime) 
		matcher.createdAt = _.lt(endTime)
	else if (startTime && endTime) 
		matcher.createdAt = _.and(
			_.gt(startTime), _.lt(endTime));

	var queryRollRecord = db.collection('t_roll_record')
		.aggregate().match(matcher)

	var task1 = queryRollRecord.count('_count').end();
	var task2 = queryRollRecord.group({
    _id: null, _duration: $.sum('$duration')
  }).end();
	var task3 = queryRollRecord.group({
    _id: null, _rollCount: $.sum('$rollCount')
	}).end();
	
	var res = await Promise.all([task1, task2, task3]);

	var count = res[0].list[0];
	count = count ? count._count : 0;

	var duration = res[1].list[0];
	duration = duration ? duration._duration : 0;

	var rollCount = res[2].list[0];
	rollCount = rollCount ? rollCount._rollCount : 0;

	return { count, duration, rollCount }
}