// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command

// 获取打败了x%的人
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()

	var duration = event.duration;

	return Math.round(await getDefeat(duration));
}

async function getDefeat(duration) {
	if (duration >= 120) return 100;

	var cnt = (await db.collection('t_roll_record').where(_.or([
		{ // 已完成的，同时时间比当前时间短的
			status: 1, duration: _.lt(duration)
		}, { // 失败的个数
			status: 2
		}
	])).count()).total;

	var sumCnt = (await db.collection('t_roll_record').count()).total;

	return cnt / sumCnt * 100;

	// 以下是随机算法
	/*
	var rand = Math.random();
	if (duration <= 15) return 10 + rand * 5;
	if (duration < 60) {
		var percent = (duration - 15) / (60 - 15);
		return 15 + (50 - 15) * percent + rand * 4 - 2;
	}
	if (duration == 60) return 50 + rand * 15;
	if (duration < 120) {
		var percent = (duration - 60) / (120 - 60);
		return 65 + (90 - 65) * percent + rand * 4 - 2;
	}
	return 100
	*/
}