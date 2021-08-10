import getDateDiff from "../../utils/getDateDiff"
import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		post: {},
		userInfo: null,
		commentList: [],
		
		postIndex: null
	},

	async onLoad(e) {

		wx.showLoading({ title: '加载中' })

		this.setData({
			post: JSON.parse(e.post),
			postIndex: e.postIndex
		})

		await this.judgeLogin();
		await this.refreshComment();

		wx.hideLoading()
	},

	async judgeLogin() {
		this.setData({ userInfo: await userUtils.judgeLogin() })
	},

	async refreshComment() {
		await wx.cloud.callFunction({
			name: 'getPostComment',
			data: {
				postId: this.data.post._id
			}
		}).then(res => {
			this.setData({
				commentList: res.result
			})
			this.dateDiffTrans()
		})
	},

	// 时间距离现在多久
	dateDiffTrans() {
		var length = this.data.commentList.length
		for (var i = 0; i < length; i++) {
			var item = 'commentList[' + i + '].timeDiff'
			var originDate = this.data.commentList[i].createdAt
			this.setData({
				[item]: getDateDiff(originDate)
			})
		}
	},

	async onUnload() {
		var postDisplay = this.selectComponent('#postDisplay')
		await postDisplay.uploadLikes();
	},
	
	back() { wx.navigateBack(); }
})