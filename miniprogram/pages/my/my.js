import UserManager from '../../modules/userModule/userManager';
import PageCombiner from '../common/pageCombiner';
import userPage from '../common/userPage';
import NavigateUtils from '../../utils/navigateUtils';
import sharePage from '../common/sharePage';

var main = {
	data: {
		todayData: {
			count: 0,
			duration: 0,
			rollCount: 0,
		},
		totalData: {
			count: 0,
			duration: 0,
			rollCount: 0,
		},
	},

	onShow: async function() {
		await this.loadUserStat();
	},

	async loadUserStat() {
		var todayData = await UserManager.getTodayData();
		var totalData = await UserManager.getTotalData();

		this.setData({todayData, totalData});
	},

	// 如果是新用户，就需要授权获取
	async login() {
		this.setData({ userInfo: await UserManager.login(true)})
		await this.loadUserStat();
	},

	toMyPost(){
		NavigateUtils.push('../myPost/myPost');
	},
	toShopName(){
		NavigateUtils.push('../shopName/shopName');
	},

	toRoll() {
		NavigateUtils.switch('../roll/roll');
	},
	toPost() {
		NavigateUtils.switch('../homepage/homepage');
	},

}

Page(PageCombiner.Combine(main, userPage(), sharePage()))