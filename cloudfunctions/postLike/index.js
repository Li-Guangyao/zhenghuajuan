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
	var postId = event.postId // 帖子ID
	var like = event.like; // 帖子点赞对象（为null则取消该用户的点赞）
		
	// 函数主体
	var queryPost = db.collection('t_post').doc(postId);

	var post = (await queryPost.get()).data;
	if (!post) throw new Error("找不到对应的帖子")

	// 找到当前用户的点赞数据
	var likeIndex = post.likes.findIndex(l => l._openid == openid);
	var likeData = post.likes[likeIndex];

	var lastValue = likeData ? likeData.value : 0;
	var newValue = like ? like.value : 0;
	var updater = {};

	if (like) {
		like._openid = openid;
		like.createdAt = new Date();
	}
	
	if (!likeData && like) // 如果点赞不存在，新增点赞
		updater.likes = _.push(like);
	else if (!like) // 如果点赞已存在，且当前点赞不存在，取消
		updater.likes = _.pull({ _openid: openid });
	else { // 更新
		post.likes[likeIndex] = like;
		updater.likes = post.likes;
	}

	queryPost.update({ data: updater })
	gainRoll(post._openid, newValue - lastValue);

	// 返回帖子的总点赞数
	return post.likeValue + newValue - lastValue;
}

queryUser = openid => db.collection('t_user').where({_openid: openid})

gainRoll = (openid, value) => {
	var data = {
		_openid: openid, value, createdAt: new Date()
	}
	db.collection('t_roll_gain').add({ data })
	queryUser(openid).update({
		data: { 
			rollCount: _.inc(value),
			totalRoll: _.inc(value)
		}
	})
}