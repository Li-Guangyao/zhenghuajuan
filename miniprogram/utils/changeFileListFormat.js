export default function changeFileListFormat(postList) {
	for (var i = 0; i < postList.length; i++) {
		postList[i].fileList = []
		var photoListIdx = 0
		var videoListIdx = 0
		for (var j = 0; j < postList[i].typeList.length; j++) {
			if (postList[i].typeList[j] == 'image') {
				postList[i].fileList.push({
					url: postList[i].photoList[photoListIdx],
					type: 'image'
				})
				photoListIdx++
			} else if (postList[i].typeList[j] == 'video') {
				postList[i].fileList.push({
					url: postList[i].videoList[videoListIdx],
					type: 'video'
				})
				videoListIdx++
			}
		}
	}

	return postList
}