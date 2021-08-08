Page({
	data: {
		chosenTabIndex: 0,

		// 菜品数据库
		foods: [],

		// 自己蒸花卷的记录
		records: {},
	},

	timeRanges: null,

	foodsCanvas: null,
	// canvas的context属性
	foodsCtx: null,
	// 图片缓存
	imageCache: {},

	onLoad: async function (options) {
		this.setupTimeRanges();
		await this.loadFoods();
	},

	/**
	 * 准备绘制
	 */
	onReady: function () {
		this.setupCanvas();
	},

	// 配置Canvas
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
				// 缩放
				// this.foodsCtx.scale(dpr, dpr);

				this.refreshData();
			})
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
			...foods,
			..._foods
		}
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
	selectIndex: function (chosenTabIndex) {
		// 根据获取的下表，改变cate
		this.setData({
			chosenTabIndex
		});

		this.refreshData();
	},

	/**
	 * 当前的选择的时间段
	 */
	curTimeRange: function () {
		return this.timeRanges[this.data.chosenTabIndex];
	},

	/**
	 * 刷新数据
	 */
	refreshData: async function () {
		if (!this.data.records[this.data.chosenTabIndex]) {
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
			var recordItemName = 'records[' + this.data.chosenTabIndex + ']'
			this.setData({
				[recordItemName]: res.result
			});
		}
		this.drawData();
	},

	/**
	 * 绘制数据
	 */
	drawData: function () {
		this.clearCanvas()

		// 每一行有6个图标
		const colCount = 6;
		const w = this.foodsCanvas.width / colCount;
		const h = w;

		// 自己在某个时间段所有的蒸花卷记录
		this.data.records[this.data.chosenTabIndex].forEach(async (rec, i) => {
			var x = i % colCount * w;
			var y = Math.floor(i / colCount) * h;
			var src = this.data.foods[rec.foodId].images[rec.quality];
			var cache = this.imageCache[src] ||= await wx.getImageInfo({src})

			var draw = () =>
				this.foodsCtx.drawImage(cache.img, 0, 0, cache.width, cache.height, x, y, w, h);

			if (!cache.img) {
				cache.img = this.foodsCanvas.createImage();
				cache.img.src = cache.path;
				cache.img.onload = draw;
			} else draw();
		})
	},

	// 清空画布的内容
	clearCanvas(params) {
		this.foodsCtx.clearRect(0, 0, this.foodsCanvas.width, this.foodsCanvas.height)
	}
})