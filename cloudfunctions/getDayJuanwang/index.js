// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

function getMyRank(dayRankList, myOpenId){
	if(dayRankList.length != 0){
		for( var i=1; i<= dayRankList.length; i++ ){
			if(dayRankList[i-1]._openid == myOpenId){
				return i
			}
		}
		return -1
	}
}

// 云函数入口函数
exports.main = async (event, context) => {
	var rankList = []
	var myRank = null

	await db.collection('t_rank_day').aggregate().sort({
		createdAt: -1
	}).end().then(res=>{
		// 只需要最新一期的排行榜就行了
		rankList = res.list[0]
		myRank = getMyRank(rankList.dayRankList, event.userInfo.openId)
	})

	return {
		rankList,
		myRank
	}
}