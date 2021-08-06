// pages/rollRecord/rollRecord.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

		// 时间区间分类
		cate: [{
			id: 0,
			name: "本日",
			isChosen: true
		},
		{
			id: 1,
			name: "本周",
			isChosen: false
		},
		{
			id: 2,
			name: "本月",
			isChosen: false
		}],

		chosenTabIndex: 0,
	},

	timeRanges: [],

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		
	},

	/**
	 * 设置时间范围
	 */
	setupTimeRanges: function() {
		var now = new Date();
		var nowStamp = now.getTime();

		var seconds = now.getSeconds();
		var minutes = now.getMinutes();
		var hours = now.getHours();

		var dayStamp = 24 * 60 * 60 * 1000;

		var dayStartStamp = nowStamp - (seconds + minutes * 60 + hours * 3600) * 1000;
		var dayEndStamp = dayStartStamp + dayStamp;
		
		var day = now.getDay() || 7; // 星期数（if (day == 0) day = 7;）
		var weekStartStamp = dayStartStamp - day * dayStamp;
		var weekEndStamp = weekStartStamp + 7 * dayStamp;

		var date = now.getDate();
		var month = now.getMonth();
		var year = now.getFullYear();

		var monthStartStamp = new Date(year, month, 1);
		var monthEndStamp = new Date(year, month + 1, 0);

	},

	/**
	 * Tabbar改变回调
	 */
	onTabbarChange: function(e) {
		this.selectIndex(e.detail.index);
	},

	/**
	 * 滑动器改变回调
	 */
	onSwiperChange: function (e) {
		this.selectIndex(e.detail.current);
	},

	/**
	 * 选择页面索引
	 */
	selectIndex: function (chosenTabIndex) {
		let tabbar = this.data.tabbar;
		
		// 根据获取的下表，改变tabbar
		tabbar.forEach((v, i) => v.isChosen = i === chosenTabIndex);
		this.setData({ tabbar, chosenTabIndex });
	} 


})