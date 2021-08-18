import getAccessToken from '../../utils/getAccessToken'
import changePhotoListFormat from '../../utils/changePhotoListFormat'
import { userUtils } from "../../utils/userUtils"
import CFM from '../../modules/coreModule/cloudFuncManager';
import UserManager from '../../modules/userModule/userManager';
import PageCombiner from '../common/pageCombiner';
import userPage from '../common/userPage';
import { navigateUtils } from '../../utils/navigateUtils';

var main = {
	data: {
		todayData:{
			count: 0,
			duration: 0,
			rollCount: 0,
		},
		totalData:{
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
	async getUserInfo() {
		this.setData({ userInfo: await userUtils.login(true)})
		await this.loadUserStat();
	},

	toMyPost(){
		navigateUtils.push('../myPost/myPost');
	},
	toShopName(){
		navigateUtils.push('../shopName/shopName');
	},

	toRoll() {
		navigateUtils.switch('../roll/roll');
	},
	toPost() {
		navigateUtils.switch('../homepage/homepage');
	},

}

Page(PageCombiner.Combine(main, userPage))