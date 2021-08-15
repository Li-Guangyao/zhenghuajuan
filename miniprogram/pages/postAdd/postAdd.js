//获取标准的时间格式yyyy-mm-dd hh:mm，而非时间戳
import judgeImageFormat from '../../utils/judgeImageFormat'
import uploadMedia from '../../utils/uploadMedia'
import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		content: '',
		location: null,
		fileList: [],
		userInfo: null,
		isAnonymous: false,

		// 蒸花卷之后，导航到发帖页面
		rollName: null,
		rollCount: null,
		rollDuration: null,
		shareImgUrl:null,
		foodId: "", 
		quality: 0,

		sharing: false,
		sharePost: false
	},

	onLoad: async function (e) {
		await this.judgeLogin()

		if (e.rollName) {
			var rollName = e.rollName;
			var rollCount = e.rollCount;
			var rollDuration = e.rollDuration;
			var foodName = e.foodName;
			var shareImgUrl = e.shareImgUrl;
			var foodId = e.foodId;
			var quality = e.quality;

			var content = "我花了" + rollDuration + "分钟，制作了" + rollName + "味" + foodName + "~";
			
			var openId = this.data.userInfo._openid;

			this.data.fileList.push({
				type:'image',
				url:shareImgUrl,
				name: openId + '-' + Date.now() + '-poster.png'
			})
			this.setData({
				content, rollName, rollCount, rollDuration, foodId, quality,
				sharing: await this.loadSharingRecord(),
				fileList: this.data.fileList
			})
			console.log(this.data.fileList);
		} else {
			var tempPost = wx.getStorageSync('tempPost')
			if (tempPost) this.setData({ ...tempPost })
		}
	},

	// 读取分享数据
	loadSharingRecord: async function() {
		var res = await wx.cloud.callFunction({
			name: 'posterSharing', data: {
				method: "TODAY", type: "post"
			}
		})
		return res.result.length > 0
	},
	// 判断用户是否登录
	async judgeLogin() {
		this.setData({ userInfo: await userUtils.judgeLogin() })
	},

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
		this.setData({ location: null })
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
	async publishPost() {
		if (this.data.content == '') 
			wx.showToast({
				title: '内容不能为空！',
				icon: 'none'
			});
		else {
			var res = await wx.showModal({
				content: '确定要发布吗？'
			})

			if (res.confirm) {
				wx.showLoading({
					title: '保存中', mask: true
				})
				var uploadedFileList = await this.getFileID()
				this.savePost(uploadedFileList)
			}
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
		var rollCount = this.data.rollName ? this.data.rollCount : null;
		if (this.data.rollName && !this.data.sharing) rollCount *= 2;
		if (await this.checkPost(uploadedFileList.uploadedPhotoList)) {
			var res = (await wx.cloud.callFunction({
				name: 'savePost',
				data: {
					content: this.data.content,
					location: this.data.location,
					uploadedFileList: uploadedFileList,
					isAnonymous: this.data.isAnonymous,

					// 如果帖子属性包含这3个，就是蒸花卷记录
					rollName: this.data.rollName,
					rollCount,
					rollDuration: this.data.rollDuration,
					foodId: this.data.foodId,
					quality: this.data.quality
				}
			})).result;

			console.log(res);

			// 直接调用上一页的刷新，然后再返回
			// 让新发布的帖子显示到主页
			// var pages = getCurrentPages()
			// var beforePage = pages[pages.length - 2]
			// beforePage.refreshPage()

			if (this.data.rollName && this.data.rollCount && 
				this.data.rollDuration) {
				
				await wx.cloud.callFunction({
					name: 'saveRollRecord',
					data: {
						postId: res._id,
						postAuthorOpenId: this.data.userInfo._openid,
						count: rollCount,
						duration: this.data.rollDuration
					}
				});
				
				wx.cloud.callFunction({
					name: "posterSharing", 
					data: { method: "ADD", type: "post" }
				})
				this.setData({sharePost: true})
			}

			setTimeout(() => {
				wx.removeStorageSync('tempPost')
			}, 1000);

			wx.hideLoading()
			wx.showToast({
				title: '发布成功', icon: "success"
			});

			wx.navigateBack({ delta: 1 })

		} else {
			wx.showToast({
				icon: 'error',
				title: '没有通过审核',
			})
		}
	},

	// 退出，把已经输入的内容缓存起来
	onUnload: function () {
		// 如果是完成了，但没有去分享的话
		if (this.data.rollName && !this.data.sharePost)
			this.addPrivateRollPost();

		wx.setStorage({
			key: 'tempPost',
			data: {
				content: this.data.content,
				location: this.data.location,
				fileList: this.data.fileList,
			}
		})
	},

	// 添加一个私有的花卷记录
	addPrivateRollPost: async function() {
		var res = (await wx.cloud.callFunction({
			name: 'savePost',
			data: {
				isPrivate: true,

				// 如果帖子属性包含这3个，就是蒸花卷记录
				rollName: this.data.rollName,
				rollCount: this.data.rollCount,
				rollDuration: this.data.rollDuration,
				foodId: this.data.foodId,
				quality: this.data.quality
			}
		})).result;
		
		wx.cloud.callFunction({
			name: 'saveRollRecord',
			data: {
				postId: res._id,
				postAuthorOpenId: this.data.userInfo._openid,
				count: this.data.rollCount,
				duration: this.data.rollDuration,
			}
		});
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
	},

	// 是否匿名发帖
	changeAnonymous(e) {
		this.setData({
			isAnonymous: e.detail
		})
	},
	
	back() { wx.navigateBack(); }
})