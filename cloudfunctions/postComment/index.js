// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

// 云函数入口函数
exports.main = async (event, context) => {

	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;

	// 测试鉴权
	var test = event.token == TOKEN;
	if (test && event.openid) openid = event.openid;
	
	// 函数参数
	var method = event.method;

	// 函数主体
	switch (method.toUpperCase()) {
		case "ADD": // 评论帖子
			var postId = event.postId // 帖子ID
			var comment = event.comment; // 帖子评论对象

			// 返回保存后的评论数据
			return await addComment(openid, postId, comment);
		case "DELETE": // 删除帖子
			var postId = event.postId // 帖子ID
			var cIndex = event.cIndex; // 帖子评论Index

			return await deleteComment(openid, postId, cIndex); 
	}
}

queryPost = postId => db.collection('t_post').doc(postId)

// 发布评论
addComment = async (openid, postId, comment) => {
	var query = queryPost(postId);
	var post = (await query.get()).data;
	if (!post) throw new Error("找不到对应的帖子")

	comment._openid = openid
	comment.index = post.comments.length;
	comment.createdAt = new Date();

	query.update({data: {
		comments: _.push(comment)
	}})

	return comment;
}

// 删除评论
deleteComment = async (openid, postId, cIndex) => {
	var query = queryPost(postId);
	var post = (await query.get()).data;
	if (!post) throw new Error("找不到对应的帖子！")

	var comment = post.comments[cIndex];
	if (!comment) throw new Error("找不到对应的评论！")

	if (comment._openid != openid && // 当前用户不是楼主
		post._openid != openid) // 当前用户不是发帖者
		throw new Error("无法删除其他人的评论")
	
	comment.isDeleted = true;
	
	query.update({data: { comments: post.comments }})
}