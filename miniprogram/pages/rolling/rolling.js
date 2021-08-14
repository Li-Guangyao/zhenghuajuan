import { canvasUtils } from "../../utils/canvasUtils";
import { userUtils } from "../../utils/userUtils"

// 圆环的坐标和尺寸，x和y是相对于canvas左上角的坐标，r是圆环半径，w是线的宽度
var windowWidth=wx.getSystemInfoSync().windowWidth;
var windowHeight=wx.getSystemInfoSync().windowHeight;
var w=8,
	r=windowWidth*0.7/2-8,
	x=windowWidth*0.7/2,
	y=windowWidth*0.7/2;

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
		userInfo:null,
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

		isShowSharingDialog:false,

		durationOfDays:0,
		equalThingInfo:{
			verb:'动作',
			count:'计量',
			thing:'物',
		},

		processTime:{
			hours:0,
			minutes:0,
			seconds:0
		}
	},

	// 绘制数据（单位：百分比）
	background: "../../../../../images/post.png",
	foodImgs: [
		"../../../../../images/foods/a.png",
		"../../../../../images/foods/b.png",
		"../../../../../images/foods/d.png",
		"../../../../../images/foods/e.png",
		"../../../../../images/foods/f.png",
		"../../../../../images/foods/g.png",
		"../../../../../images/foods/h.png",
		"../../../../../images/foods/i.png"
	],
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
	font: "30px 海派腔调清夏简",
	fontColor: "#FFDB93",
	texts: ["本次蒸了分钟", "连续蒸了996天", "相当于打了12局\n和平精英"],
	textPositions: [
		// y, x, w, align
		[35, 33, 67.5], [20, 42, 67.5], [82, 1, 67.5, 'right']
	],
	textSkewYs: [-1.54, 2.16, -1.64],

	nickNameFont: "20px 黑体",
	messageFont: "16px 黑体",
	infoFontColor: "#613b10",

	postBottom: "../../../../../images/postBottom.png",
	
	avatar: "../../../../../images/defaultAvatar.jpeg",
	avatarRect: [5, 15, 70], // x, y, h

	nickName: '昵称',
	nickNameRect: [27.5, 15, 45], // x, y, w

	message: "我正乐14321321分钟花卷哈哈哈哈哈哈哈！",

	testWxml2Canvas: async function() {
		console.log("绘制canvas")
		var w = wx.getSystemInfoSync().windowWidth*0.7;
		var h = w/9*16;
		var fw = w * this.foodSize[0] / 100;
		var fh = h * this.foodSize[1] / 100;
		var fCnt = this.foodImgs.length;

		// 绘制背景和菜品
		await canvasUtils.drawImage(this.background, 0, 0, w, h);
		for (var i = 0; i < this.foodPositions.length; ++i) {
			var p = this.foodPositions[i];
			var src = this.foodImgs[Math.floor(Math.random() * fCnt)];
			var x = w * p[1] / 100, y = h * p[0] / 100;
			await canvasUtils.drawFood(src, undefined, x, y, fw, fh, false);
		}

		// await canvasUtils.wait(500);

		// 绘制文本
		canvasUtils.setFont(this.font);
		this.texts.forEach((t, i) => {
			var pos = this.textPositions[i];
			var skew = this.textSkewYs[i];
			var x = w * pos[1] / 100, y = h * pos[0] / 100;
			var tw = w * pos[2] / 100;

			canvasUtils.setColor(this.fontColor);
			canvasUtils.setTransform(1, skew, 0, 1, 0, 0);
			canvasUtils.drawTextEx(t, x, y, tw, 32, pos[3]);
		})
		canvasUtils.resetTransform();

		// 绘制底部信息
		var cache = await canvasUtils.getImageInfo(this.postBottom);
		var bw = cache.width; var asp = w / bw;
		var bh = cache.height * asp, by = h - bh;
		await canvasUtils.drawImage(this.postBottom, 0, by, w, bh);

		var ap = this.avatarRect;
		var ax = w * ap[0] / 100, ay = by + bh * ap[1] / 100;
		var ah = bh * ap[2] / 100, aw = ah;
		await canvasUtils.drawImage(this.avatar, ax, ay, aw, ah, 'round')

		var np = this.nickNameRect;
		var nx = w * np[0] / 100, ny = by + bh * np[1] / 100 + 20;
		var nw = w * np[2] / 100;
		canvasUtils.setColor(this.infoFontColor);
		canvasUtils.setFont(this.nickNameFont);
		canvasUtils.drawText(this.data.userInfo.nickName, nx, ny);

		canvasUtils.setFont(this.messageFont);
		canvasUtils.drawTextEx(this.message, nx, ny + 20, nw, 18);

		canvasUtils.clipRect(0, 0, w, h);
	},

	onLoad: async function (e) {

		this.setData({
			userInfo:await userUtils.getUserInfo(),
			durationOfDays:(await wx.cloud.callFunction({
				name:'getDurationOfDays'
			})).result,
			equalThingInfo:this.getEqualThingInfo()
		})
		let verb=this.data.equalThingInfo.verb;
		let count=this.data.equalThingInfo.count;
		let thing=this.data.equalThingInfo.thing;
		let duration=this.data.duration;
		this.texts=['本次蒸了'+new Number(duration).toString()+'分钟','连续蒸了'+new Number(this.data.durationOfDays).toString()+'天','相当于'+verb+'了'+count+thing];
		//TODO 从xml里边获取内容
		this.message='我蒸了'+new Number(duration).toString()+'分钟花卷!';

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

		canvasUtils.clear();
	},

	// 配置Canvas
	setupBarCanvas() {
		const query = this.createSelectorQuery()

		// 海报Canvas

		
		// 获取canvas（原来的）
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

		var ms = this.data.curMilliSecond + updateInterval*100;

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
		aniCtx.clearRect(0,0,windowWidth,windowHeight);
		// TODO: 完成了
		wx.showModal({
			title: '蒸花卷完成了！发布到动态后将获得' + this.data.count + '个花卷，快去分享努力成果吧！',
			showCancel: false,

			success: async res => {
				// wx.redirectTo({
				// 	url: '../postAdd/postAdd?rollName=' + this.data.name +
				// 		"&rollCount=" + this.data.count +
				// 		"&rollDuration=" + this.data.duration,
				// })
				this.setData({
					isShowSharingDialog:true,
				})
				setTimeout(() => canvasUtils.setupById(this.createSelectorQuery(), "post-canvas", this.testWxml2Canvas), 1000);
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
//获取等价事物
	getEqualThingInfo(){
		let duration=this.data.duration;
		var things=[];
		var type=0;
		if(duration<=40){
			things={短视频:['看',0.5,'条'],王者荣耀:['玩',15,'局']};
			type=Math.round(Math.random());
		}
		else if(duration<=60){
			things={短视频:['看',0.5,'条'],王者荣耀:['玩',15,'局'],电视剧:['煲',40,'集']};
			type=Math.round(Math.random()*2)
		}
		else{
			things={王者荣耀:['玩',15,'局'],电视剧:['煲',40,'集']};
			type=Math.round(Math.random());
		}
		var equalThingInfo=Object.values(things)[type];
		return{ 
			verb:equalThingInfo[0],
			count:new Number(Math.round(duration/equalThingInfo[1])).toString()+equalThingInfo[2],
			thing:Object.keys(things)[type],
		}
	},
	cancelShare(){
		console.log("取消分享");
		this.setData({
			isShowSharingDialog:false,
		})
	},
	onShareAppMessage:function(){
		return{

		}
	}

})