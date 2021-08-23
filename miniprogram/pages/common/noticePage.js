import NoticeManager from '../../modules/noticeModule/noticeManager'

var noticePage = {
	data: {
		notices: [], // 公告数据（Notice对象）
		showNoticePopup: false,

		curNotice: null
	},

	async onLoad(e) {
		var notices = await NoticeManager.load();
		this.setData({ notices });
		this.refreshCurNotice();
		this.onNoticeLoaded();
	},

	// 刷新当前公告
	refreshCurNotice() {
		var curNotice = this.data.notices.find(n => !n.isRead);
		this.setData({ 
			curNotice, showNoticePopup: !!curNotice 
		});
	},

	onNoticeLoaded() { }
}

export default noticePage;