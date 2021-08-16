// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()

	var duration = event.duration;

	return Math.round(getDefeat(duration));
}

function getDefeat(duration) {
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
}