import getDateDiff from "../../utils/getDateDiff"

Page({
	data: {
		userInfo: null,
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

		postIndex: null
	},

	onLoad: function (e) {
		this.judgeLogin()

		wx.showLoading({
			title: '加载中',
		})

		var post = JSON.parse(e.post)
		this.setData({
			post: post,
			postIndex: e.postIndex
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

		wx.hideLoading({
			success: (res) => {},
		})
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
			sources: this.data.post.fileList,
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

	// 评论评论
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

	deleteComment(e) {
		// 必须是本人的才能删除
		if (this.data.userInfo._openid == this.data.commentList[e.currentTarget.dataset.index]._openid) {
			wx.cloud.callFunction({
				name: 'removeComment',
				data: {
					commentId: this.data.commentList[e.currentTarget.dataset.index]._id
				},
				success: res => {
					this.data.commentList.splice(e.currentTarget.dataset.index, 1)
					this.setData({
						commentList: this.data.commentList
					})
				}
			})
		}

	},

	// 保存评论的评论
	pubCommentComment() {
		if (this.data.inputCommentComment) {
			var content = this.data.commentSb + this.data.inputCommentComment
			console.log(content)
			this.saveComment(content)
		}
	},

	inputCommentChange(e) {
		this.setData({
			inputComment: e.detail.value
		})
	},

	inputCommentCommentChange(e) {
		this.setData({
			inputCommentComment: e.detail.value
		})
	},

	// 保存
	saveComment(content) {
		wx.showLoading({
			title: '保存中',
		})
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
		wx.hideLoading()
	},

	keyboardHeightChange(e) {
		console.log(e)
	},

	// 点击了点赞的按钮，弹出popup
	giveLike() {
		if (this.data.userInfo._openid == this.data.post._openid) {
			wx.showToast({
				title: '自己不能给自己点赞哟',
				icon: 'none'
			})
		} else {
			this.setData({
				showPopup: !this.data.showPopup
			})
		}
	},

	// 给出赞之后，图标变为彩色，再次点击直接变为无色，即取消点赞
	cancelLike() {
		var item = 'post.likeValue'
		this.setData({
			chosenPopupItemIndex: -1,
			[item]: this.data.post.likeValue - this.data.popupItem[this.data.chosenPopupItemIndex].value
		})
	},

	// 再次点击就关闭
	closePopup() {
		this.setData({
			showPopup: !this.data.showPopup
		})
	},

	// 在popup中选择一项
	tapLikeItem(e) {
		var item = 'post.likeValue'
		this.setData({
			chosenPopupItemIndex: e.currentTarget.dataset.index,
			showPopup: !this.data.showPopup,
			[item]: this.data.post.likeValue + this.data.popupItem[e.currentTarget.dataset.index].value
		})
	},

	onUnload: function () {
		var now = this.data.chosenPopupItemIndex
		var origin = this.data.originChosenPopupItemIndex

		var pages = getCurrentPages();
		var prevPage = pages[pages.length - 2]; //上一个页面
		var item = 'postList[' + this.data.postIndex + '].likeValue'

		// 给出了新点赞
		if (now != -1 && origin == -1) {
			wx.cloud.callFunction({
				name: 'savePostLike',
				data: {
					postId: this.data.post._id,
					postAuthorOpenId: this.data.post._openid,
					value: this.data.popupItem[now].value,
					valueIndex: now
				}
			})
			// 取消了之前的点赞
		} else if (now == -1 && origin != -1) {
			wx.cloud.callFunction({
				name: 'removePostLike',
				data: {
					postId: this.data.post._id,
					originValue: this.data.popupItem[origin].value
				}
			})
			// 改变了点赞数量
		} else if (now != origin) {
			wx.cloud.callFunction({
				name: 'updatePostLike',
				data: {
					postId: this.data.post._id,
					value: this.data.popupItem[now].value,
					valueIndex: now,
					originValue: this.data.popupItem[origin].value
				}
			})
		}

		prevPage.setData({
			[item]: this.data.post.likeValue
		});
	}
})