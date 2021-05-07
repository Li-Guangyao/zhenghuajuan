Page({
	data: {
		userInfo: wx.getStorageSync('userInfo'),
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
		console.log('getUserInfo')

		wx.getUserProfile({
			desc: '获取用户信息',
			success: (res) => {

				this.setData({
					userInfo: res.userInfo
				})

				wx.setStorageSync('userInfo', res.userInfo)

				wx.cloud.callFunction({
					name: 'saveUserInfo',
					data: {
						userInfo: this.data.userInfo
					},
				})
			},

			fail: res => {
				console.log(res)
			}
		})
	},

})