import UserManager from '../../modules/userModule/userManager'

var userPage = {
	data: {
		userInfo: null
	},

	async onShow() {
		this.setData({userInfo: await UserManager.judgeLogin()});
	}
}

export default userPage;