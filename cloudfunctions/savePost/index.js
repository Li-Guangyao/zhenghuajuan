const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {

	var data = {
		_openid: event.userInfo.openId,

		content: event.content,
		location: event.location ? {
			address: event.location.address,
			name: event.location.name
		} : null,
		coordinate: event.location ? new db.Geo.Point(Number(event.location.longitude), Number(event.location.latitude)) : null,

		isAnonymous: event.isAnonymous,

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
	}

	return db.collection('t_post').add({ data })
}