const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;

	// 测试鉴权
	var test = event.token == TOKEN;
	if (test && event.openid) openid = event.openid;

	// 函数参数
	var method = event.method;

	// return method.toUpperCase();

	switch (method.toUpperCase()) {
		case "GET_ALL": // 获取所有帖子
			var skipNum = event.skipNum; // 跳过次数
			var newestDate = event.newestDate // 最新日期
			var cond = event.cond; // 附加条件

			// 返回帖子列表
			return await getPosts(openid, null, skipNum, null, newestDate, cond);
		
		case "GET_USER": // 获取指定用户的帖子
			var userOpenid = event.userOpenid; // 指定用户openid
			var skipNum = event.skipNum; // 跳过次数
			var newestDate = event.newestDate // 最新日期
			var cond = event.cond; // 附加条件

			// 返回帖子列表
			return await getPosts(openid, userOpenid, skipNum, null, newestDate, cond);

		case "GET_MY": // 获取我的帖子
			var skipNum = event.skipNum; // 跳过次数
			var newestDate = event.newestDate // 最新日期
			var cond = event.cond; // 附加条件

			// 返回帖子列表
			return await getPosts(openid, openid, skipNum, null, newestDate, cond);

		case "GET_ONE": // 获取帖子详情
			var postId = event.postId // 帖子ID

			// 返回帖子数据
			return await getPost(postId);

		case "ADD": // 保存帖子
			var post = event.post; // 帖子数据

			// 返回保存后的帖子ID
			return await savePost(test, openid, post);

		case "DELETE": // 删除帖子
			var postId = event.postId // 帖子ID

			deletePost(postId); break;
	}
}

aggregatePosts = (matcher) => db.collection('t_post')
	.aggregate().match(matcher).sort({createdAt: -1})

queryPosts = (query) => query.lookup({
		from: 't_user',
		localField: '_openid',
		foreignField: '_openid',
		as: 'userInfo'
	}).addFields({ // 会直接替换掉
		userInfo: $.arrayElemAt(['$userInfo', 0])
	}).lookup({
		from: 't_roll_record',
		localField: 'rollRecordId', // 如果有才会连接
		foreignField: '_id',
		as: 'rollRecord'
	}).addFields({ // 会直接替换掉
		rollRecord: $.arrayElemAt(['$rollRecord', 0])
	})

queryPost = postId => db.collection('t_post').doc(postId)

// 获取单个帖子（帖子详情）
// TODO: 未完成鉴权（私有帖子其他人不能获取）
getPost = async (postId) => 
// (await aggregatePosts({_id: postId}).end()).list[0]
	(await queryPosts(aggregatePosts({_id: postId})).end()).list[0]

// 获取所有帖子
getPosts = async (openid, userOpenid, skipNum, startTime, endTime, cond) => {
	var matcher = { ...cond };

	if (typeof(startTime) == 'number') startTime = new Date(startTime);
	if (typeof(endTime) == 'number') endTime = new Date(endTime);

	// 如果看的是自己的帖子
	if (openid == userOpenid) 
		matcher.visibility = _.or(_.eq(1), _.eq(2))
	else {
		matcher.visibility = 1;
		matcher.status = 1;
	}

	if (userOpenid) matcher._openid = userOpenid;
	if (startTime && !endTime) 
		matcher.createdAt = _.gt(startTime)
	else if (!startTime && endTime) 
		matcher.createdAt = _.lt(endTime)
	else if (startTime && endTime) 
		matcher.createdAt = _.and(
			_.gt(startTime), _.lt(endTime));

	// return matcher;

	var query = aggregatePosts(matcher);
	if (skipNum) query = query.skip(skipNum - 1)

	return (await queryPosts(query).end()).list;
}

// 保存帖子
savePost = async (test, openid, data) => {
	data._openid = openid

	// 非测试模式下重置数据
	if (!test) {
		data.comments = []
		data.likes = []

		if (data.anonyFoodId) 
			data.anonyFoodDesc = processAnony();

		if (data.videoList.length > 0)
			data.status = 0;

		data.createdAt = new Date()
	}
	delete data._id;

	data._id = (await db.collection('t_post').add({data}))._id;
	return data;
}

// 处理匿名数据
processAnony = function() {
	var descs = ["美味的", "诱人的", "卓越的", "发臭的", "隔壁家的", 
	"精致的", "无敌的", "极品的", "坏掉的", "金色", "SSR", "爆肝的",
	"平凡的", "神级", "过期的", "究极美味的", "稀有的", "传说的", 
	"金黄的", "至尊", "孤独的"]
	return descs[Math.floor(Math.random() * descs.length)];
}

// 删除帖子
deletePost = (postId) => queryPost(postId).update({
	data: { visibility: 0 }
})

/*
	var post = event.post; // 帖子

	var data = {

	}

	var data = {
		_openid: event.userInfo.openId,

		content: event.content,
		location: event.location ? {
			address: event.location.address,
			name: event.location.name
		} : null,
		coordinate: event.location ? new db.Geo.Point(Number(event.location.longitude), Number(event.location.latitude)) : null,

		isAnony: event.isAnony,

		createdAt: new Date(),
		likeValue: 0,
		status: 1,
	}

	if (event.uploadedFileList) {
		data.photoList = event.uploadedFileList.uploadedPhotoList;
		data.videoList = event.uploadedFileList.uploadedVideoList;
		data.typeList = event.uploadedFileList.typeList;

		// 图片自动审核，通过了才会保存帖子
		// 如果有视频，就必须人工审核，状态为0
		data.status = event.uploadedFileList.uploadedVideoList.length == 0 ? 1 : 0
	}

	if (event.rollName && event.rollCount && event.rollCount) {
		data.rollName = event.rollName
		data.rollCount = parseInt(event.rollCount)
		data.rollDuration = parseInt(event.rollDuration)
		data.foodId = event.foodId
		data.quality = event.quality
		data.isPrivate = event.isPrivate
		data.strictMode = event.strictMode
	}

	return db.collection('t_post').add({ data })
*/
