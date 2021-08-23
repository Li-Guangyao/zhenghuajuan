import RollManager from "../../modules/rollModule/rollManager";
import CanvasUtils from "../../utils/canvasUtils"
import DateUtils from "../../utils/dateUtils";
import NavigateUtils from "../../utils/navigateUtils";
import PageCombiner from "../common/pageCombiner";
import foodPage from "../common/foodPage";
import userPage from "../common/userPage";
import sharePage from "../common/sharePage";

var main = {
	data: {
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

	onLoad: async function (options) {
		this.setupTimeRanges();
	},

	onUnload: function () {
		CanvasUtils.reset();
	},

	/**
	 * 设置时间范围
	 */
	setupTimeRanges: function () {
		this.timeRanges = DateUtils.getTimeRages();
	},

	// 配置Canvas（桌面图片onload后执行）
	async setupCanvas() {
		var query = this.createSelectorQuery()
		await CanvasUtils.setupById(query, "foods")

		this.foodsCanvas = CanvasUtils.canvas;
		this.foodsCtx = CanvasUtils.ctx;
		
		this.setData({
			positions: this.generatePositions(), // 每个菜品的位置
		})

		this.refreshData();
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

			var res = await RollManager.getMy(
				range[0], range[1], {status: 1}
			);

			var key = 'records[' + this.data.curIndex + ']'
			this.setData({
				[key]: this.processRecordData(res)
			});

			data = this.curRecords();
		}
		this.drawData(data.records);
	},

	processRecordData: function (records) {
		var res = { records };

		records.forEach(r => 
			(res[r.timeKey] ||= []).push(r)
		)

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
		if (!pos) return;
		
		console.info("drawFood: ", i, rec, pos)
		// pos = this.adjustPos(pos);

		var x = pos[0], y = pos[1];
		var w = this.foodSize[0], h = this.foodSize[1];

		await CanvasUtils.drawFood(rec.food.data, rec.data.quality,
			x, y, w, h);
	},

	// 清空画布的内容
	clearCanvas: function () {
		CanvasUtils.clearAll();
	},

	toRanklist() {
		NavigateUtils.change('../ranklist/ranklist');
	},
	back() { 
		NavigateUtils.pop(); 
	}
}

Page(PageCombiner.Combine(main, [userPage(), foodPage, sharePage()]))