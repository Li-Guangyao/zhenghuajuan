// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function update(result, now) {
	db.collection('t_rank_week').add({
		data: {
			weekRankList: result,
			createdAt: now
		}
	})
}

// 统计所有用户花卷数
exports.main = async (event, context) => {

	var totals = (await db.collection('t_post_like')
		.aggregate().group({
			_id: '$postAuthor_openid',
			totalValue: $.sum('$value')
		}).end()).list;

	totals.forEach(total => {
		db.collection('t_user').where({
			_openid: total._id
		}).update({
			data: {
				rollCount: total.totalValue
			}
		})
	});
}