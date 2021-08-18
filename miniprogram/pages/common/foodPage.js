import FoodManager from '../../modules/foodModule/foodManager'

var foodPage = {
	data: {
		foods: null, // 菜品数据
		foodObjects: null // 菜品对象
	},

	async onLoad() {
		var objs = await FoodManager.load();

		this.setData({
			foods: objs.map(f => f.data),
			foodObjects: objs
		});
	},
	
}

export default foodPage;