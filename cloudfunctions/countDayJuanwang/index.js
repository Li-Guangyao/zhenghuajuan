// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 统计前一天的卷王名单
exports.main = async (event, context) => {
	var now = new Date()

	var date = now.getDate()
	var month = now.getMonth();
	var year = now.getFullYear();

	var startTime = new Date(year, month, date, 0, 0, 0);
	var endTime = new Date(year, month, date + 1, 0, 0, 0);

 	await makeRankList("day", startTime, endTime);
}

async function makeRankList(type, startTime, endTime) {
	var res = await db.collection('t_roll_gain').aggregate().match({
		createdAt: _.and(_.lt(endTime), _.gt(startTime))
	}).group({
		_id: "$_openid",
		sumValue: $.sum('$value')
	}).sort({
		sumValue: -1
	}).lookup({
		from: "t_user",
		localField: '_id',
		foreignField: '_openid',
		as: "userInfo"
	}).addFields({ // 会直接替换掉
		userInfo: $.arrayElemAt(['$userInfo', 0])
	}).match({
		sumValue: _.gt(0)
	}).end()

	updateResult(type, res.list, startTime, endTime)
}

function updateResult(type, result, start, end) {
	db.collection('t_rank_tmp')
		.where({ type }).remove()
		.then(_ => addResult(type, result, start, end))
		.catch(_ => addResult(type, result, start, end))
}

function addResult(type, result, start, end) {
	db.collection('t_rank_tmp').add({
		data: {
			type, rankList: result,
			createdAt: new Date(), 
			start, end
		}
	})
}