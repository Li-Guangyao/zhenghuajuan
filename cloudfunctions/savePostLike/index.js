// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
	// SAVE

	var queryLike = db.collection('t_post_like').where({
		_openid: event._openid, postId: event.postId,
	});
	var queryPost = db.collection('t_post').doc(event.postId);
	var queryUser = db.collection('t_user').where({
		_openid: event._openid,
	})

	var like = (await queryLike.get()).data[0];

	var oriExist = !!like;
	var oriValue = oriExist ? like.value : 0;
	
	// 原本没有数据
	if (!oriExist) {
		like = {
			_openid: event._openid,
			postId: event.postId,
			postAuthor_openid: event.postAuthorOpenId,
			value: event.value,
			valueIndex: event.valueIndex,
			createdAt: new Date()
		};
		// 创建数据
		db.collection('t_post_like').add({data: like});
	} else {
		like.value = event.value;
		like.valueIndex = event.valueIndex;

		if (like.value == 0) // 新数据为取消操作
			queryLike.remove();
		else 
			queryLike.update({data: like});
	}

	var deltaValue = event.value - oriValue;
	var post = (await queryPost.get()).data;

	queryPost.update({
		data: { likeValue: _.inc(deltaValue) }
	})
	queryUser.update({
		data: { rollCount: _.inc(deltaValue) }
	})
	
	return post.likeValue + deltaValue;
}