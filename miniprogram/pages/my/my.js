Page({
	data: {
		userInfo: wx.getStorageSync('userInfo'),
	},

	onLoad: async function (options) {
		wx.showLoading({
			title: '加载中',
		})

		wx.cloud.callFunction({
			name: 'getUser',
			success: (res) => {
				this.setData({
					userInfo: res.result
				})
				wx.setStorageSync('userInfo', res.result)
			}
		})

		wx.hideLoading({
			success: (res) => {},
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

	test() {
		wx.getSystemInfo({
			success: (result) => {
				console.log(result)
			},
		})
	}

})