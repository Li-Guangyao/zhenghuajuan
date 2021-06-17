//获取标准的时间格式yyyy-mm-dd hh:mm，而非时间戳
import judgeImageFormat from '../../utils/judgeImageFormat'
import uploadMedia from '../../utils/uploadImage'

Page({
	data: {
		content: '',
		location: null,
		fileList: [],
		userInfo: wx.getStorageSync('userInfo')
	},

	onLoad: function (options) {
		this.judgeLogin()

		var tempPost = wx.getStorageSync('tempPost')
		if (tempPost) {
			this.setData({
				content: tempPost.content,
				location: tempPost.location,
				fileList: tempPost.fileList,
			})
		}
	},

	judgeLogin() {
		var userInfo = wx.getStorageSync('userInfo')
		if (!userInfo) {
			wx.showModal({
				title: '卷王同志，请先登陆再来',
				showCancel: true,

				success(res) {
					if (res.confirm) {
						wx.switchTab({
							url: '../my/my',
						})
					} else if (res.cancel) {
						wx.navigateBack({
							delta: 1,
						})
					}
				}
			})
		} else {
			this.setData({
				userInfo: userInfo
			})
		}
	},

	// 获取用户位置
	getLocation() {
		wx.chooseLocation({
			success: res => {
				console.log(res)
				if (res.name) {
					this.setData({
						location: res
					})
				} else {
					// 用户没有选择一个地址，所以没有具体的地名
				}
			},
			fail: res => {
				console.log(res)
				if (res.errMsg == "chooseLocation:fail auth deny") {
					wx.showModal({
						title: '点击右上角，授权获取位置信息',
						showCancel: true,
						success(res) {
							if (res.confirm) {
								wx.openSetting()
							}
						}
					})
				} else {
					// 可能是点击了取消按钮，所以获取失败
				}
			}
		})
	},

	// 去除这个位置信息
	removeLocation() {
		this.setData({
			location: null
		})
	},

	// 选择一些图片
	// upload选择完会触发这个函数，把所有选择的图片生成临时地址
	chosenImage(e) {

		var openId = this.data.userInfo._openid
		var fileList = e.detail.file
		var oldArrayLength = this.data.fileList.length
		var newArrayLength = fileList.length

		console.log(fileList)

		for (var i = oldArrayLength, len = oldArrayLength + newArrayLength; i < len; i++) {
			var item = 'fileList[' + i + ']'
			var imageFormat = judgeImageFormat(fileList[i - oldArrayLength].url)
			this.setData({
				[item]: {
					type: fileList[i - oldArrayLength].type,
					url: fileList[i - oldArrayLength].url,
					name: openId + '-' + Date.now() + '-' + i + '.' + imageFormat,
				}
			})
		}
	},

	//删除点击的图片
	removeImage(e) {
		this.data.fileList.splice(e.detail.index, 1)
		//然后赋值回去，更新前端
		this.setData({
			fileList: this.data.fileList
		})
	},

	// 点击预览
	previewMedia(e) {
		console.log(e)
		wx.previewMedia({
			sources: this.data.fileList,
			current: e.detail.index,
			showmenu: true,
		})
	},

	// 点击发布按钮
	publishPost() {
		if (this.data.content == '') {
			wx.showToast({
				title: '内容不能为空！',
				icon: 'none'
			});
		} else {
			wx.showModal({
				content: '确定要发布吗？',
				success: async (e) => {
					if (e.confirm) {
						wx.showLoading({
							title: '保存中',
						})
						var uploadedFileList = await this.getFileID()
						console.log(uploadedFileList)
						this.savePost(uploadedFileList)
					}
				}
			})
		}
	},

	// 把fileList分成photo和video两个列表，分别上传
	// 最后得到两个列表
	async getFileID() {
		var fileList = this.data.fileList
		var photoList = []
		var videoList = []
		var typeList = []

		for (var i = 0; i < fileList.length; i++) {
			if (fileList[i].type == 'image') {
				photoList.push(fileList[i])
			} else if (fileList[i].type == 'video') {
				videoList.push(fileList[i])
			}
			typeList.push(fileList[i].type)
		}

		var uploadedPhotoList = await uploadMedia(photoList, 'postPhoto')
		var uploadedVideoList = await uploadMedia(videoList, 'postVideo')

		return {
			uploadedPhotoList,
			uploadedVideoList,
			typeList
		}
	},

	// 执行储存
	async savePost(uploadedFileList) {
		if (await this.checkPost(uploadedFileList.uploadedPhotoList)) {
			wx.cloud.callFunction({
				name: 'savePost',
				data: {
					content: this.data.content,
					location: this.data.location,
					uploadedFileList: uploadedFileList,
				}
			}).then(async (res) => {
				// 直接调用上一页的刷新，然后再返回
				// 让新发布的帖子显示到主页
				var pages = getCurrentPages()
				var beforePage = pages[pages.length - 2]
				beforePage.refreshPage()

				wx.hideLoading()

				setTimeout(() => {
					wx.removeStorageSync('tempPost')
				}, 1000);

				wx.navigateBack({
					delta: 1,
				})

				wx.showToast({
					title: '发布成功',
					icon: "success"
				});
			})
		} else {
			wx.showToast({
				icon: 'error',
				title: '没有通过审核',
			})
		}
	},

	// 退出设置缓存
	onUnload: function () {
		wx.setStorage({
			key: 'tempPost',
			data: {
				content: this.data.content,
				location: this.data.location,
				fileList: this.data.fileList,
			}
		})
	},

	// 内容安全检查
	async checkPost(uploadedPhotoList) {
		const postPhotoList = this.getPhotoPath(uploadedPhotoList)

		const res = await wx.cloud.callFunction({
			name: 'checkPost',
			data: {
				postContent: this.data.content,
				postPhotoList: postPhotoList
			}
		})
		
		console.log(res)
		return res.result

		// wx.request({
		// 	url: 'https://api.weixin.qq.com/wxa/media_check_async?access_token=' + accessToken,
		// 	data: {
		// 		media_url: this.data.fileList[0].url,
		// 		media_type: 2
		// 	},
		// 	method: 'POST',
		// 	success: function(res){
		// 		console.log(res)
		// 	}
		// })

		// wx.request({
		// 	url: 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + accessToken,
		// 	data: {
		// 		content: this.data.content,
		// 	},
		// 	method: 'POST',
		// 	success: function(res){
		// 		console.log(res)
		// 	}
		// })
	},

	getPhotoPath(photoList) {
		var photoListTrans = []
		for (var i = 0; i < photoList.length; i++) {
			//获取最后一个/的位置
			var index = photoList[i].indexOf("/", 10);
			//获取后缀
			photoListTrans.push(photoList[i].substr(index + 1))
		}
		return photoListTrans;
	}
})