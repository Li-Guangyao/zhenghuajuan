// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

	return db.collection('t_post').add({
		data: {
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

			// 图片自动审核，通过了才会保存帖子
			// 如果有视频，就必须人工审核，状态为0
			status: event.uploadedFileList.uploadedVideoList.length == 0 ? 1 : 0,
			createdAt: new Date(),
			likeValue: 0
		}
	})
}