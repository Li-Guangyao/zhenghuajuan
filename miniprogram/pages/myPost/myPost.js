import getDateDiff from "../../utils/getDateDiff"
import changeFileListFormat from "../../utils/changeFileListFormat"

Page({
	data: {
		postList: []
	},

	queryParams: {
		pageNum: 0,
		pageSize: 20
	},

	onLoad: function (options) {
		this.refreshPage()
	},

	async refreshPage() {
		this.queryParams.pageNum = 0

		wx.showLoading({
			title: '加载中',
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

	// 点击视频或者图片预览
	previewMadia(e) {
		console.log(e)
		// sources: this.data.postList.
		var index1 = e.currentTarget.dataset.index1
		var index2 = e.currentTarget.dataset.index2
		wx.previewMedia({
			sources: this.data.postList[index1].photoList,
			current: index2,
			showmenu: true,
		})
	},

	tapPost(e) {
		var index = e.currentTarget.dataset.index
		var post = JSON.stringify(this.data.postList[index])
		wx.navigateTo({
			url: '../postDetail/postDetail?post=' + post + '&postIndex=' + index,
		})
	},

	onPullDownRefresh: function () {
		this.refreshPage()
		wx.stopPullDownRefresh()
	},

	//触底加载
	async onReachBottom() {
		console.log('ReachBottom')
		wx.showLoading({
			title: '加载中',
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

	deletePost(e) {
		wx.showModal({
			content: '确定删除',
			success: async (res) => {
				if (res.confirm) {
					wx.cloud.callFunction({
						name: 'removePost',
						data: {
							postId: this.data.postList[e.currentTarget.dataset.index]._id
						},
						success: res => {
							wx.showToast({
								title: '删除成功',
								icon: 'none'
							});

							this.data.postList.splice(e.currentTarget.dataset.index, 1)
							this.setData({
								postList: this.data.postList
							})
						},
						fail: err => {
							console.log(err)
						}
					})
				}
			}
		})
	}
})