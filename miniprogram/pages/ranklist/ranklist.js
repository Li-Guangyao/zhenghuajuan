Page({
	data: {
		userInfo: null,
		dayRankList: [],
		weekRankList: [],
		topRankList: [],
		updateDate: null,

		myDayRank: -1,
		myDayValue: 0,
		myWeekRank: -1,
		myWeekValue: 0,

		tabbar: [{
				id: 0,
				name: "日排行",
				isChosen: true
			},
			{
				id: 1,
				name: "周排行",
				isChosen: false
			}
		],
		chosenTabIndex: 0,

		// 初始化wholeRank的高度
		wholeRankHeight: null
	},

	onLoad: function (options) {
		this.initPageStyle()
		this.initPageContent()
	},

	// 排行榜更新时间显示，格式标准化
	setDateFormat(date) {
		var date = new Date(date)
		var Y = date.getFullYear() + '-';
		var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
		var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
		var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
		var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
		return M + D + h + m;
	},

	async judgeLogin() {
		var userInfo = await wx.getStorageSync('userInfo')
		if (!userInfo) {
			wx.showModal({
				title: '卷王同志，请先登陆再来',
				showCancel: true,

				success(res) {
					wx.switchTab({
						url: '../my/my',
					})
				}
			})
		} else {
			this.setData({
				userInfo: userInfo
			})
		}
	},

	initPageStyle() {
		//根据底部下单区域的高矮，来初始化页面的大小
		var query = wx.createSelectorQuery()

		query.select('.tabbar').boundingClientRect()
		query.select('.my-rank').boundingClientRect()
		setTimeout(
			query.exec.bind(this, res => {
				console.log(res)
				this.setData({
					wholeRankHeight: res[1].top - res[0].bottom
				})
			}), 1000
		)
	},

	async initPageContent(){
		wx.showLoading({
			title: '加载中',
		})

		await wx.cloud.callFunction({
			name: 'getDayJuanwang'
		}).then(res => {
			console.log(res)
			this.setData({
				dayRankList: res.result.rankList.dayRankList,
				myDayRank: res.result.myDayRank,
				myDayValue: res.result.myDayValue
			})
		})

		await wx.cloud.callFunction({
			name: 'getWeekJuanwang'
		}).then(res => {
			console.log(res)
			this.setData({
				weekRankList: res.result.rankList.weekRankList,
				myWeekRank: res.result.myWeekRank,
				myWeekValue: res.result.myWeekValue
			})
		})

		await wx.cloud.callFunction({
			name: 'getTopJuanwang'
		}).then(res => {
			console.log(res)
			this.setData({
				topRankList: res.result.rankList.weekRankList,
				updateDate: this.setDateFormat(res.result.rankList.createdAt)
			})
		})

		wx.hideLoading()
	},

	tabbarChange(e) {
		//获取点击的tabbar项下标
		const chosenTabIndex = e.detail.index;
		let tabbar = this.data.tabbar;
		//根据获取的下表，改变tabbar
		tabbar.forEach((v, i) => i === chosenTabIndex ? v.isChosen = true : v.isChosen = false);
		// console.log(this)
		this.setData({
			tabbar,
			chosenTabIndex: chosenTabIndex
		});
	},

	swiperChange: function (e) {
		var chosenTabIndex = e.detail.current
		let tabbar = this.data.tabbar;
		//根据获取的下表，改变tabbar
		tabbar.forEach((v, i) => i === chosenTabIndex ? v.isChosen = true : v.isChosen = false);
		this.setData({
			tabbar,
			chosenTabIndex: chosenTabIndex
		})
	},

	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.judgeLogin()
	},

	onHide: function () {

	},

	onUnload: function () {

	},

	onPullDownRefresh: function () {
		this.initPageContent()
		wx.stopPullDownRefresh()
	},

	onReachBottom: function () {

	},

})