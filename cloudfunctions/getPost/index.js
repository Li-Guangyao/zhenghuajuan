// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	return db.collection('t_post').aggregate().sort({
		createdAt: -1
	}).end().then(res=>{
		return res.list
	})

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