// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

function getMyInfo(rankList, myOpenId) {
	var res = {
		myRank: -1,
		myValue: -1
	}
	if (!rankList.length) return res

	var idx = rankList.findIndex(e => e._openid == myOpenId)
	if (idx > -1) {
		res.myRank = idx + 1
		res.myValue = rankList[idx].totalValue
	}

	return res
}

// 云函数入口函数
exports.main = async (event, context) => {
	var res = await db.collection('t_rank_tmp').where({
			type: event.type
		}).get()

	var rankList = res.data[0].rankList
	var myInfo = getMyInfo(rankList, event.userInfo.openId)

	return {
		rankList,
		myRank: myInfo.myRank,
		myValue: myInfo.myValue
	}
}