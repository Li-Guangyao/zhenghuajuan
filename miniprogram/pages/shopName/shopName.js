Page({

	data: {
		shopName: '',
		userInfo: wx.getStorageSync('userInfo')
	},

	onLoad: function (options) {

	},

	onReady: function () {

	},

	onShow: function () {

	},

	onHide: function () {

	},

	onUnload: function () {

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
				console.log(res)
				if (res.result.stats.updated == 0) {
					wx.showToast({
						icon: 'error',
						title: '30天修改一次！',
					})
				} else {
					wx.showToast({
						title: '修改成功！',
					})
				}
			})
		} else {}
	},

	toRoll() {
		wx.navigateBack({
			delta: 1,
		})
	},

	// 一个测试函数
	test() {
		const db = wx.cloud.database()
		const _ = db.command

		db.collection('t_test').doc('cd045e75610d4741038d4d7d2ed967bc').update({
			data: {
				aaa: _.rename('ccc')
			}
		}).then(res => {
			console.log(res)
		})
	}
})