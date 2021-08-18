import UserManager from "../userModule/userManager";

function Food() {
	this.initialize.apply(this, arguments);
}

Food.prototype.initialize = function(data) {

	this.data = {
		_id: null, // 菜品ID
		name: '', // 菜品名
		description: '', // 菜品描述

		images: [], // 菜品图片URL
	
		cost: 0, // 菜品解锁费用
		minTime: 15, // 菜品最少时间
	}
	Object.assign(this.data, data);

	this._isUnlocked = this.isUnlocked();
};

/**
 * 是否已解锁
 */
Food.prototype.isUnlocked = async function() {
	var user = await UserManager.judgeLogin();
	return user.data.unlockFoods.includes(this._id);
}

export default Food;