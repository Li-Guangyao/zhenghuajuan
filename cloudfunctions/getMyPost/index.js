// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {

	var matcher = { _openid: event.userInfo.openId };

	if (event.roll) matcher.rollName = _.neq(null);

	return query(db.collection('t_post').aggregate()
		.match(matcher).sort({ createdAt: -1 })
		.skip(event.skipNum))
	
	// .lookup({
	// 	from: 't_user',
	// 	localField: '_openid',
	// 	foreignField: '_openid',
	// 	as: 'userInfo'
	// }).replaceRoot({
	// 	newRoot: $.mergeObjects([$.arrayElemAt(['$userInfo', 0]), '$$ROOT'])
	// }).project({
	// 	userInfo: 0,
	//   }).end().then(res => {
	// 	return res.list
	// })
}

function query(q) {

	var res = q.lookup({
		from: 't_user',
		localField: '_openid',
		foreignField: '_openid',
		as: 'userInfo'
	}).replaceRoot({
		newRoot: $.mergeObjects([$.arrayElemAt(['$userInfo', 0]), '$$ROOT'])
	}).project({
		userInfo: 0,
	}).lookup({
		from: 't_post_comment',
		let: {
			post_id: '$_id'
		},
		pipeline: $.pipeline()
			.match(_.expr(
				$.eq(['$postId', '$$post_id'])
			))
			.count('commentCount')
			.done(),
		as: '_commentCount'
	}).replaceRoot({
		newRoot: $.mergeObjects([$.arrayElemAt(['$_commentCount', 0]), '$$ROOT'])
	}).project({
		_commentCount: 0,
	})
	
	// if (userOpenId) 
	// 	res = res.lookup({
	// 		from: 't_post_like',
	// 		let: {
	// 			post_id: '$_id'
	// 		},
	// 		pipeline: $.pipeline()
	// 			.match(_.expr($.and([
	// 				$.eq(['$postId', '$$post_id']),
	// 				$.eq(['$_openid', userOpenId]),
	// 			])))
	// 			.replaceRoot({
	// 				newRoot: {
	// 					likeIndex: '$valueIndex',
	// 					oriLikeIndex: '$valueIndex',
	// 				}})
	// 			.done(),
	// 		as: '_like'
	// 	}).replaceRoot({
	// 		newRoot: $.mergeObjects([$.arrayElemAt(['$_like', 0]), '$$ROOT'])
	// 	}).project({
	// 		_like: 0,
	// 	})

	return res.end().then(res => {
		return res.list
	})
}
