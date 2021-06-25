// miniprogram/pages/rolling.js
 
var x = 128, y = 128, r = 120, w = 8;
var updateInterval = 125;
var lastStatusTime = 3;
var aniCtx, updateId;

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		name: "学习",
		minute: 15,

		startTime: null,
		curMinute: 0,
		curMinuteInt: 0,
		curSecond: 0,

		statuses: ["制作中1...", "制作中2...", "制作中3...", "蒸制中...", "熟了"],
		statusIndex: 0,
		finishText: "完成了！"
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
	},

	// 配置Canvas
	setupBarCanvas() {
		
		const query = this.createSelectorQuery()
		query.select('#canvasArcCir')
			.fields({ node: true, size: true })
			.exec((res) => {
				const canvas = res[0].node
				aniCtx = canvas.getContext('2d')

				const dpr = wx.getSystemInfoSync().pixelRatio
				canvas.width = res[0].width * dpr
				canvas.height = res[0].height * dpr
				aniCtx.scale(dpr, dpr);
				
				this.clearMinuteProgress();
				this.startTimer();
			})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setupBarCanvas();
	},

	// 正式开始计时
	startTimer() {
		this.setData({
			startTime: new Date()
		});
		updateId = setInterval(this.update, updateInterval);
	},

	update() {
		var now = new Date();
		var s = this.data.startTime;
		var nTime = now.getTime();
		var sTime = s.getTime();

		var dtTime = (nTime - sTime) / 1000;
		var minute = dtTime / 60;
		var second = dtTime % 60;

		var sIndex = this.getStatusIndex(second);
		this.drawMinuteProgress(second);

		this.setData({
			curMinute: minute,
			curSecond: second,
			curMinuteInt: parseInt(minute),
			statusIndex: sIndex
		});

		if (minute >= this.data.minute)
			this.onFinished();
	},

	// 根据秒数获取状态名称
	getStatusIndex(second) {
		var cnt = this.data.statuses.length;
		var total = 60 - lastStatusTime;
		if (second >= total) return cnt - 1;

		var delta = total / (cnt - 1);
		return parseInt(second / delta);
	},

	drawMinuteProgress(second) {
		if (!aniCtx) return;

		// if (second <= 0.5)
		// 	this.clearMinuteProgress();
		// else {
			this.clearMinuteProgress();
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
		// }
	},

	clearMinuteProgress() {
		if (!aniCtx) return;
				
		aniCtx.lineWidth = w;
		aniCtx.strokeStyle = '#eaeaea';
		aniCtx.lineCap = 'round';

		aniCtx.beginPath();
		aniCtx.arc(x, y, r, 0, 2 * Math.PI, false);
		aniCtx.stroke();
		aniCtx.closePath();
	},

	onFinished() {
		clearInterval(updateId)
		// TODO: 完成了
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
		clearInterval(updateId)
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		clearInterval(updateId)
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