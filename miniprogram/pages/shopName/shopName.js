import CFM from "../../modules/coreModule/cloudFuncManager";
import NavigateUtils from "../../utils/navigateUtils";
import PageCombiner from "../common/pageCombiner"
import userPage from "../common/userPage"

var main = {
	data: {
		shopName: ''
	},

	onUserLoaded() {
		this.setData({
			shopName: this.data.userInfo.data.shopName
		});
	},

	editShopName: async function () {
		if (this.data.shopName.length > 6) 
			wx.showToast({
				icon: 'error',
				title: '不能超过6个字！',
			})
		else if (this.data.shopName.length <= 0) 
			wx.showToast({
				icon: 'error',
				title: '不能为空！',
			})
		else if (this.data.shopName.length != 0) {
			var res = await CFM.call("editShopName", null,
				{ shopName: this.data.shopName });
			if (res.stats.updated == 0)
				wx.showToast({
					icon: 'error',
					title: '每天只修改一次！',
				})
			else {
				wx.showToast({ title: '修改成功！' });
				this.setData({
					['userInfo.data.shopName']: this.data.shopName
				})
			}
		}
	},

	back() {
		NavigateUtils.pop();
	}
}

Page(PageCombiner.Combine(main, userPage()))