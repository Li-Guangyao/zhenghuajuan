import {
	userUtils
} from "../../utils/userUtils"

Page({
	data: {
		userInfo: wx.getStorageSync('userInfo'),
		postList: [],
		strictMode: true,

		name: '学习味花卷',
		showNameEdit: false,
		showPopup: false,

		// 学习时间长短，默认15min
		duration: 15,

		foodList: [],
		// 浏览到第几个菜品
		foodIdx: 0,
		// 选择了第几个菜品
		chosenFoodIdx: 0,
		// 当前选择的时间，对应第几级别食物
		qualityIdx: 0
	},

	async onLoad(options) {
		// 获得食物列表
		var res = await wx.cloud.callFunction({
			name: 'operFoods',
			data: {
				method: 'GET'
			}
		})
		this.setData({
			foodList: res.result
		})
		if (!this.data.userInfo) {
			await this.judgeLogin();
		}
		this.initFoodInfo()
	},

	async onShow(){
		this.setData({
			userInfo: wx.getStorageSync('userInfo')
		})
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
		console.log(e)
		this.setData({
			strictMode: !this.data.strictMode
		})
		// if (this.data.strictMode)
		// 	wx.showToast({
		// 		title: '严格模式下，蒸花卷过程中不可退出、切换页面和熄屏哦！',
		// 		icon: 'none'
		// 	});
	},

	// 输入完蒸花卷信息之后
	onDialogClose(e) {
		switch (e.detail) {
			case "confirm":
				if (!this.data.name) {
					wx.showToast({
						title: '花卷口味不能为空！',
						icon: 'none'
					});
					this.setData({
						showDialog: true
					});
				} else {
					var duration = this.data.durations[this.data.durationIndex];
					var count = this.data.counts[this.data.durationIndex];

					if (!this.data.strictMode)
						count = Math.floor(count / 2);

					var title = '确定要蒸' + duration + '分钟花卷吗？';
					if (this.data.strictMode)
						title += "严格模式下，蒸花卷过程中不可退出、切换页面和熄屏哦！";

					wx.showModal({
						title,
						showCancel: true,
						success: res => {
							if (res.confirm) {
								wx.navigateTo({
									url: '../rolling/rolling?name=' + this.data.name +
										"&duration=" + duration + "&count=" + count + "&strict=" + (this.data.strictMode ? 1 : 0),
								})
							} else if (res.cancel)
								this.setData({
									showDialog: false
								});
						}
					})
				}
				break;
			default:
				this.setData({
					showDialog: false
				});
				break;
		}
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
	unlockFood() {
		var userInfo = this.data.userInfo
		var foodList = this.data.foodList
		var foodIdx = this.data.foodIdx

		if (userInfo.rollCount < foodList[foodIdx].cost) {
			wx.showToast({
				icon: 'error',
				title: '小麦数量不够！',
			})
		} else {
			wx.showModal({
				title: '确定要解锁吗？',
				showCancel: true,
				success: res => {
					if (res.confirm) {
						userInfo.rollCount -= foodList[foodIdx].cost
						userInfo.unlockFoods.push(foodList[foodIdx]._id)

						wx.cloud.callFunction({
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

					} else if (res.cancel) {}
				}
			})
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
		var value = e.detail.value
		var length = this.data.foodList[this.data.chosenFoodIdx].images.length
		this.setData({
			duration: value,
			qualityIdx: parseInt((length - 1) * (value - 15) / 105)
		})
	},

	// 修改学习任务的名字
	showNameEdit() {
		this.setData({
			showNameEdit: true
		})
	},

	// 输入活动的名称
	inputActivityName(e) {
		this.setData({
			name: e.detail.value + '味花卷'
		})
	},

	// 完成输入，失去焦点触发
	finishNameEdit() {
		this.setData({
			showNameEdit: false
		})
	},

	// 点击“开始蒸花卷”
	beginActivity() {
		wx.navigateTo({
			url: '../rolling/rolling?name=' + this.data.name + '&duration=' + this.data.duration,
		})
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
		wx.navigateTo({
			url: '../rollRecord/rollRecord',
		})
	},

	toRanklist() {
		wx.navigateTo({
			url: '../ranklist/ranklist',
		})
	}
})