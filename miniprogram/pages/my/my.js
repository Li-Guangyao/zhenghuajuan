import getAccessToken from '../../utils/getAccessToken'
import changePhotoListFormat from '../../utils/changePhotoListFormat'
import { userUtils } from "../../utils/userUtils"

Page({
	data: {
		userInfo: 0,
		todayData:{
			timesCount:0,
			rollDuration:0,
			rollCount:0,
		},
		totalData:{
			timesCount:0,
			rollDuration:0,
			rollCount:0,
		},
		
	},

	onLoad: async function (options) {
		this.setData({ userInfo: await userUtils.getUserInfo() });
		this.getTotalData();
		this.getTodayData();

	},

	getTotalData(){
		wx.cloud.callFunction({
			name:'getTotalData'
		}).then((res)=>{
			this.setData({
				'totalData.timesCount': res.result.timesCount,
				'totalData.rollDuration':res.result.rollDuration,
				'totalData.rollCount':res.result.rollCount
			})
		})
	},

	getTodayData(){
		wx.cloud.callFunction({
			name:'getTodayData'
		}).then((res)=>{
			this.setData({
				'todayData.timesCount': res.result.timesCount,
				'todayData.rollDuration':res.result.rollDuration,
				'todayData.rollCount':res.result.rollCount
			})
		})
	},

	// 如果是新用户，就需要授权获取
	async getUserInfo() {
		this.setData({ userInfo: await userUtils.login(true)})
		this.getTotalData();
		this.getTodayData();
	},
	
	// 点击了“我的帖子”
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