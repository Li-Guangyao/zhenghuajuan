import UserManager from '../../modules/userModule/userManager'

var userPage = {
	data: {
		userInfo: null, // 用户对象（UserInfo）
	},

	async onShow() {
		await this.refreshUser();
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
	},

}

export default userPage;