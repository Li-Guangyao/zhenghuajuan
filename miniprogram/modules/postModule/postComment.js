import Post from "./post";
import DateUtils from '../../utils/dateUtils';
import UserManager from "../userModule/userManager";
import CFM from '../coreModule/cloudFuncManager';

function PostComment() {
	this.initialize.apply(this, arguments);
}

PostComment.prototype.initialize = function(post, data) {

	// this.post = post;
	this.data = {
		index: 0, // 评论序号
		_openid: null, // 评论用户openid
		content: '', // 内容

		replyIndex: null, // 回复的评论的index
	
		createdAt: null, // new Date() 发布日期

		isDeleted: false // 是否已删除
	}
	Object.assign(this.data, data);

	this.timeDiff = '';
	this.userInfo = null;

	this.canDelete = false;

	this._getTimeDiff();
	this.refresh();
};

PostComment.prototype.refresh = function() {
	this.getUserInfo();
}

PostComment.prototype.getUserInfo = async function() {
	var openid = this.data._openid;
	var curOpenid = UserManager.openid();
	this.userInfo ||= await UserManager.get(openid);
	this.canDelete = openid == curOpenid; // || this.post.isSelfPost;
	return this.userInfo;
}

PostComment.prototype._getTimeDiff = function() {
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