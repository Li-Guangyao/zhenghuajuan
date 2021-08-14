import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		userInfo: null,
		updateDate: null,

		// 所有的rank信息，包括日/周/月
		rankList: [],
		// 用于显示的list，在wxml中写死，后端通过改变这个值，改变前端的显示
		topRankList: [],

		// 三项分别对应日/周/月排名数据
		// 二级数组：[第几名，获得几个花卷]
		myRankInfo: [
			[-1, -1],
			[-1, -1],
			[-1, -1]
		],

		tab: [
			['日榜', 'day'],
			['周榜', 'week'],
			['月榜', 'month']
		],
		tabIndex: 0,

		// 初始化wholeRank的高度
		wholeRankHeight: null
	},

	onLoad: async function (options) {
		await this.judgeLogin()
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
		this.setData({ userInfo : await userUtils.judgeLogin() })
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

	// 初始化页面内容
	async initPageContent() {
		wx.showLoading({
			title: '加载中'
		})

		const getRankList = this.data.tab.map(e => this.getRankList(e[1]))
		var res = await Promise.all(getRankList)

		for (var i = 0; i < res.length; i++) {
			this.setData({
				['rankList[' + i + ']']: res[i].result.rankList,
				['myRankInfo[' + i + ']']: [res[i].result.myRank, res[i].result.myValue]
			})
		}

		this.setData({
			topRankList: this.data.rankList[0]
		})
		wx.hideLoading()
	},

	// 获得排行榜信息
	getRankList(type) {
		return wx.cloud.callFunction({
			name: 'getJuanwang',
			data: {
				type
			}
		})
	},

	// 点击切换日/周/月榜
	onTabbarChange(e) {
		this.setData({
			tabIndex: e.detail.index,
			topRankList: this.data.rankList[e.detail.index]
		})
	},

	onShow: function () {
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

	toRoll(){
		wx.navigateBack({
		  delta: 1,
		})
	}
})