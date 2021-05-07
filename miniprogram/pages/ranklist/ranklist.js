Page({
	data: {
		myUserInfo: null,
		dayRankList: [],
		weekRankList: [],
		updateDate: null,

		myRank: -1,
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

		// 初始化wholeRank的高度
		wholeRankHeight: null
	},

	onLoad: async function (options) {
		await this.judgeLogin()
		this.initPageStyle()

		wx.showLoading({
		  title: '加载中',
		})

		await wx.cloud.callFunction({
			name: 'getDayJuanwang'
		}).then(res => {
			this.setData({
				dayRankList: res.result.rankList.dayRankList,
				myRank: res.result.myRank
			})
		})

		await wx.cloud.callFunction({
			name: 'getWeekJuanwang'
		}).then(res => {
			console.log(res)
			this.setData({
				weekRankList: res.result.rankList.weekRankList,
				myRank: res.result.myRank,
				updateDate: this.setDateFormat(res.result.rankList.createdAt)
			})
		})

		wx.hideLoading()
	},

	setDateFormat(date){
		var date = new Date(date)
		var Y = date.getFullYear() + '-';
		var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
		var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
		var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
		var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes());
		return M+D+h+m;

	},

	async judgeLogin() {
		var userInfo = await wx.getStorageSync('userInfo')
		if (!userInfo) {
			wx.showModal({
				title: '陈独秀同志，请先登陆再来',
				showCancel: true,

				success(res) {
					if (res.confirm) {
						wx.switchTab({
							url: '../my/my',
						})
					} else if (res.cancel) {
						wx.navigateBack({
							delta: 1,
						})
					}
				}
			})
		} else {
			this.setData({
				userInfo: userInfo
			})
		}
	},

	initPageStyle() {
		wx.getSystemInfo({
			success: (result) => {
				console.log(result)
			},
		})

		//根据底部下单区域的高矮，来初始化页面的大小
		var query = wx.createSelectorQuery()

		query.select('.tabbar').boundingClientRect()
		query.select('.my-rank').boundingClientRect()
		setTimeout(		
			query.exec.bind(this, res => {
				console.log(res)
				this.setData({
					wholeRankHeight: res[1].top-res[0].bottom
				})
			}), 1000
		)
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
			chosenTabIndex
		});
	},

	swiperChange: function (e) {
		var chosenTabIndex = e.detail.current
		let tabbar = this.data.tabbar;
		//根据获取的下表，改变tabbar
		tabbar.forEach((v, i) => i === chosenTabIndex ? v.isChosen = true : v.isChosen = false);
		this.setData({
			tabbar,
			chosenTabIndex
		})
	},

	onReady: function () {

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

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

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