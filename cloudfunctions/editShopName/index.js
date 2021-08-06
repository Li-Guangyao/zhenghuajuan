const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 改变店铺名称，一个月只能修改一次
exports.main = async (event, context) => {
	// 定义30天以前的时间
	var daysAgo = new Date((Date.now() - 1000 * 60 * 60 * 24 * 30))

	return db.collection('t_user').where({
		_openid: event.userInfo.openId,
		lastEditTime: _.lt(daysAgo)
	}).update({
		data: {
			shopName: event.shopName,
			lastEditTime: Date()
		}
	}).then(res => {
		return res
	}).catch(err => {
		return err
	})
}