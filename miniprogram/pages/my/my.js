import getAccessToken from '../../utils/getAccessToken'
import changePhotoListFormat from '../../utils/changePhotoListFormat'
import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		userInfo: wx.getStorageSync('userInfo'),
	},

	// 暂时注释(在app.js中使用了getUsrInfo函数,每当小程序加载时就触发)
	// onLoad: async function (options) {
	// 	this.setData({ userInfo: await userUtils.getUserInfo() });
	// },

	// 如果是新用户，就需要授权获取
	async getUserInfo() {
		this.setData({ userInfo: await userUtils.login(true)})
	},

	test(){
		wx.cloud.callFunction({
			name: 'saveUserInfo'
		}).then(res=>{
			console.log(res)
		})
	},

	toMyPost(){
		wx.navigateTo({ url: '../myPost/myPost' })
	},
	toShopName(){
		wx.navigateTo({ url: '../shopName/shopName' })
	},

	toRoll() {
		wx.switchTab({ url: '../roll/roll' })
	},
	toPost() {
		wx.switchTab({ url: '../homepage/homepage' })
	},

})