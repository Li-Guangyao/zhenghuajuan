import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		// 用户数据
		userInfo: null,

		// 菜品数据
		foods: [],
		// 菜品显示位置（自动生成）
		positions: [],

		// 自己蒸花卷的记录（包含缓存）
		records: [],
		// 当前选择索引
		curIndex: 0,
	},

	// 每个选项的时间范围
	timeRanges: null,

	// 菜品画布
	foodsCanvas: null,
	// 画布的context属性
	foodsCtx: null,
	// 菜品尺寸（绘制）
	foodSize: [92, 92],

	// 图片缓存
	imageCache: {},

	onLoad: async function (options) {
		this.setupTimeRanges();
		await this.getUserInfo();
		await this.loadFoods();
	},

	getUserInfo: async function() {
		this.setData({ userInfo : await userUtils.judgeLogin() })
	},

	/**
	 * 设置时间范围
	 */
	setupTimeRanges: function () {
		var now = new Date();

		var date = now.getDate(),
			day = now.getDay() || 7, // 星期数（if (day == 0) day = 7）
			month = now.getMonth(),
			year = now.getFullYear();

		var dayStart = new Date(year, month, date);
		var dayEnd = new Date(year, month, date + 1);

		var weekStart = new Date(year, month, date - day);
		var weekEnd = new Date(year, month, date - day + 7);

		var monthStart = new Date(year, month, 1);
		var monthEnd = new Date(year, month + 1, 0);

		var yearStart = new Date(year, 0, 1);
		var yearEnd = new Date(year + 1, 0, 0);

		this.timeRanges = [
			[dayStart, dayEnd],
			[weekStart, weekEnd],
			[monthStart, monthEnd],
			[yearStart, yearEnd]
		];
	},

	loadFoods: async function () {
		var res = await wx.cloud.callFunction({
			name: "operFoods",
			data: {
				method: "GET"
			}
		});
		this.setData({
			foods: this.processFoods(res.result)
		});
	},

	processFoods: function (foods) {
		let _foods = {}
		foods.forEach(f => _foods[f._id] = f);
		return {
			...foods, ..._foods
		}
	},

	// 配置Canvas（桌面图片onload后执行）
	setupCanvas() {
		const query = this.createSelectorQuery()
		// 获取canvas
		query.select('#foods')
			.fields({
				node: true,
				size: true
			})
			.exec((res) => {
				this.foodsCanvas = res[0].node
				this.foodsCtx = this.foodsCanvas.getContext('2d')

				const dpr = wx.getSystemInfoSync().pixelRatio
				this.foodsCanvas.width = res[0].width * dpr
				this.foodsCanvas.height = res[0].height * dpr
				this.foodsCanvas.dpr = dpr;
				// 缩放
				this.foodsCtx.scale(dpr, dpr);

				console.info(this.foodsCanvas);

				this.setData({
					positions: this.generatePositions(), // 每个菜品的位置
				})

				this.refreshData();
			})
	},

	/**
	 * Tabbar改变回调
	 */
	onTabbarChange: function (e) {
		this.selectIndex(e.detail.index);
	},

	/**
	 * 选择页面索引
	 */
	selectIndex: function (curIndex) {
		// 根据获取的下表，改变cate
		this.setData({curIndex});
		this.refreshData();
	},

	/**
	 * 当前的选择的时间段
	 */
	curTimeRange: function () {
		return this.timeRanges[this.data.curIndex];
	},

	/**
	 * 当前的选择的时间段
	 */
	curRecords: function () {
		return this.data.records[this.data.curIndex];
	},

	/**
	 * 刷新数据
	 */
	refreshData: async function () {
		var data = this.curRecords();
		if (!data) {
			// 现在选择的那个时间段
			var range = this.curTimeRange();
			var res = await wx.cloud.callFunction({
				name: "getMyRollRecord",
				data: {
					beginDate: range[0].getTime(),
					endDate: range[1].getTime(),
					skipNum: 0
				}
			});
			var key = 'records[' + this.data.curIndex + ']'
			this.setData({
				[key]: this.processRecordData(res.result)
			});
		}
		this.drawData(data.records);
	},

	processRecordData: function (records) {
		var res = { records };

		records.forEach(r => {
			var time = new Date(r.createdAt);
			var date = time.getDate();
			var month = time.getMonth();
			var year = time.getFullYear();
			var hour = time.getHours();
			var minute = time.getMinutes();

			r.time = month + "月" + date + "日 " + hour + ":" + minute;

			var key = year + "年" + month + "月" + date + "日";
			res[key] ||= []; res[key].push(r)
		})

		return res;
	},

	/**
	 * 绘制数据
	 */
	drawData: async function (records) {
		this.clearCanvas();
		for (let i = 0; i < records.length; i++)
			await this.drawFood(i, records[i], this.data.positions[i]);
	},

	width: function () {
		return this.foodsCanvas.width / this.foodsCanvas.dpr;
	},
	height: function () {
		return this.foodsCanvas.height / this.foodsCanvas.dpr;
	},

	generatePositions: function () {
		var w = this.width(), h = this.height();
		var center = [w / 2, h / 2], res = [];
		this.doGenPositions(center, res);
		return res.sort((p1, p2) => p1[1] != p2[1] ?
			p1[1] - p2[1] : p1[0] - p2[0]);
	},

	doGenPositions: function (pos, positions) {
		if (!this.isValidPoint(pos, positions)) return;

		var fw = this.foodSize[0] * 1, pi = Math.PI;

		positions.push(pos);

		for (let rad = 0; rad < 2 * pi; rad += pi / 3) {
			var newPos = [
				pos[0] + fw * Math.cos(rad),
				pos[1] + fw * Math.sin(rad)
			];
			this.doGenPositions(newPos, positions)
		}
	},

	// 点操作函数
	isValidPoint: function (pos, positions) {
		var w = this.width(), h = this.height(), d = this.foodSize[0];
		// var center = [w / 2, h / 2], radius = Math.max(w, h) / 2 * 0.9;

		// if (this.pointsDist2(pos, center) >= 
		// 	(radius - d / 2)*(radius - d / 2)) return false;

		// 边界判断
		if (pos[0] - d / 2 <= 0 || pos[0] + d / 2 >= w) return false;
		if (pos[1] - d / 2 <= 0 || pos[1] + d / 2 >= h) return false;

		return positions.every(
			p => this.pointsDist2(pos, p) >= d * d * 0.5
		)
	},
	pointsDist2: (p1, p2) =>
		(p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]),

	adjustPos: function (pos) {
		return [
			pos[0] - this.foodSize[0] / 2,
			pos[1] - this.foodSize[1] / 2
		];
	},

	drawFood: async function (i, rec, pos) {
		pos = this.adjustPos(pos);

		var x = pos[0], y = pos[1];
		var w = this.foodSize[0], h = this.foodSize[1];
		var src = this.data.foods[rec.foodId].images[rec.quality];
		var cache = this.imageCache[src] ||= await wx.getImageInfo({ src })

		var draw = () =>
			// console.log("drawFood", i, pos, this.adjustPos(pos));
			this.foodsCtx.drawImage(cache.img, 0, 0,
				cache.width, cache.height, x, y, w, h);

		if (!cache.img) {
			var img = this.foodsCanvas.createImage();
			img.src = cache.path;
			img.onload = () => {
				cache.img = img; draw();
			};
		} else draw();
	},

	// 清空画布的内容
	clearCanvas: function () {
		this.foodsCtx.clearRect(0, 0, this.foodsCanvas.width, this.foodsCanvas.height)

		/* 测试用
		for (let x = 0; x < this.width(); x += 100) {
			this.foodsCtx.moveTo(x, 0);

			this.foodsCtx.lineTo(x, 999);
			this.foodsCtx.lineWidth = 3; //直线的宽度状态设置
			this.foodsCtx.strokeStyle = "#000"; //直线的颜色状态设置

			this.foodsCtx.stroke()
		}

		for (let y = 0; y < this.height(); y += 100) {
			this.foodsCtx.moveTo(0, y);

			this.foodsCtx.lineTo(999, y);
			this.foodsCtx.lineWidth = 3; //直线的宽度状态设置
			this.foodsCtx.strokeStyle = "#000"; //直线的颜色状态设置

			this.foodsCtx.stroke()
		}
		*/
	},

	toRoll(){
		wx.navigateBack({
		  delta: 1,
		})
	}
})