import getAccessToken from '../../utils/getAccessToken'
import changePhotoListFormat from '../../utils/changePhotoListFormat'
import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		userInfo: null,
	},

	onLoad: async function (options) {
		this.setData({ userInfo: await userUtils.getUserInfo() });
	},

	// 如果是新用户，就需要授权获取
	async getUserInfo() {
		this.setData({ userInfo: await userUtils.login(true)})
	},
	
	// 点击了“我的帖子”
	toMyPost(){
		wx.navigateTo({ url: '../myPost/myPost' })
	},
	toShopName(){
		wx.navigateTo({ url: '../shopName/shopName' })
	},
})