Page({
	data: {
		pageHeight: 0,
		showPopup: true,
		showTimePopup: false,
		timeIndex: 0,
		times: [15, 30, 45, 60, 90, 120]
	},

	onLoad: function (options) {
		wx.getSystemInfo({
		  success: (res) => {
			  this.setData({
				  pageHeight: res.windowHeight
			  })
		  }, 
		})

	},

	addActivity(){
		this.setData({
			showPopup: !this.data.showPopup
		})
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