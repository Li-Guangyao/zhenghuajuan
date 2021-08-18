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

		status: 0, // 状态（0: 进行中, 1: 已完成, 2: 已失败）

		message: '', // 海报内容

		rollCount: 0, // 获得的小麦数量

		postId: null, // 关联的帖子ID
	
		createdAt: null, // 开始时间
		terminatedAt: null // 结束时间
	}
	Object.assign(this.data, data);
};

RollRecord.MaxDuration = 120;

RollRecord.GetQuality = function(foodId, duration) {
	var food = FoodManager.foods[foodId];
	var len = food.data.images.length;
	var min = food.data.minTime;
	var max = this.MaxDuration;

	return Math.floor((len - 1) * (duration - min) / (max - min));
}
RollRecord.GetRollCount = function(foodId, duration) {
	return Math.round(duration / 5 + 
		Math.floor(duration / 30) * 2 +
		Math.floor(t / 60) * 5);
}

RollRecord.Create = async function(
	foodId, flavor, duration) {
	
	var data = {
		flavor, duration, foodId,
		quality: this.GetQuality(foodId, duration),
		rollCount: this.GetRollCount(foodId, duration)
	}

	return new RollRecord(data);
}

export default RollRecord;