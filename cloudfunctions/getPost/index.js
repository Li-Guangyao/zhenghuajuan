// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

/*
cloud.init({
  env: 'dev-8g04el2md0da36c7',
})
*/

const db = cloud.database()
// 数据库操作符
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {

	if (event.skipNum) {
		var newestDate = new Date(event.newestDate)

		return db.collection('t_post').aggregate().match({
			// 小于最新日期的
			createdAt: _.lt(newestDate),
			status: 1
		}).sort({
			// 按照时间顺序排列
			createdAt: -1
		}).skip(event.skipNum - 1).lookup({
			from: 't_user',
			localField: '_openid',
			foreignField: '_openid',
			as: 'userInfo'
		}).replaceRoot({
			newRoot: $.mergeObjects([$.arrayElemAt(['$userInfo', 0]), '$$ROOT'])
		}).project({
			userInfo: 0,
		}).end().then(res => {
			return res.list
		})
	} else {
		return db.collection('t_post').aggregate().match({
			status: 1
		}).sort({
			createdAt: -1
		}).lookup({
			from: 't_user',
			localField: '_openid',
			foreignField: '_openid',
			as: 'userInfo'
		}).replaceRoot({
			newRoot: $.mergeObjects([$.arrayElemAt(['$userInfo', 0]), '$$ROOT'])
		}).project({
			userInfo: 0,
		}).end().then(res => {
			return res.list
		})
	}

	// const db = cloud.database()
	// const _ = db.command
	// const $ = db.command.aggregate

	// return db.collection('t_post').aggregate()
	// 	.lookup({
	// 		from: 't_post_like',
	// 		let: {
	// 			firstPostId: '$_id',
	// 			// let这里应该是不能访问数据库字段之外的值，所以就算定义了openId
	// 			// 在pipeline里面也不能用
	// 			openId: event.userInfo.openId
	// 		},
	// 		pipeline: $.pipeline()
	// 			.match(
	// 				_.expr(
	// 					// $.and[
	// 					$.eq(['$postId', '$$firstPostId'])
	// 					// $.eq(['$_openid', '$$openId'])
	// 				// ]
	// 				)
	// 			)
	// 			.project({
	// 				_id:0,
	// 				value: 1
	// 			})
	// 			.done(),
	// 		as: 'likeValue',
	// 	}).sort({
	// 		createdAt: -1
	// 	}).end().then(res => {
	// 		return res
	// 	}).catch(err => {
	// 		return err
	// 	})

}