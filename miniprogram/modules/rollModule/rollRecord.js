import FoodManager from '../foodModule/foodManager'

function RollRecord() {
	this.initialize.apply(this, arguments);
}

RollRecord.prototype.initialize = function(data) {

	this.data = {
		_id: null, // 蒸花卷记录ID
		_openid: null, // 对应用户openid

		flavor: '', // 口味
		duration: 0, // 分钟数

		foodId: '', // 菜品ID
		quality: 0, // 品质

		strictMode: false, // 严格模式

		status: 0, // 状态（0: 进行中, 1: 已完成, 2: 已失败）

		message: '', // 海报内容
		shareImage: '', // 分享图片

		rollCount: 0, // 获得的小麦数量

		postId: null, // 关联的帖子ID
	
		createdAt: null, // 开始时间
		terminatedAt: null // 结束时间
	}
	Object.assign(this.data, data);
};

RollRecord.prototype.refresh = function() {
	this.data.quality = RollRecord.GetQuality(
		this.data.foodId, this.data.duration)
	this.data.rollCount = RollRecord.GetRollCount(
		this.data.foodId, this.data.duration, this.data.strictMode);
}

RollRecord.MaxDuration = 120;

RollRecord.GetQuality = function(foodId, duration) {
	var food = FoodManager.foods[foodId];
	var len = food.data.images.length;
	var min = food.data.minTime || 15;
	var max = this.MaxDuration;

	return Math.floor((len - 1) * (duration - min) / (max - min));
}
RollRecord.GetRollCount = function(foodId, duration, strictMode) {
	var res = Math.round(duration / 5 + 
		Math.floor(duration / 30) * 2 +
		Math.floor(t / 60) * 5);
	if (strictMode) res = Math.round(res / 2);
	return res;
}

export default RollRecord;