import getDateDiff from "../../utils/getDateDiff"
import changeFileListFormat from "../../utils/changeFileListFormat"

Page({
	data: {
		/*
		postList: [{
			rollName: "学习",
			rollCount: 30,
			rollTime: 30,

			avatarUrl: "",
			timeDiff: "1天前",
			nickName: "我自己",
			likeValue: 42,
			content: "今天学了30分钟的Java的反射",
			fileList: [],
		}, {
			rollName: "编程",
			rollCount: 15,
			rollTime: 15,

			avatarUrl: "",
			timeDiff: "1天前",
			nickName: "我自己",
			likeValue: 28,
			content: "专注了15分钟",
			fileList: [],
		}, {

			avatarUrl: "",
			timeDiff: "1天前",
			nickName: "我自己",
			likeValue: 28,
			content: "今天啥也没干",
			fileList: [],
		}],
		*/
		userInfo: null,
		postList: [],

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
		var userInfo = await wx.getStorageSync('userInfo')
		if (!userInfo) {
			wx.showModal({
				title: '卷王同志，请先登陆再来',
				showCancel: true,
				success(res) {
					if (res.confirm) {
						wx.switchTab({
							url: '../my/my',
						})
					} else if (res.cancel) {
						wx.navigateBack({
							delta: 1,
						})
					}
				}
			})
		} else this.setData({ userInfo })
	},

	async refreshPage() {
		this.queryParams.pageNum = 0

		wx.showLoading({
			title: '加载中', mask: true
		})

		await wx.cloud.callFunction({
			name: 'getMyPost',
			data:{
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
			title: '加载中', mask: true
		})

		this.queryParams.pageNum++
		console.log(this.queryParams.pageNum)
		await wx.cloud.callFunction({
			name: 'getMyPost',
			data: {
				roll: true,
				skipNum: this.queryParams.pageNum * this.queryParams.pageSize,
			}
		}).then(res => {
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
		})

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

	onDialogClose(e) {
		switch (e.detail) {
			case "confirm":
				if (!this.data.name) {
					wx.showToast({
						title: '花卷口味不能为空！',
						icon: 'none'
					});
					this.setData({ showDialog: true });
				} else 
					wx.showModal({
						title: '确定开始蒸花卷吗？',
						showCancel: true,
		
						success: res => {
							if (res.confirm) {
								var duration = this.data.durations[this.data.durationIndex];
								var count = this.data.counts[this.data.durationIndex];
								wx.navigateTo({
									url: '../rolling/rolling?name=' + this.data.name + 
									"&duration=" + duration + "&count=" + count,
								})
							} else if (res.cancel) 
								this.setData({ showDialog: false });
						}
					})
				break;
			default:
				this.setData({ showDialog: false });
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
})