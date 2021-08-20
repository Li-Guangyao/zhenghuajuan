const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

const TOKEN = "dOXi^w$7D0BOwG!UIA";

// 改变店铺名称，一天只能修改一次
exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;

	// 测试鉴权
	var test = event.token == TOKEN;
	if (test && event.openid) openid = event.openid;

	// 定义1天以前的时间
	var daysAgo = new Date((Date.now() - 1000 * 60 * 60 * 24))

	return await db.collection('t_user').where({
		_openid: openid,
		lastEditTime: _.or(_.lt(daysAgo), _.eq(null))
	}).update({
		data: {
			shopName: event.shopName,
			lastEditTime: new Date()
		}
	})
}