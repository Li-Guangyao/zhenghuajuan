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

// 当前浏览的帖子
PostManager.curPost = null;
// 当前加载的帖子列表
PostManager.posts = []

/**
 * 发布帖子
 * @param {Post} post 帖子
 */
PostManager.add = async function(post) {
	if (!(await post.check()))
		throw new Error("未通过审核！");

	var data = await CFM.call(this.CF.Post, 
		"add", { post: post.data });
	return post.data = data; // 没有Comment和Like
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

	var dataList = await CFM.call(this.CF.Post, "get_all", 
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

	var dataList = await CFM.call(this.CF.Post, "get_user", 
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

	var dataList = await CFM.call(this.CF.Post, "get_my", 
		{skipNum, newestDate, cond});

	return this._processPosts(dataList);
}

/**
 * 清空已有缓存的帖子
 */
PostManager.clearPosts = function() {
	this.posts = [];
}

/**
 * 查询指定帖子详情（分页）
 * @param {String} postId 帖子ID
 */
PostManager.getOne = async function(postId) {
	var data = await CFM.call(this.CF.Post, "get_one", {postId});

	return this._processPost(data);
}

// 内部调用
PostManager._processPosts = function(dataList) {
	var res = [];
	dataList.forEach(d => {
		// 剔除相同ID
		if (!this.posts.find(p => p.data._id == d._id)) {
			var post = this._processPost(d);
			this.posts.push(post);
			res.push(post);
		}
	})
	return res;
}
PostManager._processPost = function(data) {
	return new Post(data);
}

/**
 * 删除帖子
 * @param {String} postId 帖子ID
 */
PostManager.delete = async function(postId) {
	return await CFM.call(this.CF.Post, "delete", { postId });
}

/**
 * 发布评论
 * @param {String} postId 帖子ID
 * @param {PostComment} comment 评论对象
 */
PostManager.addComment = async function(postId, comment) {
	if (!(await comment.check())) 
		throw new Error("未通过审核！");

	return await CFM.call(this.CF.PostComment, "add", 
		{ postId, comment: comment.data });
}

/**
 * 删除评论
 * @param {String} postId 帖子ID
 * @param {Number} cIndex 评论索引
 */
PostManager.deleteComment = async function(postId, cIndex) {
	return await CFM.call(this.CF.PostComment, "delete", 
		{ postId, cIndex });
}

/**
 * 点赞
 * @param {String} postId 帖子ID
 * @param {PostLike} like 点赞对象
 */
PostManager.likePost = async function(postId, like) {
	return await CFM.call(this.CF.PostLike, null, 
		{ postId, like: like ? like.data : null });
}

export default PostManager;