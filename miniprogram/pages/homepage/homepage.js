import getDateDiff from "../../utils/getDateDiff"

Page({

	data: {
		postList: []
	},

	onLoad: function (options) {
		wx.cloud.callFunction({
			name: 'getPost',
			success: res => {
				this.setData({
					postList: res.result.data
				})
				this.dateDiffTrans()
			}
		})
	},

	// 发帖
	toPostAdd() {
		wx.navigateTo({
			url: '../postAdd/postAdd',
		})
	},

	tapPost(e){
		var index = e.currentTarget.dataset.index
		var post = JSON.stringify(this.data.postList[index])
		wx.navigateTo({
		  url: '../postDetail/postDetail?post='+ post,
		})
	},

	// 发帖的时间距离现在多久
	dateDiffTrans() {
		var length = this.data.postList.length
		for (var i = 0; i < length; i++) {
			var item = 'postList[' + i + '].timeDiff'
			var originDate = this.data.postList[i].createdAt
			this.setData({
				[item]: getDateDiff(originDate)
			})
		}
	},

	// 点击视频或者图片预览
	previewMadia(e){
		console.log(e)
		// sources: this.data.postList.
		var index1 = e.currentTarget.dataset.index1
		var index2 = e.currentTarget.dataset.index2
		wx.previewMedia({
		  sources: this.data.postList[index1].photoList,
		  current: index2,
		  showmenu: true,
		})
	}

})