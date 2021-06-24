// miniprogram/pages/rolling.js
 
var interval;
var varName;
var x = 128, y = 128, r = 120, w = 8;
var aniCtx;

Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		this.setupBarCanvases();
	},

	setupBarCanvases() {
		
		const query = this.createSelectorQuery()
		/*
    query.select('#canvasCircle')
			.fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
				ctx.scale(dpr, dpr)
				
				ctx.lineWidth = w;
				ctx.strokeStyle = '#eaeaea';
				ctx.lineCap = 'round';

				ctx.beginPath();
				ctx.arc(x, y, r, 0, 2 * Math.PI, false);
				ctx.stroke();
				ctx.closePath();
			})
		*/
		query.select('#canvasArcCir')
			.fields({ node: true, size: true })
			.exec((res) => {
				const canvas = res[0].node
				aniCtx = canvas.getContext('2d')

				const dpr = wx.getSystemInfoSync().pixelRatio
				canvas.width = res[0].width * dpr
				canvas.height = res[0].height * dpr
				aniCtx.scale(dpr, dpr);
				
				aniCtx.lineWidth = w;
				aniCtx.strokeStyle = '#eaeaea';
				aniCtx.lineCap = 'round';

				aniCtx.beginPath();
				aniCtx.arc(x, y, r, 0, 2 * Math.PI, false);
				aniCtx.stroke();
				aniCtx.closePath();
			
				this.drawMinuteProgress(24);
			})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
	},

	drawMinuteProgress(second) {
		if (!aniCtx) return;

		var s = 1.5 * Math.PI;
		var e = s + second / 60 * 2 * Math.PI;

		const grd = aniCtx.createLinearGradient(0, 0, x * 2, 0)
		grd.addColorStop(0, '#FEA403')
		grd.addColorStop(1, '#FF6464')

		aniCtx.lineWidth = w - 2;
		aniCtx.strokeStyle = grd;
		aniCtx.lineCap = 'round';

		aniCtx.beginPath();
		aniCtx.arc(x, y, r, s, e, false);
		aniCtx.stroke();
		aniCtx.closePath();
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