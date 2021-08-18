import CFM from '../coreModule/cloudFuncManager'
import UserManager from '../userModule/userManager'
import Food from './food'
import MathUtils from '../../utils/mathUtils'

function FoodManager() {
	throw new Error('This is a static class');
}

// 云函数名称
FoodManager.CF = {
	Food: 'food'
}
FoodManager.foods = null;
FoodManager.foodCount = 0;

/**
 * 加载菜品
 * @param {Boolean} force 强制刷新
 */
FoodManager.load = async function(force) {
	if (force || !this.foods) {
		var res = await CFM.call(this.CF.Food, 'get');
		this.foods = this._processFoods(res);
	}
	return this.foods;
}

FoodManager._processFoods = function(foods) {
	let _foods = {}
	this.foodCount = foods.length;
	foods = foods.map(f => new Food(f));
	foods.forEach(f => _foods[f._id] = f);
	return { ...foods, ..._foods }
}

/**
 * 购买菜品
 * @param {String} foodId 菜品ID
 */
FoodManager.buy = async function(foodId) {
	var userInfo = await UserManager.judgeLogin();
	var userData = userInfo.data;

	if (userData.unlockFoods.includes(foodId))
		return; // 已经解锁过了

	var food = this.foods[foodId]
	if (!food) return; // 找不到菜品

	// 金钱足够
	if (userData.rollCount > food.data.cost) {
		userData.rollCount -= food.data.cost;
		userData.unlockFoods.push(foodId);

		CFM.call(this.CF.Food, "buy", {foodId})
	}
}

/**
 * 随机获取菜品
 */
FoodManager.getRandom = function() {
	return MathUtils.randomItem(this.foods);
}

export default FoodManager;