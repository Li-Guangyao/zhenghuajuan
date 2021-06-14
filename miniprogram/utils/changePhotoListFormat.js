//改变t_post数据库结构
//原来的图片和视频都存在photoList里面，现在图片存在photoList，视频存在videoList
//为了保持图片和视频的加载顺序不混乱，用此函数把新的储存格式调整回老的显示格式
export default async function changePhotoListFormat() {
	const db = wx.cloud.database()

	// var postList = await db.collection('t_post').aggregate().skip(20).end().then(res => {
	// 	return res.list
	// })
	// var postList = await db.collection('t_post').get()

	console.log(postList)

	for (var i = 0; i < postList.length; i++) {
		db.collection('t_post').doc(postList[i]._id).update({
			data: {
				status: 1
			}
		}).then(res => {
			console.log(res)
		}).catch(err => {
			console.log(err)
		})
	}

	// for (var i = 0; i < postList.length; i++) {
	// 	var photoList = []
	// 	var videoList = []
	// 	var typeList = []

	// 	if (postList[i].photoList) {
	// 		for (var j = 0; j < postList[i].photoList.length; j++) {
	// 			if (postList[i].photoList[j].type == 'image') {
	// 				photoList.push(postList[i].photoList[j].url)
	// 			} else if (postList[i].photoList[j].type == 'video') {
	// 				videoList.push(postList[i].photoList[j].url)
	// 			}
	// 			typeList.push(postList[i].photoList[j].type)
	// 		}
	// 	}

	// 	db.collection('t_post').doc(postList[i]._id).update({
	// 		data: {
	// 			photoList: photoList,
	// 			videoList: videoList,
	// 			typeList: typeList
	// 		}
	// 	}).then(res => {
	// 		console.log(res)
	// 	}).catch(err => {
	// 		console.log(err)
	// 	})
	// }
}