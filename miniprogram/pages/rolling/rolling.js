import Wxml2Canvas from '../../lib/wxml2canvas/index';

// 圆环的坐标和尺寸，x和y是相对于canvas左上角的坐标，r是圆环半径，w是线的宽度
var x = 128,
	y = 128,
	r = 120,
	w = 8;

// 每隔125毫秒重绘图形
var updateInterval = 125;
// 最后一个状态“出锅”的持续时间
var lastStatusTime = 2;
// canvas的context
var aniCtx;
// 一个循环任务的句柄
var updateId;

// 检测手机运动状态用到的变量
var lastAngle = null;
var accumulate = 0;
const MaxDeltaAngle = 0.5;

// 退出时间不能超过5秒，否则花卷坏掉
const MaxExitTime = 5 * 1000;

Page({
	data: {
		name: "学习",
		duration: 15,
		count: 15,
		strict: false,

		startTime: null,
		curMilliSecond: 0,
		curMinute: 0,
		curSecond: 0,
		curCount: 0,

		// 和面，发面，切段，蒸制，出锅
		status: ["和面中...", "发面中...", "切段中...", "蒸制中...", "出锅！"],
		statusIndex: 0,
		finishedText: "完成了！",

		finished: false,
		stopped: false,

		exitTime: null,

		img: null // "../../images/post.png"
	},

	onLoad: function (e) {

		wx.setKeepScreenOn({
			keepScreenOn: true
		});

		this.setData({
			name: e.name,
			duration: e.duration,
			count: e.count,
			strict: e.strict == 1,
			stopped: false
		})

		wx.enableAlertBeforeUnload({
			message: "退出后将丢失目前已经蒸好的花卷！您确定要退出吗？",
			success: function (res) {},
			fail: function (errMsg) {}
		})
	},

	onReady: function () {
		this.setupBarCanvas();
	},

	onShow: function (e) {
		if (!this.data.exitTime) return;

		/*
		wx.stopDeviceMotionListening({})

		if (this.data.stopped) {
			this.setData({ stopped: true })
			this.stopRolling();
			this.onStopped();
		} else 
			wx.showToast({
				title: accumulate + '蒸花卷过程中不要分心哦~', icon: 'none'
			});
		*/

		var now = new Date();
		if (this.data.strict && now - this.data.exitTime >= MaxExitTime) {
			this.setData({
				stopped: true
			})
			this.stopRolling();
			this.onStopped();
		} else
			wx.showToast({
				title: '蒸花卷过程中不要分心哦~',
				icon: 'none'
			});
	},

	onHide: function () {
		if (this.data.finished) return;

		/* 尝试检测手机运动状态的代码
		lastAngle = null;
		accumulate = 0;

		wx.startDeviceMotionListening({})
		wx.onDeviceMotionChange((result) => {
			if (lastAngle) {
				var dA = result.alpha - lastAngle.alpha;
				var dB = result.beta - lastAngle.beta;
				var dG = result.gamma - lastAngle.gamma;
				var delta2 = dA * dA + dB * dB + dG * dG;
				
				var now = new Date();

				console.info("diff: ", delta2, 
					delta2 >= MaxDeltaAngle * MaxDeltaAngle);
				if (delta2 >= MaxDeltaAngle * MaxDeltaAngle) accumulate += (now - this.data.exitTime) / 1000;
				if (accumulate >= 250)
					this.setData({ stopped: true })
			}
			lastAngle = result;
		})
		*/

		// 退出设置exitTime，下次进入用于判断
		this.setData({
			exitTime: new Date()
		});
	},

	onUnload: function () {
		this.stopRolling();
	},

	// 配置Canvas
	setupBarCanvas() {
		const query = this.createSelectorQuery()
		// 获取canvas
		query.select('#canvasArcCir')
			.fields({
				node: true,
				size: true
			})
			.exec((res) => {
				console.log(res)

				const canvas = res[0].node
				aniCtx = canvas.getContext('2d')

				const dpr = wx.getSystemInfoSync().pixelRatio
				canvas.width = res[0].width * dpr
				canvas.height = res[0].height * dpr
				// 缩放
				aniCtx.scale(dpr, dpr);

				this.clearMinuteProgress();
				this.startTimer();
			})
	},

	// 正式开始计时
	startTimer() {
		this.setData({
			startTime: new Date(),
			curMilliSecond: 0
		});
		updateId = setInterval(this.update, updateInterval);
	},

	update() {
		// var now = new Date();
		// var s = this.data.startTime;

		var ms = this.data.curMilliSecond + updateInterval;

		// var nTime = now.getTime();
		// var sTime = s.getTime();

		// TODO: 测试
		var dtTime = ms / 1000;
		var minute = dtTime / 60;
		var second = dtTime % 60;

		var sIndex = this.getStatusIndex(second);
		var curCount = this.getCurCount(minute);

		this.drawMinuteProgress(second);

		this.setData({
			curCount,
			curMinute: minute,
			curSecond: second,
			statusIndex: sIndex,
			curMilliSecond: ms
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
		var cnt = this.data.status.length;
		var total = 60 - lastStatusTime;
		if (second >= total) return cnt - 1;

		var delta = total / (cnt - 1);
		return parseInt(second / delta);
	},


	drawMinuteProgress(second) {
		if (!aniCtx) return;

		this.clearMinuteProgress();
		// s代表start，定义绘制弧线的开始点
		var s = 1.5 * Math.PI;
		// e代表end，定义绘制弧线的结束点
		var e = s + second / 60 * 2 * Math.PI;
		// API，创建一个渐变颜色
		const grd = aniCtx.createLinearGradient(0, 0, x * 2, 0)
		grd.addColorStop(0, '#FEA403')
		grd.addColorStop(1, '#FF6464')

		// 橙色弧线的宽度小于灰色弧线（背景）
		aniCtx.lineWidth = w - 2;
		aniCtx.strokeStyle = grd;
		aniCtx.lineCap = 'round';

		aniCtx.beginPath();
		// 弧线
		aniCtx.arc(x, y, r, s, e, false);
		aniCtx.stroke();
		aniCtx.closePath();
		// }
	},

	// 绘制一个灰色的圆圈
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
		if (this.data.stopped) return;

		this.setData({
			finished: true
		});

		this.drawMinuteProgress(60);
		this.stopRolling();

		// TODO: 完成了
		wx.showModal({
			title: '蒸花卷完成了！发布到动态后将获得' + this.data.count + '个花卷，快去分享努力成果吧！',
			showCancel: false,

			success: res => {
				wx.redirectTo({
					url: '../postAdd/postAdd?rollName=' + this.data.name +
						"&rollCount=" + this.data.count +
						"&rollDuration=" + this.data.duration,
				})
			}
		})

		wx.setKeepScreenOn({
			keepScreenOn: false
		});
	},

	onStopped() {
		wx.disableAlertBeforeUnload({
			success: (res) => {
				wx.showModal({
					title: '太可惜了，由于您在蒸花卷过程中分心，花卷全坏掉了，再来一次吧！下次记得不要分心了哦~',
					showCancel: false,

					success: res => {
						wx.navigateBack({
							delta: 1
						})
					}
				})
			},
		})
	},

	stopRolling() {
		clearInterval(updateId)
	},

})