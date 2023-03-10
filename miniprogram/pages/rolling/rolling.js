import CanvasUtils from "../../utils/canvasUtils";
import NavigateUtils from "../../utils/navigateUtils";
import RollManager from "../../modules/rollModule/rollManager";
import FoodManager from "../../modules/foodModule/foodManager";
import MathUtils from "../../utils/mathUtils";
import PageCombiner from "../common/pageCombiner";
import userPage from "../common/userPage";
import foodPage from "../common/foodPage";
import CFM from "../../modules/coreModule/cloudFuncManager";

// 圆环的坐标和尺寸，x和y是相对于canvas左上角的坐标，r是圆环半径，w是线的宽度
var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var w = 8,
	r = windowWidth * 0.7 / 2 - 8,
	x = windowWidth * 0.7 / 2,
	y = windowWidth * 0.7 / 2;

// 每隔125毫秒重绘图形
var updateInterval = 125;
// 一个循环任务的句柄
var updateId;

// 检测手机运动状态用到的变量
var lastAngle = null;
var accumulate = 0;
const MaxDeltaAngle = 0.5;

// 退出时间不能超过5秒，否则花卷坏掉
const MaxExitTime = 5 * 1000;

var main = {
	data: {
		rollRecord: null, // RollRecord.data

		// 制作过程的变量
		startTime: null,
		curMilliSecond: 0,
		curMinute: 0,
		curSecond: 0,

		leftTimeStr: "00:00",

		// 状态变量
		finished: false,
		stopped: false,
		sharePost: false,

		// 退出控制
		exitTime: null,

		// 海报数据
		sharings: [false, false],
		continuity: 0, // 连续天数
		defeat: 0, // 打败人数比例
		equalActInfo: {
			verb: '', count: '', act: '',
		}
	},

	// 数据操作
	// TODO: 提取共有操作
	getObject() {
		return this.data.rollRecord;
	},
	getData() {
		return this.getObject().data;
	},
	updateData(obj, refresh) {
		Object.assign(this.getData(), obj)
		if (refresh) this.refreshData();
	},
	refreshData() {
		this.getObject().refresh();
		this.setData({ rollRecord: this.getObject() });
	},

	onLoad: async function (e) {
		wx.setKeepScreenOn({ keepScreenOn: true });
		wx.enableAlertBeforeUnload({
			message: "退出将会导致制作失败！您确定要退出吗？"
		})

		this.setData({ rollRecord: RollManager.curRollRecord})
		this.loadAsyncData();
	},

	onReady: function () {
		this.setupBarCanvas();
	},

	onShow: function (e) {
		if (this.data.finished || !this.data.exitTime) return;

		/* 尝试检测手机运动状态的代码
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
		if (this.getData().strictMode && 
			now - this.data.exitTime >= MaxExitTime) 
			this.onStopped();
		else
			wx.showToast({
				title: '制作过程中不要分心哦~',
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

		// 退出设置exitTime，用于下次进入判断
		this.setData({
			exitTime: new Date()
		});
	},

	onUnload: function () {
		this.stopRolling();

		CanvasUtils.reset();

		// 如果未完成
		if (!this.data.finished)
			RollManager.fail();
		// 如果是完成了，但没有去分享的话
		else if (!this.data.sharePost)
			RollManager.finish();
	},

	// 读取异步数据（边制作边读取）
	loadAsyncData: async function() {

		var flavor = this.getData().flavor;
		var duration = this.getData().duration;
		var foodName = this.getObject().foodName;
		
		var message = "我用" + duration + "分钟做出了" + flavor + "味的" + foodName + "！";

		this.updateData({ message }, true);

		this.setData({
			// message,
			sharings: await this.loadSharingRecord(),
			continuity: 0, // await this.loadContinuity(),
			defeat: await this.getDefeat(),
			equalActInfo: this.getEqualActInfo()
		})
	},

	// 读取分享数据
	loadSharingRecord: async function() {
		var shares = await RollManager.getTodayShares();
		return shares.map(s => s.length > 0);
	},

	// 读取连续卷的天数
	loadContinuity: async function() {
		return await CFM.call('getContinuity', null, null, false);
	},

	// 获取打败人数比例
	getDefeat: async function() {
		return await CFM.call('getDefeat', null, 
			{ duration: this.getData().duration }, false);
	},

	// 获取等价活动
	getEqualActInfo() {
		var duration = this.getData().duration;
		var act1 = ['刷', 0.5, '条', '短视频']
		var act2 = ['玩', 15, '局', '王者荣耀']
		var act3 = ['煲', 40, '集', '电视剧']
		var acts = [], type = 0;

		if (duration <= 40) acts = [act1, act2];
		else if (duration <= 60) acts = [act1, act2, act3];
		else acts = [act2, act3];
		type = Math.floor(Math.random() * acts.length);

		var equalActInfo = acts[type];

		return {
			verb: equalActInfo[0],
			count: Math.round(duration / equalActInfo[1]) + equalActInfo[2],
			act: equalActInfo[3],
		}
	},

	// 配置Canvas
	async setupBarCanvas() {
		const query = this.createSelectorQuery()
		await CanvasUtils.setupById(query, 'progress-canvas');
		this.clearMinuteProgress();
		this.startTimer();
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
		var ms = this.data.curMilliSecond + updateInterval;

		var dtTime = ms / 1000;
		var minute = dtTime / 60;
		var second = dtTime % 60;

		var duration = this.getData().duration;

		this.drawMinuteProgress(minute, duration);

		this.setData({
			curMinute: minute,
			curSecond: second,
			curMilliSecond: ms,
			leftTimeStr: this.getLeftTimeStr()
		});

		if (minute >= duration) this.onFinished();
	},

	drawMinuteProgress(minute, duration) {
		var ctx = CanvasUtils.ctx;
		if (!ctx) return;

		this.clearMinuteProgress();
		// s代表start，定义绘制弧线的开始点
		var s = 1.5 * Math.PI;
		// e代表end，定义绘制弧线的结束点
		var e = s + minute / duration * 2 * Math.PI;
		// API，创建一个渐变颜色
		const grd = ctx.createLinearGradient(0, 0, x * 2, 0)
		grd.addColorStop(0, '#FEA403')
		grd.addColorStop(1, '#FF6464')

		// 橙色弧线的宽度小于灰色弧线（背景）
		ctx.lineWidth = w - 2;
		ctx.strokeStyle = grd;
		ctx.lineCap = 'round';

		ctx.beginPath();
		// 弧线
		ctx.arc(x, y, r, s, e, false);
		ctx.stroke();
		ctx.closePath();
	},

	// 绘制一个灰色的圆圈
	clearMinuteProgress() {
		var ctx = CanvasUtils.ctx;
		if (!ctx) return;

		ctx.lineWidth = w;
		ctx.strokeStyle = '#eaeaea';
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.closePath();
	},

	// 完成
	async onFinished() {
		if (this.data.stopped) return;

		this.setData({ finished: true });
		this.stopRolling();

		wx.disableAlertBeforeUnload();

		CanvasUtils.clearAll();

		this.prepareSharing();

		// TODO: 完成了
		var title = "制作完成！快去炫耀一下吧~"
		wx.showToast({ title, icon: 'none' })

		wx.setKeepScreenOn({ keepScreenOn: false });
	},

	// 中断
	async onStopped() {
		this.setData({ stopped: true })
		this.stopRolling();

		wx.disableAlertBeforeUnload();

		var foodName = this.getObject().foodName;

		var title = "太可惜了，由于您在制作过程中分心，" + 
			foodName + "坏掉了，再来一次吧！下次记得不要分心了哦~"
		await wx.showModal({ title, showCancel: false });
		NavigateUtils.pop();
	},

	stopRolling() {
		clearInterval(updateId)
	},

	// 取消分享
	cancelShare() {
		NavigateUtils.pop();
	},

	prepareSharing: async function() {

		let duration = this.getData().duration;
		let equalAct = this.data.equalActInfo;
		let verb = equalAct.verb;
		let count = equalAct.count;
		let act = equalAct.act;

		this.texts = ['本次制作' + duration + '分钟',
			'超过' + this.data.defeat + '%的人',
			'相当于' + verb + '了' + count + '\n' + act
		];
	},

	// 输入内容
	inputMessage(e) {
		this.updateData({message: e.detail.value}, true)
	},

	// 分享到动态
 	shareToPost: async function() {
		// 在addPost页面进行分享处理

		await this.generatePoster();

		this.setData({sharePost: true});

		var data = {
			// rollName: this.data.name,
			// rollCount: this.data.count,
			// rollDuration: this.data.duration,
			// foodName: this.data.foodName,
			// foodId: this.data.foodId,
			// quality: this.data.quality,
			// shareImgUrl: this.posterImgUrl,
			// strictMode: this.data.strictMode
			isRoll: true
		}
		NavigateUtils.change('../postAdd/postAdd', data);
	},

	onShareAppMessage: async function () {
		await this.generatePoster();
	
		await RollManager.addShare('wx');

		this.data.sharings[0] = true;
		this.setData({sharings: this.data.sharings});

		/*
		// 已经无法检测是否分享成功了，只能直接在这里写
		if (!this.data.sharings[0]) {
			this.data.count *= 2; 
			this.data.sharings[0] = true;
			this.setData({sharings: this.data.sharings});
		}
		wx.cloud.callFunction({
			name: "posterSharing", 
			data: { method: "ADD", type: "wx" }
		})
		*/

		var texts = [
			"来蒸花卷，争做最卷的“卷王”吧",
			"来蒸花卷，记录你学习的点滴",
			"来蒸花卷，沉浸在学习的快乐中吧"
		]

		return {
			title: MathUtils.randomItem(texts),
			imageUrl: this.posterImgUrl,
			path: '/pages/roll/roll'
		}
	},

	/*
	async onShareTimeline() {
		await this.generatePoster();
	
		await RollManager.addShare('wx');

		this.data.sharings[0] = true;
		this.setData({sharings: this.data.sharings});

		var texts = [
			"来蒸花卷，争做最卷的“卷王”吧",
			"来蒸花卷，记录你学习的点滴",
			"来蒸花卷，沉浸在学习的快乐中吧"
		]

		return {
			title: MathUtils.randomItem(texts),
			imageUrl: this.posterImgUrl,
			path: '/pages/roll/roll'
		}
	},
	*/

	// 格式化时间
	formatTimeStr(minutes, seconds) {
		var minuteStr = (minutes / 10 >= 1 ? '' : '0') + minutes;
		var secondStr = (seconds / 10 >= 1 ? '' : '0') + seconds;
		return minuteStr + ':' + secondStr;
	},

	getLeftTimeStr() {
		var duration = this.getData().duration;
		var leftMinutes = duration - 1 - Math.floor(this.data.curMinute);
		var leftSeconds = 59 - Math.floor(this.data.curSecond);
		return this.formatTimeStr(leftMinutes, leftSeconds);
	},

	// 绘制数据（单位：百分比）
	background: "../../../../../images/post.png",

	foodSize: [25, 15], // x, y
	foodPositions: [
		[-10, -2], // y, x
		[0, 20],
		[-7, 45],
		[26, -9],
		[34, 12],
		[43, 35],
		[50, 10],
		[42, -14],
		[58, -16],
		[21, 54],
		[14, 80],
		[31, 78],
		[64, 70],
		[72, 47],
		[80, 25],
		[75, 95]
	],

	texts: ["本次蒸了分钟", "连续蒸了996天", "相当于打了12局\n和平精英"],
	textPositions: [
		// y, x, w, align
		[35.25, 33.5, 67.5],
		[20.25, 42.75, 67.5],
		[81.75, 1, 67.5, 'right']
	],
	textSkewYs: [-0.513, 0.72, -0.546],

	fontColor: "#FFDB93",

	infoFontColor: "#613b10",

	postBottom: "../../../../../images/postBottom.png",

	avatarRect: [5, 15, 70], // x, y, h

	nickNameRect: [27.5, 15, 45], // x, y, w

	// 最终的URL
	posterImgUrl: null,

	generatePoster: async function () {
		// const query = this.createSelectorQuery()
		// await CanvasUtils.setupById(query, "post-canvas");

		CanvasUtils.clearAll();

		var w = wx.getSystemInfoSync().windowWidth * 0.7;
		var h = w / 9 * 16;
		var fw = w * this.foodSize[0] / 100;
		var fh = h * this.foodSize[1] / 100;
		// 屏幕宽度固定位750rpx
		var nickNameSize = Math.round(36 * w / 750);
		var nickNameFont = nickNameSize + "px Arial,sans-serif";
		var messageSize = Math.round(32 * w / 750);
		var messageFont = messageSize + "px Arial,sans-serif";
		var fontSize = Math.round(60 * w / 750);
		var font = "normal bold " + fontSize + "px Arial,sans-serif";

		CanvasUtils.clipRect(0, 0, w, h);

		// 绘制背景和菜品
		await CanvasUtils.drawImage(this.background, 0, 0, w, h);
		for (var i = 0; i < this.foodPositions.length; ++i) {
			var p = this.foodPositions[i];
			var src = this.getObject().foodImage;
			var x = w * p[1] / 100,
				y = h * p[0] / 100;
			await CanvasUtils.drawFood(src, undefined, x, y, fw, fh, false);
		}

		// 绘制文本
		CanvasUtils.setFont(font);
		this.texts.forEach((t, i) => {
			var pos = this.textPositions[i];
			var skew = this.textSkewYs[i];
			var x = w * pos[1] / 100,
				y = h * pos[0] / 100;
			var tw = w * pos[2] / 100;

			CanvasUtils.setColor(this.fontColor);
			CanvasUtils.setTransform(1, skew, 0, 1, 0, 0);
			CanvasUtils.drawTextEx(t, x, y, tw, fontSize + 2, pos[3]);
		})
		CanvasUtils.resetTransform();

		// 绘制底部信息
		var cache = await CanvasUtils.getImageInfo(this.postBottom);
		var bw = cache.width;
		var asp = w / bw;
		var bh = cache.height * asp,
			by = h - bh;
		await CanvasUtils.drawImage(this.postBottom, 0, by, w, bh);

		var user = this.data.userInfo.data;
		var ap = this.avatarRect;
		var ax = w * ap[0] / 100,
			ay = by + bh * ap[1] / 100;
		var ah = bh * ap[2] / 100,
			aw = ah;
		await CanvasUtils.drawImage(user.avatarUrl, ax, ay, aw, ah, 'round')

		var np = this.nickNameRect;
		var nx = w * np[0] / 100,
			nw = w * np[2] / 100;
		var ny = by + bh * np[1] / 100 + nickNameSize;
		CanvasUtils.setColor(this.infoFontColor);
		CanvasUtils.setFont(nickNameFont);
		CanvasUtils.drawText(user.nickName, nx, ny);

		CanvasUtils.setFont(messageFont);
		CanvasUtils.drawTextEx(this.getData().message,
			nx, ny + nickNameSize + 2, nw, messageSize + 2);

		var data = CanvasUtils.canvas.toDataURL();
		this.posterImgUrl = wx.env.USER_DATA_PATH + '/tempPoster.png';
		await this.savePosterImg(data, this.posterImgUrl);

		this.updateData({shareImage: this.posterImgUrl});

		CanvasUtils.clearAll();
	},

	generateSharePoster: async function () {

		// TODO 做一张5:4的分享用图片

	},

	savePosterImg(base64Url, filePath) {
		new Promise((resolve, reject) => 
			wx.getFileSystemManager().writeFile({
				filePath, data: base64Url.slice(22),
				encoding: 'base64', success: resolve
			})
		)
	},
}

Page(PageCombiner.Combine(main, [userPage(), foodPage]));