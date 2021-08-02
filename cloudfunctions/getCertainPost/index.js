// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	// Id
	const postId = event.postId

	// 执行一定操作
	var result = db.collection('t_post').doc(postId).get()
	// 返回
	return result
}