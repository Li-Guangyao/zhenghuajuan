import Post from "./post";
import DateUtils from '../../utils/dateUtils';
import UserManager from "../userModule/userManager";

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
	this.timeDiff = '';
	this.userInfo = null;

	Object.assign(this.data, data);

	this._generateTimeDiff();
	this._getUserInfo();
};

PostComment.prototype.getUserInfo = async function() {
	return this.userInfo ||= await UserManager.get(this.data._openid);
}

PostComment.prototype._generateTimeDiff = function() {
	this.timeDiff = DateUtils.getDateOff(this.data.createdAt);	
}

// 回复的评论对象
PostComment.prototype.replyComment = function() {
	var index = this.data.replyIndex;
	return index ? this.post.data.comments[index] : null;
}

/**
 * 内容审核
 */
PostComment.prototype.check = async function() {
	return await CFM.call(Post.CheckCFName, null, {
		postContent: this.data.content
	});
}

export default PostComment;