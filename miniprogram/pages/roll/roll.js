import NavigateUtils from "../../utils/navigateUtils"
import PageCombiner from "../common/pageCombiner"
import userPage from "../common/userPage"
import foodPage from "../common/foodPage"
import FoodManager from "../../modules/foodModule/foodManager"
import RollRecord from "../../modules/rollModule/rollRecord"
import RollManager from "../../modules/rollModule/rollManager"

var main = {
	data: {
		rollRecord: new RollRecord(),
		/*
		{
			flavor: '学习', // 口味

			strictMode: true, // 严格模式

			duration: 15, // 学习时间长短，默认15min
			rollCount: 0, // 可获得的小麦数量

			foodId: '', // 菜品ID
			quality: 0, // 当前选择的时间，对应第几级别食物
		},
		*/

		showFlavorEdit: false, // 修改口味
		showPopup: false, // 菜品弹窗
		
		foodIdx: 0, // 浏览到第几个菜品
		curFoodIdx: 0, // 选择了第几个菜品

		rate: 0, // 时间滑动条的比率
	},

	// 数据操作
	// TODO: 提取共有操作
	getObject() {
		return this.data.rollRecord;
	},
	getData() {
		return this.getObject().data;
	},
	updateData(obj, refresh) {
		Object.assign(this.getData(), obj)
		if (refresh) this.refreshData();
	},
	refreshData() {
		getObject().refresh();
		this.setData({ rollRecord: this.getObject() });
	},

	// 数据编辑
	// 菜品弹窗
	showPopup() {
		this.setData({ showPopup: true })
	},
	closePopup() {
		this.setData({ showPopup: false })
	},

	// 菜品选择控制
	prevFood() {
		this.changeFoodIdx(this.data.foodIdx - 1)
	},
	nextFood() {
		this.changeFoodIdx(this.data.foodIdx + 1)
	},

	changeFoodIdx(idx) {
		var max = FoodManager.foodCount;
		this.setData({ 
			foodIdx: Math.max(Math.min(max, idx), 0)
		})
	},

	// 当前菜品
	curFood() {
		return this.data.foods[this.data.foodIdx];
	},
	curFoodId() {
		return this.curFood()._id;
	},

	// 解锁食物
	async unlockFood() {
		var food = this.curFood();
		var res = await wx.showModal({
			title: '确定要解锁' + food.name + '吗？',
			showCancel: true
		})

		if (res.confirm) {
			await FoodManager.buy(food._id);
			await this.getUser();
		}
	},

	// 选择食物
	chooseFood() {
		this.setData({
			curFoodIdx: this.data.foodIdx,
		})

		this.closePopup()
		this.setDuration(this.data.rate);
	},

	// 修改学习任务的名字
	startNameEdit() {
		this.setData({ showNameEdit: true })
	},
	// 完成输入，失去焦点触发
	finishNameEdit() {
		this.setData({ showNameEdit: false })
	},
	// 输入口味的名称
	inputFlavor(e) {
		this.updateData({flavor: e.detail.value}, true)
	},

	// 进度条事件
	onDrag(e) {
		this.setDuration(e.detail.value / 100);
	},
	onValueChange(e) {
		this.setDuration(e.detail / 100);
	},

	// 设置时间
	setDuration(rate) {
		var food = this.curFood();
		var min = food.minTime || 15;
		var duration = Math.floor(min + (120 - min) * rate);

		this.setData({ rate })
		this.updateData({ duration }, true)
	},

	// 严格模式
	onStrictChange(e) {
		this.updateData({ strictMode: !this.getData().strictMode }, true);
	},

	// 点击“开始蒸花卷”
	async startRoll() {
		if (!this.getData().flavor) 
			return wx.showToast({ 
				title: '口味不能为空！', icon: 'none' 
			});

		this.refreshData();

		var duration = this.getData().duration;
		var strictMode = this.getData().strictMode;

		var title = '确定要制作' + duration + '分钟吗？';
		if (strictMode)
			title += "严格模式下，制作过程中不可退出、切换页面和熄屏哦！";

		var res = await wx.showModal({ title, showCancel: true })
		if (res.confirm) this.doStartRoll();
	},

	// 真的开始啦！
	doStartRoll() {
		RollManager.start(this.getObject());

		NavigateUtils.push('../rolling/rolling');
	},

	toPost() {
		NavigateUtils.switch('../homepage/homepage');
	},

	toMy() {
		NavigateUtils.switch('../my/my');
	},

	toRollRecord() {
		NavigateUtils.push('../rollRecord/rollRecord');
	},

	toRanklist() {
		NavigateUtils.push('../ranklist/ranklist');
	}
}

Page(PageCombiner.Combine(main, [userPage, foodPage]));
