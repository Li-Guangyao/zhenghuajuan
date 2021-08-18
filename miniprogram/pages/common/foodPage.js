import FoodManager from '../../modules/foodModule/foodManager'

var foodPage = {
	data: {
		foods: {}, // 菜品数据
		foodObjects: {} // 菜品对象
	},

	async onLoad() {
		var foodObjects = await FoodManager.load();

		this.setData({
			foodObjects,
			foods: foodObjects.map(f => f.data)
		});
	},
	
}

export default foodPage;