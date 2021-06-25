// components/postDisplay/postDisplay.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		userInfo: {
			type: Object,
			value: null
		},

		postList: {
			type: Array,
			value: null
		},
		post: {
			type: Object,
			value: null
		},
		commentList: {
			type: Array,
			value: []
		},

		bindtap: {
			type: String,
			value: "tapPost"
		},
		imagetap: {
			type: String,
			value: "previewMadia"
		},
		videotap: {
			type: String,
			value: "previewMadia"
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 评论帖子的输入框
		showInput: false,
		// 评论评论的输入框
		showInputForComment: false,
		// 针对帖子的评论
		inputComment: null,
		// 针对评论的评论
		inputCommentComment: null,
		// 回复+用户名+：
		commentSb: null,

		// 点赞选项
		curLikePost: null,

		showLikePopup: false,
		likeItemIndex: -1,
		oriLikeItemIndex: -1,

		// 点赞的选项
		likeItems: [{
			name: '卷王非你莫属，我五体投地', value: 8
		}, {
			name: '大佬太强了，不要再卷了', value: 4
		}, {
			name: '给个鼓励~', value: 2
		}, {
			name: '还不够卷啊！', value: 1
		}],
	},

	lifetimes: {

	},

	pageLifetimes: {

    hide: function() {
      this.uploadLikes();
    },
	},

	/**
	 * 组件的方法列表
	 */
	methods: {

		openId() {
			return this.properties.userInfo._openid;
		},

		// 帖子
		// 当前帖子
		currentPost(e) {
			if (this.properties.post)
				return this.properties.post;

			var index = e.currentTarget.dataset.index;
			return this.properties.postList[index];
		},

		tapPost(e) {
			if (this.properties.post) return;

			// var post = JSON.stringify(this.data.postList[index])
			var index = e.currentTarget.dataset.index
			var post = JSON.stringify(this.currentPost(e));

			wx.navigateTo({
				url: '../postDetail/postDetail?post=' + post + '&postIndex=' + index,
			})
		},

		// 点击视频或者图片预览
		previewMadia(e) {
			var post = this.currentPost(e);
			var index2 = e.currentTarget.dataset.index2

			wx.previewMedia({
				sources: post.fileList,
				current: index2,
				showmenu: true,
			})
		},

		// 刷新数据列表
		refreshPosts() {
			this.setData({
				post: this.properties.post,
				postList: this.properties.postList
			})
		},

		// 交互

		// 点赞
		// 点击了点赞的按钮，弹出popup
		giveLike(e) {
			var post = this.currentPost(e);
			this.setData({ curLikePost: post })

			if (this.openId() == post._openid) {
				wx.showToast({
					title: '自己不能给自己点赞哟',
					icon: 'none'
				})
			} else this.showLikePopup();
		},

		// 给出赞之后，图标变为彩色，再次点击直接变为无色，即取消点赞
		cancelLike(e) {
			console.info(e);
			var post = this.currentPost(e);
			if (post.likeIndex == -1) return;

			var likeItem = this.data.likeItems[post.likeIndex];

			post.likeIndex = -1;
			post.likeValue -= likeItem.value;

			this.refreshPosts();
		},

		// 显示点赞提示框
		showLikePopup() {
			this.setData({ showLikePopup: true })
		},

		// 关闭点赞提示框
		closeLikePopup() {
			this.setData({ showLikePopup: false })
		},
	
		// 在popup中选择一项
		tapLikeItem(e) {
			var post = this.data.curLikePost;
			var likeIndex = e.currentTarget.dataset.index;

			if (post.likeIndex != likeIndex) {

				var oriLikeItem = this.data.likeItems[post.likeIndex];
				var likeItem = this.data.likeItems[likeIndex]

				var oriLikeValue = oriLikeItem ? oriLikeItem.value : 0;

				post.likeIndex = likeIndex;
				post.likeValue += likeItem.value;

				this.refreshPosts();
			}
			this.closeLikePopup();
		},
		
		// 上传所有点赞数据
		async uploadLikes() {
			var postList = this.properties.postList;
			if (this.properties.post) 
				await this.uploadLike(this.properties.post);
			else 
				for (var i = 0; i < postList.length; ++i)
					await this.uploadLike(postList[i]);
		},

		// 上传点赞数据
		async uploadLike(post) {

			var oriLikeItem = this.data.likeItems[post.oriLikeIndex];
			var likeItem = this.data.likeItems[post.likeIndex];

			var oriLikeValue = oriLikeItem ? oriLikeItem.value : 0;
			var likeValue = likeItem ? likeItem.value : 0;

			if (oriLikeValue == likeValue) return;

			if (likeValue == 0) { // 取消点赞
				await wx.cloud.callFunction({
					name: 'removePostLike',
					data: {
						postId: post._id,
						originValue: oriLikeValue
					}
				})
			} else if (oriLikeValue == 0) { // 新增点赞
				await wx.cloud.callFunction({
					name: 'savePostLike',
					data: {
						postId: post._id,
						postAuthorOpenId: post._openid,
						valueIndex: post.likeIndex,
						value: likeValue,
					}
				})
			} else { // 修改点赞
				await wx.cloud.callFunction({
					name: 'updatePostLike',
					data: {
						postId: post._id,
						valueIndex: post.likeIndex,
						value: likeValue,
						originValue: oriLikeValue
					}
				})
			}
		},
		
		// 评论
		// 点击评论按钮
		tapComment(e) {
			if (this.properties.post) this.showInput();
			else this.tapPost(e);
		},

		// 评论评论
		currentComment(e) {
			if (!this.properties.post) return null;
			return this.properties.commentList[e.currentTarget.dataset.index];
		},

		// 点击了评论图标
		showInput() {
			if (!this.properties.post) return;
			this.setData({ showInput: true })
		},

		// 评论框失焦
		foldInput() {
			if (!this.properties.post) return;
			this.setData({ showInput: false })
		},

		// 评论评论
		showInputForComment(e) {
			if (!this.properties.post) return;

			var comment = this.currentComment(e);
			this.setData({
				commentSb: "回复 " + comment.nickname + ' : ',
				showInputForComment: true
			})
		},

		// 评论框失焦
		foldInputForComment() {
			if (!this.properties.post) return;
			this.setData({ showInputForComment: false })
		},

		// 点击保存评论
		pubComment() {
			if (!this.properties.post) return;

			if (this.data.inputComment)
				this.saveComment(this.data.inputComment)
		},

		// 保存评论的评论
		pubCommentComment() {
			if (!this.properties.post) return;

			if (this.data.inputCommentComment) {
				var content = this.data.commentSb + this.data.inputCommentComment;
				this.saveComment(content)
			}
		},

		inputCommentChange(e) {
			if (!this.properties.post) return;

			this.setData({ inputComment: e.detail.value })
		},

		inputCommentCommentChange(e) {
			if (!this.properties.post) return;
			
			this.setData({ inputCommentComment: e.detail.value })
		},

		// 保存评论
		saveComment(content) {
			if (!this.properties.post) return;
			
			wx.showLoading({ title: '保存中' })
			var commentList = this.properties.commentList;

			wx.cloud.callFunction({
				name: 'savePostComment',
				data: {
					postId: this.properties.post._id,
					comment: content,
				}
			}).then(res => {
				wx.showToast({
					title: '保存成功',
					icon: 'none'
				});
				commentList.push({
					...this.properties.userInfo,
					timeDiff: "刚刚", content
				})
				this.setData({ commentList })
			}).finally(wx.hideLoading);
		},

		// 删除评论
		deleteComment(e) {
			if (!this.properties.post) return;

			var comment = this.currentComment(e);
			
			// 必须是本人的才能删除
			if (this.openId() == comment._openid) {
				var cIndex = e.currentTarget.dataset.index;
				var commentList = this.properties.commentList;

				wx.cloud.callFunction({
					name: 'removeComment',
					data: { commentId: comment._id },
					success: res => {
						commentList.splice(cIndex, 1)
						this.setData({ commentList })
					}
				})
			}
		},


	}
})
