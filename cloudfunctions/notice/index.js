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

	// 函数主体
	switch (method.toUpperCase()) {
		case "GET": // 获取通知
			var cond = event.cond; // 附加参数

			return await getNotices(cond);
		case "READ": // 阅读通知
			var noticeId = event.noticeId; // 通知ID

			return await readNotice(openid, noticeId);
	}
}

// cond: 判断条件，为空则获取全部
getNotices = async (cond) => {
	var matcher = cond || {};
	var now = Date.now();

	// 公告的结束时间必须晚于当前时间，否则没必要发布出来
	// 如果为null则长期显示
	matcher.endAt = _.or(_.eq(null), _.gt(now));

	return (await db.collection('t_notice').aggregate()
		.match(matcher).sort({startAt: 1}).end()).list;
}

// 购买食物
readNotice = async (openid, noticeId) => {
	var queryUser = db.collection('t_user').where({ _openid: openid })
	var data = (await queryUser.get()).data[0];
	var has = !!data.readNotices; // 是否有属性

	if (has && data.readNotices.includes(noticeId)) 
		throw new Error("该通知已经阅读！")

	return queryUser.update({
		data: {
			readNotices: has ? _.push(noticeId) : [noticeId]
		}
	})
}