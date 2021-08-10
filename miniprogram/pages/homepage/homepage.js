import getDateDiff from "../../utils/getDateDiff"
import changeFileListFormat from "../../utils/changeFileListFormat"
import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		postList: [],
		userInfo: null
	},

	queryParams: {
		pageNum: 0,
		pageSize: 20
	},

	// async onLoad(options) {
	// 	await this.judgeLogin()
	// 	await this.refreshPage()
	// },

	async onShow() {
		await this.judgeLogin()
		await this.refreshPage()
	},

	async judgeLogin() {
		this.setData({ userInfo: await userUtils.judgeLogin() })
	},

	// 下拉刷新
	async onPullDownRefresh() {
		var postDisplay = this.selectComponent('#postDisplay')
		await postDisplay.uploadLikes();

		await this.refreshPage()
		wx.stopPullDownRefresh()
	},

	// 触底加载
	async onReachBottom() {
		wx.showLoading({
			title: '加载中', mask: true
		})

		var openId = this.data.userInfo ? 
			this.data.userInfo._openid : undefined;

		this.queryParams.pageNum++

		var res = await wx.cloud.callFunction({
			name: 'getPost',
			data: {
				newestDate: this.data.postList[0].createdAt,
				skipNum: this.queryParams.pageNum * this.queryParams.pageSize,
				userOpenId: openId,
			}
		})

		if (res.result.length == 0)
			wx.showToast({
				icon: 'error',
				title: '没有更多了~',
			})
		else {
			var subPostList = changeFileListFormat(this.dateDiffTrans(res.result))
			this.setData({
				postList: [...this.data.postList].concat(...subPostList)
			})
		}

		wx.hideLoading()
	},

	async refreshPage() {
		this.queryParams.pageNum = 0

		var openId = this.data.userInfo ? 
			this.data.userInfo._openid : undefined;

		wx.showLoading({
			title: '加载中', mask: true
		})

		var res = await wx.cloud.callFunction({
			name: 'getPost',
			data: { userOpenId: openId }
		})
		if (res.result) 
			this.setData({
				postList: changeFileListFormat(this.dateDiffTrans(res.result))
			})

		wx.hideLoading()
	},

	// 发帖
	toPostAdd() {
		wx.navigateTo({ url: '../postAdd/postAdd' })
	},

	tapPost(e) {
		var index = e.currentTarget.dataset.index
		var post = JSON.stringify(this.data.postList[index])
		wx.navigateTo({
			url: '../postDetail/postDetail?post=' + post + '&postIndex=' + index,
		})
	},

	// 发帖的时间距离现在多久
	dateDiffTrans(postList) {
		for (var i = 0; i < postList.length; i++) {
			postList[i].timeDiff = getDateDiff(postList[i].createdAt)
		}
		return postList
	},

	// 点击视频或者图片预览
	previewMadia(e) {
		var index1 = e.currentTarget.dataset.index1
		var index2 = e.currentTarget.dataset.index2
		wx.previewMedia({
			sources: this.data.postList[index1].fileList,
			current: index2,
			showmenu: true,
		})
	},

	toRoll() {
		wx.switchTab({
			url: '../roll/roll',
		});
	},
	toMy() {
		wx.switchTab({ url: '../my/my' })
	},

})