import FoodManager from '../../modules/foodModule/foodManager'

var foodPage = {
	data: {
		foods: {} // 菜品数据（Food对象）
	},

	async onLoad(e) {
		var foods = await FoodManager.load();
		this.setData({ foods });
		this.onFoodLoaded();
	},

	onFoodLoaded() { }
}

export default foodPage;