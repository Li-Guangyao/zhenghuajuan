import getDateDiff from "../../utils/getDateDiff"

Page({
	data: {
		post: {},
		// 评论帖子的输入框
		showInput: false,
		// 点赞框
		showPopup: false,
		// 评论评论的输入框
		showInputForComment: false,
		// 针对帖子的评论
		inputComment: null,
		// 针对评论的评论
		inputCommentComment: null,
		// 回复+用户名+：
		commentSb: null,
		commentList: [],

		chosenPopupItemIndex: -1,
		originChosenPopupItemIndex: -1,
		// 点赞的选项
		popupItem: [{
				name: '卷王非你莫属，我五体投地',
				value: 8
			},
			{
				name: '大佬太强了，不要再卷了',
				value: 4
			},
			{
				name: '给个鼓励~',
				value: 2
			},
			{
				name: '还不够卷啊！',
				value: 1
			},

		],
	},

	onLoad: function (e) {
		var post = JSON.parse(e.post)
		this.setData({
			post: post
		})

		wx.cloud.callFunction({
			name: 'isPostLiked',
			data: {
				postId: post._id
			}
		}).then(res => {
			if (res.result.data.length != 0) {
				this.setData({
					chosenPopupItemIndex: res.result.data[0].valueIndex,
					originChosenPopupItemIndex: res.result.data[0].valueIndex
				})
			}
		})

		this.refreshComment()
	},

	refreshComment() {
		wx.cloud.callFunction({
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

	// 预览图片
	previewMadia(e) {
		var index2 = e.currentTarget.dataset.index2
		wx.previewMedia({
			sources: this.data.post.photoList,
			current: index2,
			showmenu: true,
		})
	},

	// 点击了评论图标
	showInput() {
		this.setData({
			showInput: !this.data.showInput
		})
	},

	// 评论框失焦
	foldInput() {
		this.setData({
			showInput: !this.data.showInput
		})
	},

	showInputForComment(e) {
		var comment = this.data.commentList[e.currentTarget.dataset.index]
		this.setData({
			commentSb: "回复 " + comment.nickname + ' : ',
			showInputForComment: !this.data.showInputForComment
		})
	},

	// 评论框失焦
	foldInputForComment() {
		this.setData({
			showInputForComment: !this.data.showInputForComment
		})
	},

	// 点击保存评论
	pubComment() {
		if (this.data.inputComment) {
			this.saveComment(this.data.inputComment)
		}
	},

	// 保存评论的评论
	pubCommentComment() {
		if (this.data.inputCommentComment) {
			// this.setData({
			// 	inputComment: this.data.commentSb + this.data.inputCommentComment
			// })
			// this.pubComment()
			this.saveComment(this.data.commentSb + this.data.inputCommentComment)
		}
	},

	// 保存
	saveComment(content) {
		wx.showModal({
			content: '确定保存评论',
			success: async (e) => {
				if (e.confirm) {
					wx.cloud.callFunction({
						name: 'savePostComment',
						data: {
							postId: this.data.post._id,
							comment: content,
						}
					}).then(res => {
						wx.showToast({
							title: '保存成功',
							icon: 'none'
						});
						this.refreshComment()
					})
				}
			}
		})
	},

	keyboardHeightChange(e) {
		console.log(e)
	},

	giveLike() {
		this.setData({
			showPopup: !this.data.showPopup
		})
	},

	cancelLike() {
		this.setData({
			chosenPopupItemIndex: -1
		})
	},

	closePopup() {
		this.setData({
			showPopup: !this.data.showPopup
		})
	},

	tapLikeItem(e) {
		console.log(e)
		this.setData({
			chosenPopupItemIndex: e.currentTarget.dataset.index,
			showPopup: !this.data.showPopup
		})
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		var now = this.data.chosenPopupItemIndex
		var origin = this.data.originChosenPopupItemIndex

		// 给出了新点赞
		if (now != -1 && origin == -1) {
			wx.cloud.callFunction({
				name: 'savePostLike',
				data: {
					postId: this.data.post._id,
					postAuthorOpenId: this.data.post._openid,
					value: this.data.popupItem[this.data.chosenPopupItemIndex].value,
					valueIndex: this.data.chosenPopupItemIndex
				}
			})
		// 取消了之前的点赞
		} else if (now == -1 && origin != -1) {
			wx.cloud.callFunction({
				name: 'removePostLike',
				data: {
					postId: this.data.post._id,
				}
			})
		// 改变了点赞数量
		} else if (now != origin) {
			wx.cloud.callFunction({
				name: 'updatePostLike',
				data: {
					postId: this.data.post._id,
					value: this.data.popupItem[this.data.chosenPopupItemIndex].value,
					valueIndex: this.data.chosenPopupItemIndex
				}
			})
		}
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})