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
		coordinate: event.location? new db.Geo.Point(Number(event.location.longitude), Number(event.location.latitude)):null,

		photoList: event.uploadedFileList.uploadedPhotoList,
		videoList: event.uploadedFileList.uploadedVideoList,
		typeList: event.uploadedFileList.typeList,

		isAnonymous: event.isAnonymous,

		// 图片自动审核，通过了才会保存帖子
		// 如果有视频，就必须人工审核，状态为0
		status: event.uploadedFileList.uploadedVideoList.length == 0 ? 1 : 0,
		createdAt: new Date(),
		likeValue: 0
	}

	if (event.rollName && event.rollCount && event.rollCount) {
		data.rollName = event.rollName
		data.rollCount = parseInt(event.rollCount)
		data.rollDuration = parseInt(event.rollDuration)
	}

	return db.collection('t_post').add({data})
}