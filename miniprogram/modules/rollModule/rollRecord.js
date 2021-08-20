import FoodManager from '../foodModule/foodManager'
import DateUtils from "../../utils/dateUtils";

function RollRecord() {
	this.initialize.apply(this, arguments);
}

RollRecord.prototype.initialize = function(data) {

	this.data = {
		_id: null, // 蒸花卷记录ID
		_openid: null, // 对应用户openid

		flavor: '学习', // 口味
		duration: 15, // 分钟数

		foodId: '', // 菜品ID
		quality: 0, // 品质

		strictMode: true, // 严格模式

		status: 0, // 状态（0: 进行中, 1: 已完成, 2: 已失败）

		message: '', // 海报内容
		shareImage: null, // 分享图片

		rollCount: 0, // 获得的小麦数量

		postId: null, // 关联的帖子ID
	
		createdAt: null, // 开始时间
		terminatedAt: null // 结束时间
	}
	Object.assign(this.data, data);

	this.food = null;
	this.foodName = null;
	this.foodImage = null;
	this.timeKey = null;
	this.time = null;

	this.refresh();
};

RollRecord.prototype.refresh = function() {
	this._refreshFoodData();
	this._refreshTimeData();
}
RollRecord.prototype._refreshFoodData = function() {
	var food = this.food = FoodManager.foods[this.data.foodId];
	if (!food) return;

	this.foodImage = food.data.images[this.data.quality];
	this.foodName = food.data.name;
}
RollRecord.prototype._refreshTimeData = function() {
	var time = new Date(this.data.createdAt);
			
	this.time = DateUtils.date2MDHM(time);
	this.timeKey = DateUtils.date2YMDChi(time);
}

RollRecord.prototype.updateData = function() {
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
		Math.floor(duration / 60) * 5);
	if (!strictMode) res = Math.round(res / 2);
	return res;
}

export default RollRecord;