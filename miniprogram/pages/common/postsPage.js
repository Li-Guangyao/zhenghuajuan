import PostManager from '../../modules/postModule/postManager';
import UserManager from '../../modules/userModule/userManager'
import NavigateUtils from '../../utils/navigateUtils';

/**
 * 页面配置
 * @param {'all' | 'my'} type 页面类型
 */
var postsPage = (type) => ({
	queryParams: {
		pageNum: 0,
		pageSize: 20
	},

	pictureFlag: false, // 是否打开图片

	onUnload() {
		this.resetPage();
	},

	async onShow(e) {
		if (this.pictureFlag)
			this.pictureFlag = false;
		else {
			this.resetPage();
			await this.refreshPage();
		}
	},

	getFunc() {
		switch (type || 'all') {
			case 'all': return PostManager.getAll.bind(PostManager); 
			case 'my': return PostManager.getMy.bind(PostManager);
		}
	},

	resetPage() {
		PostManager.clearPosts();
		this.queryParams.pageNum = 0;
	},

	async refreshPage(newestDate) {
		var getFunc = this.getFunc(); // 根据类型获取getFunc
		
		var skipNum = this.queryParams.pageNum * 
			this.queryParams.pageSize;
		var posts = await getFunc(skipNum, newestDate);

		if (newestDate && posts.length <= 0) 
			wx.showToast({
				icon: 'error', title: '没有更多了~',
			})

		var comp = this.selectComponent('#postDisplay');
		if (comp) comp.refreshData();

		/*
		posts = this.data.posts.concat(posts);

		this.setData({ posts });
		*/
	},
	
	// 下拉刷新
	async onPullDownRefresh() {
		this.resetPage();
		await this.refreshPage()
		wx.stopPullDownRefresh()
	},

	// 触底加载
	async onReachBottom() {
		this.queryParams.pageNum++;
		var newestPost = PostManager.posts[0];
		var newestDate = newestPost.data.createdAt;
		newestDate = Date.parse(newestDate);
		await this.refreshPage(newestDate);
	},

	// 点击视频或者图片预览
	previewMadia(e) {
		this.pictureFlag = true;
	}
})

export default postsPage;