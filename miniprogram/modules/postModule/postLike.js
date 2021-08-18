import Post from "../../data/post";

function PostLike() {
	this.initialize.apply(this, arguments);
}

PostLike.prototype.initialize = function(post, data) {

	this.post = post;
	this.data = {
		_openid: null, // 点赞用户openid

		value: 0, // 点赞值
		likeIndex: 0, // 点赞项下标
	
		createdAt: null, // new Date() 点赞日期
	}
	Object.assign(this.data, data);
};

export default PostLike;