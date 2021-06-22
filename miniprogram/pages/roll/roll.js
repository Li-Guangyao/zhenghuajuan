Page({
	data: {
		pageHeight: 0,
		showPopup: false
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

	}
})