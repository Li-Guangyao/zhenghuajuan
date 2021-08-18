const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const TOKEN = "dOXi^w$7D0BOwG!UIA";

exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;
	
	var data = event.post;
	
	var test = event.token == TOKEN;
	if (test && event.openid) 
		data._openid = event.openid;

	if (!test) {
		if (data._openid != openid) throw new Error("OPENID不一致！")
		if (data.likeValue != 0 || 
			data.comments.length > 0 ||
			data.likes.length > 0) throw new Error("初始参数错误")

		if (data.anonyFoodId) 
			data.anonyFoodDesc = processAnony();

		if (data.videoList.length > 0)
			data.status = 0;

		if (data.location) 
			data.coordinate = new db.Geo.Point(
				Number(data.location.longitude), 
				Number(data.location.latitude))

		data.createdAt = new Date()
	}

	return db.collection('t_post').add({ data: event.post })

}

// 处理匿名数据
processAnony = function() {
	var descs = ["美味", "诱人", "卓越", "黯淡无光", "隔壁家", "精致", "饱满", "光芒四射", "楼上", "楼下", "金色", "粗糙", "普通", "家门口"]
	return descs[Math.floor(Math.random() * descs.length)] + "的"
}

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
