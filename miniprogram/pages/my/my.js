import getAccessToken from '../../utils/getAccessToken'
import changePhotoListFormat from '../../utils/changePhotoListFormat'

Page({
	data: {
		userInfo: null,
	},

	onLoad: function (options) {
		wx.cloud.callFunction({
			name: 'getUser',
			success: (res) => {
				this.setData({
					userInfo: res.result
				})
				wx.setStorageSync('userInfo', res.result)
			}
		})
	},

	// 如果是新用户，就需要授权获取
	getUserInfo() {
		wx.getUserProfile({
			desc: '获取用户信息',
			success: async (res) => {

				var userInfo = (await wx.cloud.callFunction({
					name: 'saveUserInfo',
					data: { userInfo: res.userInfo },
				})).result

				wx.setStorageSync('userInfo', userInfo)

				this.setData({ userInfo })
			},
			fail: res => {
				console.log(res)
			}
		})
	},
	
	// 点击了“我的帖子”
	toMyPost(){
		wx.navigateTo({
			url: '../myPost/myPost',
		})
	},

	toShopName(){
		wx.navigateTo({
		  url: '../shopName/shopName',
		})
	},
	
	test() {
		// wx.cloud.callFunction({
		// 	name: 'getAccessToken'
		// }).then(res=>{
		// 	console.log(res)
		// })

		// changePhotoListFormat()
	},
})