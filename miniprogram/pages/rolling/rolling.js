var x = 128, y = 128, r = 120, w = 8;
var updateInterval = 100;
var lastStatusTime = 2;
var aniCtx, updateId;

Page({
	data: {
		name: "学习",
		duration: 15,
		count: 15,

		startTime: null,
		curMinute: 0,
		curSecond: 0,
		curCount: 0,

		// 和面，发面，切段，蒸制，出锅
		statuses: ["和面中...", "发面中...", "切段中...", "蒸制中...", "出锅！"],
		statusIndex: 0,
		finishText: "完成了！",

		stopped: false
	},

	onLoad: function (e) {
		this.setData({
			name: e.name,
			duration: e.duration,
			count: e.count,
			stopped: false
		})

		wx.enableAlertBeforeUnload({
      message: "退出后将丢失目前已经蒸好的花卷！您确定要退出吗？",
      success: function(res) { },
      fail: function(errMsg) { }
		})		
	},

	onReady: function () {
		this.setupBarCanvas();
	},

	onShow: function() {
		if (this.data.stopped) this.onStopped();
	},

	onHide: function () {
		this.setData({ stopped: true })
		this.stopRolling()
	},

	onUnload: function() {
		this.stopRolling();
	},

	// 配置Canvas
	setupBarCanvas() {
		const query = this.createSelectorQuery()
		query.select('#canvasArcCir')
			.fields({ node: true, size: true })
			.exec((res) => {
				console.log(res)

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

		// TODO: 测试
		// var dtTime = (nTime - sTime) / 1000;
		var dtTime = (nTime - sTime) / 10;
		var minute = dtTime / 60;
		var second = dtTime % 60;

		var sIndex = this.getStatusIndex(second);
		var curCount = this.getCurCount(minute);

		this.drawMinuteProgress(second);

		this.setData({
			curCount,
			curMinute: minute,
			curSecond: second,
			statusIndex: sIndex
		});

		if (minute >= this.data.duration)
			this.onFinished();
	},

	getCurCount(minute) {
		var count = this.data.count;
		var duration = this.data.duration;
		
		return parseInt(minute * count / duration);
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
		this.stopRolling();
		// TODO: 完成了
		wx.showModal({
			title: '恭喜完成本次蒸花卷！发布到动态后将获得' + this.data.count + '个花卷，快去分享努力成果吧！',
			showCancel: false,

			success: res => {
				wx.redirectTo({
					url: '../postAdd/postAdd?rollName=' + this.data.name + 
						"&rollCount=" + this.data.count + 
						"&rollDuration=" + this.data.duration,
				})
			}
		})
	},
	
	onStopped() {
		wx.disableAlertBeforeUnload({
			success: (res) => {
				wx.showModal({
					title: '非常抱歉，由于您在蒸花卷过程中分心，花卷全都坏掉了，再来一次吧！下次记得不要分心了哦~',
					showCancel: false,
		
					success: res => {
						wx.navigateBack({ delta: 1 })
					}
				})		
			},
		})
	},

	stopRolling() {
		clearInterval(updateId)
	},

})