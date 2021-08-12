import getDateDiff from "../../utils/getDateDiff"
import changeFileListFormat from "../../utils/changeFileListFormat"
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

		showDialog: false,
		showPopup: false,

		duration: 15,

		foodList: [],
		// 浏览到第几个菜品
		foodIdx: 0,
		// 选择了第几个菜品
		chosenFoodIdx: 0,
	},

	queryParams: {
		pageNum: 0,
		pageSize: 20
	},

	async onLoad(options) {
		// 获得食物列表
		var res = await wx.cloud.callFunction({
			name: 'getFood',
		})
		this.setData({
			foodList: res.result
		})
	},

	async onShow() {
		if (!this.data.userInfo) {
			await this.judgeLogin();
		}
		await this.refreshPage();
	},

	onPullDownRefresh: function () {
		this.refreshPage()
		wx.stopPullDownRefresh()
	},

	async judgeLogin() {
		this.setData({
			userInfo: await userUtils.judgeLogin()
		})
	},

	async refreshPage() {
		this.queryParams.pageNum = 0

		wx.showLoading({
			title: '加载中',
			mask: true
		})

		wx.cloud.callFunction({
			name: 'getMyPost',
			data: {
				roll: true,
				skipNum: this.queryParams.pageNum * this.queryParams.pageSize,
			}
		}).then(res => {
			console.log(res)
			if (res.result) {
				this.setData({
					postList: changeFileListFormat(this.dateDiffTrans(res.result))
				})
			}
		})

		wx.hideLoading()
	},

	// 发帖的时间距离现在多久
	dateDiffTrans(postList) {
		var length = postList.length
		for (var i = 0; i < length; i++) {
			var originDate = postList[i].createdAt
			postList[i].timeDiff = getDateDiff(originDate)
		}
		return postList
	},

	//触底加载
	async onReachBottom() {
		console.log('ReachBottom')
		wx.showLoading({
			title: '加载中',
			mask: true
		})

		this.queryParams.pageNum++
		console.log(this.queryParams.pageNum)

		var res = await wx.cloud.callFunction({
			name: 'getMyPost',
			data: {
				roll: true,
				skipNum: this.queryParams.pageNum * this.queryParams.pageSize,
			}
		})

		if (res.result.length == 0) {
			wx.showToast({
				icon: 'error',
				title: '没有更多了~',
			})
		} else {
			var subPostList = changeFileListFormat(this.dateDiffTrans(res.result))
			this.setData({
				postList: [...this.data.postList].concat(...subPostList)
			})
		}

		wx.hideLoading()
	},

	// 点击页面下方+按钮
	showDialog() {
		this.setData({
			showDialog: true
		})
	},

	// 在Dialog中，点击时间
	showPopup() {
		this.setData({
			showPopup: !this.data.showPopup
		})
	},

	inputActivityName(e) {
		console.log(e)
		this.setData({
			name: e.detail.value
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

	// 在时间弹出框中，选择了一个时间长度
	choseDuration(e) {
		this.setData({
			durationIndex: e.detail.index
		})
		this.showPopup()
	},

	// 点击菜品，
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
				title:'确定要解锁吗？',
				showCancel: true,
				success: res => {
					if (res.confirm) {
						userInfo.rollCount -= foodList[foodIdx].cost
						userInfo.unlockFoods.push(foodList[foodIdx]._id)
			
						wx.cloud.callFunction({
							name: 'unlockFood',
							data: {
								unlockFoods: userInfo.unlockFoods,
								rollCount: userInfo.rollCount
							}
						})

						this.setData({
							['userInfo.unlockFood']:unlockFoods,
							['userInfo.rollCount']: rollCount
						})
						
					} else if (res.cancel){}
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
		this.setData({
			duration: e.detail.value
		})
	},

	// 修改学习任务的名字
	showNameEdit() {
		this.setData({
			showNameEdit: true
		})
	},

	inputActivityName(e) {
		this.setData({
			name: e.detail.value + '味花卷'
		})
	},

	finishNameEdit() {
		this.setData({
			showNameEdit: false
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