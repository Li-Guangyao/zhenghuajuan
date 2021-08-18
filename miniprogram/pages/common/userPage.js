import UserManager from '../../modules/userModule/userManager'

var userPage = {
	data: {
		userInfo: null, // 用户数据
		userInfoObject: null // 用户对象
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
		var userInfoObject = await UserManager.judgeLogin(refresh);
		this.setData({
			userInfo: userInfoObject.data, 
			userInfoObject
		});
	}
}

export default userPage;