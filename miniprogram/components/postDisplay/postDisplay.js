import FoodManager from "../../modules/foodModule/foodManager"
import PostManager from "../../modules/postModule/postManager"
import UserManager from "../../modules/userModule/userManager"
import NavigateUtils from "../../utils/navigateUtils"
import PostComment from "../../modules/postModule/postComment"
import PostLike from "../../modules/postModule/postLike"

Component({

	properties: {
		showDelete: {
			type: Boolean,
			value: false
		},

		posts: {
			type: Array,
			value: null
		},
		post: {
			type: Object,
			value: null
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
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 菜品数据
		foods: [],

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
			name: '卷王非你莫属，我五体投地',
			value: 4
		}, {
			name: '大佬太强了，不要再卷了',
			value: 3
		}, {
			name: '给个鼓励~',
			value: 2
		}, {
			name: '还不够卷啊！',
			value: 1
		}],
	},

	lifetimes: {
		attached: async function() {
			this.setData({ foods: FoodManager.foods });
		}
	},

	methods: {
		openid: () => UserManager.openid(),

		// 帖子
		// 当前帖子
		currentPost(e) {
			if (this.properties.post)
				return this.properties.post;

			var index = e.currentTarget.dataset.index;
			return this.properties.posts[index];
		},

		tapPost(e) {
			if (this.properties.post) return;

			PostManager.curPost = this.currentPost(e);
			NavigateUtils.push('../postDetail/postDetail')
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
			if (this.properties.post)
				this.properties.post.refresh();
			if (this.properties.posts)
				this.properties.posts.forEach(p => p.refresh());
				
			this.setData({
				post: this.properties.post,
				posts: this.properties.posts
			})
		},

		// 交互

		// 删除
		async deletePost(e) {
			var posts = this.properties.posts;
			var postId = this.currentPost(e).data._id;
			var index = e.currentTarget.dataset.index;

			var res = await wx.showModal({
				content: '确定删除'
			})

			if (!res.confirm) return;

			await PostManager.delete(postId);
			wx.showToast({
				title: '删除成功', icon: 'none'
			});

			if (this.properties.post) // 如果是单个帖子的页面
				NavigateUtils.pop();
			else if (posts) { // 否则有多个帖子
				posts.splice(index, 1);
				this.refreshPosts();
			}
		},

		// 点赞
		// 点击了点赞的按钮，弹出popup
		giveLike(e) {
			var post = this.currentPost(e);
			this.setData({ curLikePost: post })

			if (this.openid() == post.data._openid)
				wx.showToast({
					title: '自己不能给自己点赞哟',
					icon: 'none'
				})
			else this.showLikePopup();
		},

		// 给出赞之后，图标变为彩色，再次点击直接变为无色，即取消点赞
		async cancelLike(e) {
			var post = this.currentPost(e);
			if (!post.curLike) return; // 已经没有点赞了
			post.removeLike();

			await uploadLike(post);
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
		async tapLikeItem(e) {
			var post = this.data.curLikePost;
			var like = post.curLike;

			var likeIndex = e.currentTarget.dataset.index;
			var likeItem = this.data.likeItems[likeIndex];

			if (!like) { // 新增点赞
				like = new PostLike(post, {
					value: likeItem.value, likeIndex
				})
				post.addLike(like);
			} else if (like.likeIndex != likeIndex) { // 如果点赞有改变
				like.data.likeIndex = likeIndex;
				like.data.value = likeItem.value;
			}

			await uploadLike(post, like);

			this.closeLikePopup();
		},

		// 上传点赞数据
		async uploadLike(post, like) {
			like = like ? like.data : null;
			await PostManager.likePost(post.data._id, like);
			this.refreshPosts();
		},

		// 评论
		// 点击评论按钮
		tapComment(e) {
			if (this.properties.post) this.showInput();
			else this.tapPost(e);
		},

		// 评论评论
		currentComment(e) {
			var post = this.properties.post;
			if (!post) return null;
			
			var index = e.currentTarget.dataset.index;
			return post.data.comments[index];
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
		async showInputForComment(e) {
			if (!this.properties.post) return;

			var comment = this.currentComment(e);
			var userInfo = await comment.getUserInfo();

			this.setData({
				commentSb: "回复 " + userInfo.nickName + ' : ',
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

			if (this.data.inputCommentComment) 
				this.saveComment(this.data.commentSb + 
					this.data.inputCommentComment)
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
		async saveComment(content) {
			var post = this.properties.post;
			if (!post) return;

			var comment = new PostComment(post, { content });
			post.addComment(comment);

			await PostManager.addComment(post.data._id, comment);

			wx.showToast({
				title: '保存成功', icon: 'none'
			});

			this.refreshPosts();
		},

		canDeleteComment: function(post, comment) {
			return this.openid() == comment.data._openid ||
				this.openid() == post.data._openid;
		},

		// 删除评论
		async deleteComment(e) {
			var post = this.properties.post
			if (!post) return;

			var comment = this.currentComment(e);

			// 必须是本人/贴主才能删除
			if (!canDeleteComment) return;

			var cIndex = comment.data.index;
			post.removeComment(comment);

			await PostManager.deleteComment(post.data._id, cIndex);

			this.refreshPosts();
		},
	}
})