import getDateDiff from "../../utils/getDateDiff"
import changeFileListFormat from "../../utils/changeFileListFormat"
import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		userInfo: null,
		postList: [],
		strictMode: false,

		name: '',

		showDialog: false,
		showPopup: false,

		durationIndex: 0,
		durations: [15, 30, 45, 60, 90, 120],
		counts: [15, 30, 45, 60, 135, 240]
	},

	queryParams: {
		pageNum: 0,
		pageSize: 20
	},

	// onLoad: async function (options) {
	// },

	async onShow() {
		await this.judgeLogin();
		await this.refreshPage();
	},

	onPullDownRefresh: function () {
		this.refreshPage()
		wx.stopPullDownRefresh()
	},

	async judgeLogin() {
		this.setData({ userInfo : await userUtils.judgeLogin() })
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
						title, showCancel: true,
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
	
	toPost() {
		wx.reLaunch({ url: '../homepage/homepage' })
	},
	toMy() {
		wx.reLaunch({ url: '../my/my' })
	},
})