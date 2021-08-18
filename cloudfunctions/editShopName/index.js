const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 改变店铺名称，一天只能修改一次
exports.main = async (event, context) => {
	// 定义1天以前的时间
	var daysAgo = new Date((Date.now() - 1000 * 60 * 60 * 24))

	return db.collection('t_user').where({
		_openid: event.userInfo.openId,
		lastEditTime: _.or(_.lt(daysAgo), _.eq(null))
	}).update({
		data: {
			shopName: event.shopName,
			lastEditTime: new Date()
		}
	}).then(res => {
		return res
	}).catch(err => {
		return err
	})
}