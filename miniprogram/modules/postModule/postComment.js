import Post from "./post";

function PostComment() {
	this.initialize.apply(this, arguments);
}

PostComment.prototype.initialize = function(post, data) {

	this.post = post;
	this.data = {
		index: 0, // 评论序号
		_openid: null, // 评论用户openid
		content: '', // 内容

		replyIndex: null, // 回复的评论的index
	
		createdAt: null, // new Date() 发布日期

		isDeleted: false // 是否已删除
	}
	Object.assign(this.data, data);
};

// 回复的评论对象
PostComment.prototype.replyComment = function() {
	var index = this.data.replyIndex;
	return index ? this.post.data.comments[index] : null;
}

export default PostComment;