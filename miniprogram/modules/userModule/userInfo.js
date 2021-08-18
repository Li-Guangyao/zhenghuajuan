function UserInfo() {
	this.initialize.apply(this, arguments);
}

UserInfo.prototype.initialize = function(data) {

	this.data = {
		_id: null, // 用户ID
		_openid: null, // 用户openid
		
		nickName: '', // 昵称
		avatarUrl: '', // 头像

		gender: 0, // 性别
		country: '', // 国家
		province: '', // 省份
		city: '', // 城市
		language: '', // 语言

		rollCount: 0, // 现有卷数（小麦）
		totalRoll: 0, // 累计卷数（小麦）

		shopName: '',	// 店名
		lastEditTime: null, // 名称修改时间

		unlockFoods: [], // 解锁的菜品
		unlockTools: [], // 解锁的烹饪工具

		createdAt: null, // 注册日期

		status: 0, // 用户状态，0为正常，1为封禁
	}
	Object.assign(this.data, data);
};

export default UserInfo;