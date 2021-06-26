import getDateDiff from "../../utils/getDateDiff"
import changeFileListFormat from "../../utils/changeFileListFormat"

Page({
	data: {
		postList: [],
		userInfo: null,
	},

	queryParams: {
		pageNum: 0,
		pageSize: 20
	},

	onLoad: async function (options) {
		await this.judgeLogin();
		await this.refreshPage();
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
		} else {
			this.setData({
				userInfo: userInfo
			})
		}
	},

	async refreshPage() {
		this.queryParams.pageNum = 0

		wx.showLoading({
			title: '加载中', mask: true
		})

		await wx.cloud.callFunction({
			name: 'getMyPost',
			data:{
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

	onPullDownRefresh: function () {
		this.refreshPage()
		wx.stopPullDownRefresh()
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

})