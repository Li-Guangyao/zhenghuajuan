Page({
	data: {
		shopName: '',
		userInfo: wx.getStorageSync('userInfo')
	},

	editShopName: function () {
		if (this.data.shopName.length > 10) {
			wx.showToast({
				icon: 'error',
				title: '不超过10个字！',
			})
		} else if (this.data.shopName.length != 0) {
			wx.cloud.callFunction({
				name: "editShopName",
				data: {
					shopName: this.data.shopName
				}
			}).then(res => {
				if (res.result.stats.updated == 0) {
					wx.showToast({
						icon: 'error',
						title: '1天修改一次！',
					})
				} else {
					wx.showToast({
						title: '修改成功！',
					})
					this.setData({
						['userInfo.shopName']: this.data.shopName
					})
					wx.setStorageSync('userInfo', this.data.userInfo)
				}
			})
		} else {}
	},

	toRoll() {
		wx.navigateBack({
			delta: 1,
		})
	}
})