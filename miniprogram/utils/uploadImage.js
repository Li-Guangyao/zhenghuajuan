//上传图片至云存储
export default async function uploadImage(fileList, savePath) {
	const uploadTasks = fileList.map(file => uploadFilePromise(file, savePath))
	// uploadTasks是若干Promise对象的集合，此时已经上传成功
	// 用下面的方法，data就是提取出来的返回结果
	return Promise.all(uploadTasks).then(data => {
		//上传成功后，返回一个列表，fileID为图片的固定地址
		console.log(data)
		var uploadedFileList = []
		for (var i = 0; i < data.length; i++) {
			// 选择顺序和上传顺序相同？
			uploadedFileList.push({
				url: data[i].fileID,
				type: fileList[i].type
			})
		}
		//把固定地址返回，保存进数据库
		return uploadedFileList;
	}).catch(e => {
		wx.showToast({
			title: '上传失败',
			icon: 'none'
		});
	});
}

function uploadFilePromise(file, savePath) {
	return wx.cloud.uploadFile({
		cloudPath: savePath + '/' + file.name,
		filePath: file.url
	});
}