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
		wx.getUserProfile({
			desc: '允许该程序获得你的昵称、地址等信息，只用于展示，不做其它用途',
			success: (res) => {
				console.log(res)

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
			}
		})
	}
})