import PostManager from '../../modules/postModule/postManager';
import UserManager from '../../modules/userModule/userManager'
import NavigateUtils from '../../utils/navigateUtils';

/**
 * 页面配置
 * @param {'all' | 'my'} type 页面类型
 */
var postsPage = (type) => ({
	data: { posts: [] },

	queryParams: {
		pageNum: 0,
		pageSize: 20
	},

	pictureFlag: false, // 是否打开图片

	onLoad() {
		this.queryParams.pageNum = 0;
	},

	async onShow() {
		if (this.pictureFlag)
			this.pictureFlag = false;
		else 
			await this.refreshPage();
	},

	getFunc() {
		console.log(PostManager);
		switch (type || 'all') {
			case 'all': return PostManager.getAll.bind(PostManager); 
			case 'my': return PostManager.getMy.bind(PostManager);
		}
	},

	async refreshPage(newestDate) {
		var getFunc = this.getFunc(); // 根据类型获取getFunc
		
		var skipNum = this.queryParams.pageNum * 
			this.queryParams.pageSize;
		var posts = await getFunc(skipNum, newestDate);

		if (newestDate && postObjects.length <= 0) 
			wx.showToast({
				icon: 'error', title: '没有更多了~',
			})

		this.setData({ posts });
	},
	
	// 下拉刷新
	async onPullDownRefresh() {
		await this.refreshPage()
		wx.stopPullDownRefresh()
	},

	// 触底加载
	async onReachBottom() {
		this.queryParams.pageNum++;
		var newestDate = this.data.posts[0].createdAt;
		await this.refreshPage(newestDate);
	},

	// 点击视频或者图片预览
	previewMadia(e) {
		var comp = this.selectComponent('#postDisplay');
		if (!comp) return;

		comp.previewMadia(e);
		this.pictureFlag = true;
	}
})

export default postsPage;