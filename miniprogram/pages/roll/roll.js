Page({
	data: {
		pageHeight: 0,
		showPopup: true,
		recordList: [{
			rollName: "学习",
			rollCount: 30,
			rollTime: 30,

			avatarUrl: "",
			timeDiff: "1天前",
			nickname: "我自己",
			likeValue: 42,
			content: "今天学了30分钟的Java的反射",
			fileList: [],
		},{
			rollName: "编程",
			rollCount: 15,
			rollTime: 15,

			avatarUrl: "",
			timeDiff: "1天前",
			nickname: "我自己",
			likeValue: 28,
			content: "专注了15分钟",
			fileList: [],
		},{

			avatarUrl: "",
			timeDiff: "1天前",
			nickname: "我自己",
			likeValue: 28,
			content: "今天啥也没干",
			fileList: [],
		}],
		// recordList: [],
		showPopup: true,
		timeIndex: 0,
		times: [15, 30, 45, 60, 90, 120],
		rollCounts: [15, 30, 45, 60, 90, 120]	},

	onLoad: function (options) {

	},

	addActivity(){
		this.setData({ showPopup: true })
	},

	onDialogClose(e){
		switch(e.detail) {
			case "confirm":
				wx.navigateTo({
					url: '../rolling/rolling',
				})
				break;
			default:
				this.setData({ showPopup: false }); break;
		}
	},

	onReady: function () {

	},

	/**
	 * Lifecycle function--Called when page show
	 */
	onShow: function () {

	},

	/**
	 * Lifecycle function--Called when page hide
	 */
	onHide: function () {

	},

	/**
	 * Lifecycle function--Called when page unload
	 */
	onUnload: function () {

	},

	/**
	 * Page event handler function--Called when user drop down
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * Called when page reach bottom
	 */
	onReachBottom: function () {

	},

	/**
	 * Called when user click on the top right corner to share
	 */
	onShareAppMessage: function () {

	},

  onTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      timeIndex: e.detail.value
    })
  },
})