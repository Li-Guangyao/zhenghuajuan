// pages/test/test.js
Page({

	data: {
		data: [
			{
				name: "张三",
				age: 0,
			}, {
				name: "李四",
				age: 5,
			}, {
				name: "啊啊",
				age: 56,
			}, {
				name: "哈哈",
				age: 51,
			}
		]
	},

	// 页面加载的时候会触发
	onLoad: function (options) {
	},

	// 点击按钮就触发这个函数
	changeName: function(){
		// 设置data里面的数据
		this.setData({
			name:"李四",
			age: 9
		})
	},

	request(){
		// 请求云函数
		wx.cloud.callFunction({
			name: 'testCloudFunction',
			// javascript 高级特性
			success:res=>{
				console.log(res)
				this.setData({
					age: res.result
				})
			}
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	}
})