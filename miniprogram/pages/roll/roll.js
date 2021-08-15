import { userUtils } from "../../utils/userUtils"
import { navigateUtils } from "../../utils/navigateUtils"

Page({
	data: {
		userInfo: wx.getStorageSync('userInfo'),
		postList: [],
		strictMode: true,

		name: '学习',
		showNameEdit: false,
		showPopup: false,

		duration: 15, // 学习时间长短，默认15min
		rollCount: 0, // 可获得的小麦数量

		foodList: [],
		
		foodIdx: 0, // 浏览到第几个菜品
		chosenFoodIdx: 0, // 选择了第几个菜品
		qualityIdx: 0 // 当前选择的时间，对应第几级别食物
	},

	async onLoad(options) {
		
		// 获得食物列表
		var res = await wx.cloud.callFunction({
			name: 'operFoods',
			data: { method: 'GET' }
		})
		this.setData({ foodList: res.result })
		if (!this.data.userInfo) await this.judgeLogin();
		
		this.initFoodInfo()
	},

	async onShow() {
		this.setData({ userInfo: await userUtils.getUserInfo() });
	},

	// 拿到foodList，判断某些food是否解锁
	initFoodInfo() {
		var unlockFoods = this.data.userInfo.unlockFoods
		var foodList = this.data.foodList

		foodList.map(item => {
			item.unlock = unlockFoods.indexOf(item._id) != -1
		})

		this.setData({
			foodList
		})
	},

	async judgeLogin() {
		this.setData({
			userInfo: await userUtils.judgeLogin()
		})
	},

	// 在Dialog中，点击时间
	showPopup() {
		this.setData({
			showPopup: !this.data.showPopup
		})
	},

	// 是否选择严格模式
	onStrictChange(e) {
		this.setData({
			strictMode: !this.data.strictMode
		})
		this.refreshRollCount();
		// if (this.data.strictMode)
		// 	wx.showToast({
		// 		title: '严格模式下，蒸花卷过程中不可退出、切换页面和熄屏哦！',
		// 		icon: 'none'
		// 	});
	},

	// 点击菜品
	showPopup() {
		this.setData({
			showPopup: !this.data.showPopup
		})
	},

	prevFood() {
		var foodIdx = this.data.foodIdx
		this.setData({
			foodIdx: foodIdx == 0 ? foodIdx : foodIdx - 1
		})
	},

	nextFood() {
		var foodIdx = this.data.foodIdx
		var length = this.data.foodList.length
		this.setData({
			foodIdx: foodIdx == length - 1 ? foodIdx : foodIdx + 1
		})
	},

	// 解锁食物
	async unlockFood() {
		var userInfo = this.data.userInfo
		var foodList = this.data.foodList
		var foodIdx = this.data.foodIdx

		if (userInfo.rollCount < foodList[foodIdx].cost) {
			wx.showToast({
				icon: 'error',
				title: '小麦数量不够！',
			})
		} else {
			var res = await wx.showModal({
				title: '确定要解锁吗？',
				showCancel: true
			})

			if (res.confirm) {
				userInfo.rollCount -= foodList[foodIdx].cost
				userInfo.unlockFoods.push(foodList[foodIdx]._id)

				await wx.cloud.callFunction({
					name: 'operFoods',
					data: {
						method: 'BUY',
						foodId: foodList[foodIdx]._id
					}
				})

				this.setData({
					['userInfo.unlockFood']: userInfo.unlockFoods,
					['userInfo.rollCount']: userInfo.rollCount
				})

				this.initFoodInfo()
			}
		}
	},

	// 选择食物
	chooseFood() {
		this.setData({
			chosenFoodIdx: this.data.foodIdx,
		})
		this.showPopup()
	},

	// 拖动进度条
	onDrag(e) {
		var duration = e.detail.value
		var food = this.data.foodList[this.data.chosenFoodIdx];
		var maxQ = this.maxQuality(food), min = this.minTime(food);
		var qualityIdx = this.calcQuality(maxQ, min, duration);

		this.setData({
			duration, qualityIdx
		})

		this.refreshRollCount();
	},

	refreshRollCount() {
		var rollCount = this.calcRollCount(this.data.duration)
		if (!this.data.strictMode) 
			rollCount = Math.floor(rollCount / 2);
		this.setData({ rollCount })
	},

	maxQuality: (food) => food.images.length,
	minTime: (food) => food.minTime || 15,
	calcQuality: (maxQ, min, t) => Math.floor((maxQ - 1) * (t - min) / (120 - min)),
	calcRollCount: (t) => Math.round(t / 5 + Math.floor(t / 30) * 2 + Math.floor(t / 60) * 5),

	// 修改学习任务的名字
	showNameEdit() {
		this.setData({ showNameEdit: true })
	},

	// 输入活动的名称
	inputActivityName(e) {
		this.setData({ name: e.detail.value })
	},

	// 完成输入，失去焦点触发
	finishNameEdit() {
		this.setData({ showNameEdit: false })
	},

	// 点击“开始蒸花卷”
	async startRoll() {
		if (!this.data.name) 
			wx.showToast({ title: '口味不能为空！', icon: 'none' });
		else {
			this.refreshRollCount();

			var title = '确定要制作' + this.data.duration + '分钟吗？';
			if (this.data.strictMode)
				title += "严格模式下，制作过程中不可退出、切换页面和熄屏哦！";

			var res = await wx.showModal({ title, showCancel: true })
			if (res.confirm) this.doStartRoll();
		}
	},

	// 真的开始啦！
	doStartRoll() {
		var food = this.data.foodList[this.data.chosenFoodIdx];
		var quality = this.data.qualityIdx;

		var data = {
			name: this.data.name,
			duration: this.data.duration,
			count: this.data.rollCount,
			strictMode: this.data.strictMode ? 1 : 0,
			foodId: food._id,
			foodName: food.name,
			foodImage: food.images[quality],
			quality,
		}

		navigateUtils.push('../rolling/rolling', data);
	},

	toPost() {
		wx.switchTab({
			url: '../homepage/homepage'
		})
	},

	toMy() {
		wx.switchTab({
			url: '../my/my'
		})
	},

	toRollRecord() {
		navigateUtils.push('../rollRecord/rollRecord');
	},

	toRanklist() {
		navigateUtils.push('../ranklist/ranklist');
	}
})