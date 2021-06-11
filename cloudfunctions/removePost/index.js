// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

function fileListTrans(fileList) {
	var fileListTraned = []
	for (var i = 0; i < fileList.length; i++) {
		fileListTraned.push(fileList[i].url)
	}
	return fileListTraned
}

// 云函数入口函数
exports.main = async (event, context) => {

	var fileList = []
	await db.collection('t_post').doc(event.postId).get().then(res => {
		if (res.data.photoList) {
			fileList = res.data.photoList
			fileListTraned = fileListTrans(fileList)
			cloud.deleteFile({
				fileList: fileListTraned
			})
		}
	})

	db.collection('t_post').doc(event.postId).remove()

}