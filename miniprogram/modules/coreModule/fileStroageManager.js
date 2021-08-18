
function FileStroageManager() {
	this.initialize.apply(this, arguments);
}

/**
 * 上传图片至云存储，并返回永久fileID
 * @param {Array} files 文件列表
 * @param {String} path 指定储存的文件夹路径
 */
FileStroageManager.uploadFiles = async function(files, path, loading, title, mask) {
	if (loading == undefined) loading = true;
	if (mask == undefined) mask = true;
	title ||= "加载中";

	wx.showLoading({ title, mask })

	try {
		console.log("uploadFiles: ", files, path);
		var tasks = files.map(f => this._uploadFile(f, path))
		// tasks是若干Promise对象的集合，此时已经上传成功
		// 用下面的方法，data就是提取出来的返回结果
		var data = await Promise.all(tasks);
		// 把固定地址返回，保存进数据库
		return data.map(f => f.fileID);
	} catch (e) {
		console.error("uploadFiles: ", files, path, ": error: ", e)
		wx.showToast({
			title: '上传失败', icon: 'none'
		});
	} finally {
		wx.hideLoading()
	}
}

FileStroageManager._uploadFile = (file, path) =>
	wx.cloud.uploadFile({
		cloudPath: savePath + '/' + file.name,
		filePath: file.url		
	})

export default FileStroageManager;