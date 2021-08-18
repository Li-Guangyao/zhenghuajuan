import CFM from "../coreModule/cloudFuncManager"
import Post from "./post"
import PostComment from "./postComment"
import PostLike from "./postLike"

function PostManager() {
	throw new Error('This is a static class');
}

// 云函数名称
PostManager.CF = {
	Post: 'post',
	PostComment: 'postComment',
	PostLike: 'postLike'
}

/**
 * 发布帖子
 * @param {Post} post 帖子
 */
PostManager.add = async function(post) {
	if (!await post.check()) 
		throw new Error("未通过审核！");

	var postId = await CFM.call(this.Post, "add", 
		{ post: post.data });
	return post.data._id = postId;
}

/**
 * 查询所有帖子（分页）
 * @param {Number} skipNum 跳过个数
 * @param {Number | Date} newestDate 当前已获取的最老帖子的发帖时间
 * @param {Object} cond 附加参数
 */
PostManager.getAll = async function(
	skipNum, newestDate, cond) {
	if (newestDate instanceof Date)
		newestDate = newestDate.getTime();

	var dataList = await CFM.call(this.Post, "get_all", 
		{skipNum, newestDate, cond});

	return this._processPosts(dataList);
}

/**
 * 查询指定用户的帖子（分页）
 * @param {String} userOpenid 用户openid
 * @param {Number} skipNum 跳过个数
 * @param {Number | Date} newestDate 当前已获取的最老帖子的发帖时间
 * @param {Object} cond 附加参数
 */
PostManager.getUser = async function(userOpenid, 
	skipNum, newestDate, cond) {	
	if (newestDate instanceof Date)
		newestDate = newestDate.getTime();

	var dataList = await CFM.call(this.Post, "get_user", 
		{userOpenid, skipNum, newestDate, cond});
		
	return this._processPosts(dataList);
}

/**
 * 查询我的帖子（分页）
 * @param {Number} skipNum 跳过个数
 * @param {Number | Date} newestDate 当前已获取的最老帖子的发帖时间
 * @param {Object} cond 附加参数
 */
PostManager.getMy = async function(
	skipNum, newestDate, cond) {
	if (newestDate instanceof Date)
		newestDate = newestDate.getTime();

	var dataList = await CFM.call(this.Post, "get_my", 
		{skipNum, newestDate, cond});

	return this._processPosts(dataList);
}

/**
 * 查询指定帖子详情（分页）
 * @param {String} postId 帖子ID
 */
PostManager.getOne = async function(postId) {
	var data = await CFM.call(this.Post, "get_one", {postId});

	return this._processPost(data);
}

// 内部调用
PostManager._processPosts = function(dataList) {
	return dataList.map(this._processPost);
}
PostManager._processPost = function(data) {
	return new Post(data);
}

/**
 * 删除帖子
 * @param {String} postId 帖子ID
 */
PostManager.delete = async function(postId) {
	return await CFM.call(this.Post, "delete", { postId });
}

/**
 * 发布评论
 * @param {String} postId 帖子ID
 * @param {PostComment} comment 评论对象
 */
PostManager.addComment = async function(postId, comment) {
	if (!await comment.check()) 
		throw new Error("未通过审核！");

	return await CFM.call(this.PostComment, "add", 
		{ postId, comment: comment.data });
}

/**
 * 删除评论
 * @param {String} postId 帖子ID
 * @param {Number} cIndex 评论索引
 */
PostManager.deleteComment = async function(postId, cIndex) {
	return await CFM.call(this.PostComment, "delete", 
		{ postId, cIndex });
}

/**
 * 点赞
 * @param {String} postId 帖子ID
 * @param {PostLike} like 点赞对象
 */
PostManager.likePost = async function(postId, like) {
	return await CFM.call(this.PostLike, null, 
		{ postId, like: like.data });
}

export default PostManager;