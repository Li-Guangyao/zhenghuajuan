//获取标准的时间格式yyyy-mm-dd hh:mm，而非时间戳
import judgeImageFormat from '../../utils/judgeImageFormat'
import uploadImage from '../../utils/uploadImage'

Page({
	data: {
		content: '',
		location: null,
		fileList: [],
		userInfo: null
	},

	onLoad: function (options) {
		this.judgeLogin()
	},

	async judgeLogin() {
		var userInfo = await wx.getStorageSync('userInfo')
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

	// 输入内容(editor富文本方式，已废弃)
	// contentInput(e) {
	// 	this.setData({
	// 		content: e.detail.html
	// 	})
	// },

	// 获取用户位置
	getLocation() {
		wx.chooseLocation({
			success: res => {
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

		var nickname = this.data.userInfo.nickName
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
					name: nickname + '-' + Date.now() + '-' + i + '.' + imageFormat,
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
	previewMedia(e){
		console.log(e)
		wx.previewMedia({
			sources: this.data.fileList,
			current: e.detail.index,
			showmenu: true,

			success:res=>{
				console.log(res)
			},

			fail: err=>{
				console.log(err)
			}
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

						// 用户点击了确定
						if (this.data.fileList.length != 0) {
							var uploadedFileList = await uploadImage(this.data.fileList, 'postPhoto')
						}

						await wx.cloud.callFunction({
							name: 'savePost',
							data: {
								avatarUrl: this.data.userInfo.avatarUrl,
								nickname: this.data.userInfo.nickName,

								content: this.data.content,
								location: this.data.location,
								photoList: uploadedFileList,
							}
						}).then(res => {
							wx.hideLoading()

							// 直接调用上一页的刷新，然后在返回
							// 让新发布的帖子显示到主页
							var pages = getCurrentPages()
							var beforePage = pages[pages.length - 2]
							beforePage.refreshPage()

							setTimeout(() => {
								wx.showToast({
									title: '发布成功',
									icon: "success",
								});

								setTimeout(() => {
									wx.hideToast();
								}, 2000)
							}, 0);

							wx.navigateBack({
								delta: 1,
							})
						})
					}
				}
			})
		}
	},


	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})