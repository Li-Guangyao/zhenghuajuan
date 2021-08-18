import CFM from "../../modules/coreModule/cloudFuncManager"
import NavigateUtils from "../../utils/navigateUtils"
import PageCombiner from "../common/pageCombiner"
import userPage from "../common/userPage"

var main = {
	data: {
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
	},

	onLoad: async function (options) {
		// await this.judgeLogin()
		this.initPageContent()
	},

	/*
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
	*/

	// 初始化页面内容
	async initPageContent() {
		var getRankLists = this.data.tab.map(
			t => this.getRankList(t[1])
		)
		var res = await Promise.all(getRankLists);

		res.forEach((r, i) => {
			this.data.rankList[i] = r.rankList;
			this.data.myRankInfo[i] = r.myValue;
		});

		this.setData({
			rankList: this.data.rankList,
			myRankInfo: this.data.myRankInfo,
			topRankList: this.data.rankList[0]
		})
	},

	// 获得排行榜信息
	getRankList(type) {
		return CFM.call('getJuanwang', null, { type });
	},

	// 点击切换日/周/月榜
	onTabbarChange(e) {
		this.setData({
			tabIndex: e.detail.index,
			topRankList: this.data.rankList[e.detail.index]
		})
	},

	onPullDownRefresh: function () {
		this.initPageContent()
		wx.stopPullDownRefresh()
	},
	
	toRollRecord() {
		NavigateUtils.change('../rollRecord/rollRecord');
	},
	back() { NavigateUtils.pop(); }
}

Page(PageCombiner.Combine(main, userPage))