import UserManager from '../../modules/userModule/userManager'

/**
 * 带有用户功能的页面
 * @param {Boolean} refresh 是获取用户数据还是刷新用户数据
 */
var userPage = (refresh) => ({
	data: {
		userInfo: null, // 用户对象（UserInfo）
	},

	async onShow() {
		await this.judgeLogin(refresh);
	},

	async getUser() {
		await this.judgeLogin();
	},

	async refreshUser() {
		await this.judgeLogin(true);
	},

	async judgeLogin(refresh) {
		this.setData({
			userInfo: await UserManager.judgeLogin(refresh)
		});
		this.onUserLoaded();
	},

	onUserLoaded() {}
})

export default userPage;