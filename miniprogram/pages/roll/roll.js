Page({
	data: {
		recordList: [{
			rollName: "学习",
			rollCount: 30,
			rollTime: 30,

			avatarUrl: "",
			timeDiff: "1天前",
			nickName: "我自己",
			likeValue: 42,
			content: "今天学了30分钟的Java的反射",
			fileList: [],
		}, {
			rollName: "编程",
			rollCount: 15,
			rollTime: 15,

			avatarUrl: "",
			timeDiff: "1天前",
			nickName: "我自己",
			likeValue: 28,
			content: "专注了15分钟",
			fileList: [],
		}, {

			avatarUrl: "",
			timeDiff: "1天前",
			nickName: "我自己",
			likeValue: 28,
			content: "今天啥也没干",
			fileList: [],
		}],

		name: '',
		// recordList: [],
		showDialog: false,
		showPopup: false,

		durationIndex: 0,
		duration: [15, 30, 45, 60, 90, 120],
		rollNumber: [15, 30, 45, 60, 90, 120]
	},

	// 点击页面下方+按钮
	showDialog() {
		this.setData({
			showDialog: true
		})
	},

	// 在Dialog中，点击时间
	showPopup() {
		this.setData({
			showPopup: !this.data.showPopup
		})
	},

	inputActivityName(e) {
		console.log(e)
		this.setData({
			name: e.detail.value
		})
	},

	onDialogClose(e) {
		switch (e.detail) {
			case "confirm":
				wx.navigateTo({
					url: '../rolling/rolling?duration=' + this.data.duration[this.data.durationIndex] + "&name=" + this.data.name,
				})
				break;
			default:
				this.setData({
					showDialog: false,
					durationIndex: 0
				});
				break;
		}
	},

	// 在时间弹出框中，选择了一个时间长度
	choseDuration(e) {
		this.setData({
			durationIndex: e.detail.index
		})
		this.showPopup()
	},
})