//获取标准的时间格式yyyy-mm-dd hh:mm，而非时间戳
import Post from '../../modules/postModule/post'
import NavigateUtils from '../../utils/navigateUtils'
import RollManager from '../../modules/rollModule/rollManager'
import PostManager from '../../modules/postModule/postManager'
import PageCombiner from '../common/pageCombiner'
import userPage from '../common/userPage'

var main = {
	data: {
		post: null,

		isRoll: false // 是否蒸花卷的分享

		/*
		content: '',
		location: null,
		fileList: [],
		userInfo: null,

		// 蒸花卷之后，导航到发帖页面
		rollName: null,
		rollCount: null,
		rollDuration: null,
		shareImgUrl:null,
		foodId: "", 
		quality: 0,

		sharing: false,
		sharePost: false
		*/
	},

	isPublished: false,

	// 数据操作
	// TODO: 提取共有操作
	getObject() {
		return this.data.post;
	},
	getData() {
		return this.getObject().data;
	},
	updateData(obj, refresh) {
		Object.assign(this.getData(), obj)
		if (refresh) this.refreshData();
	},
	refreshData() {
		this.getObject().refresh();
		this.setData({ post: this.getObject() });
	},

	onLoad: async function (e) {
		this.setData({ post: new Post()});

		var isRoll = !!e.isRoll;
		if (isRoll) {
			var roll = RollManager.curRollRecord;
			this.data.post.setRollRecord(roll);
		} else this.loadTempPost();

		this.setData({ isRoll });

		this.refreshData();
	},

	// 退出，把已经输入的内容缓存起来
	onUnload: async function () {
		if (this.data.isRoll) await RollManager.finish();
		if (!this.isPublished) this.saveTempPost();
	},

	// 读取临时帖子
	loadTempPost() {
		var tempPost = wx.getStorageSync('tempPost')
		if (!tempPost) return;

		this.updateData({
			content: tempPost.content,
			location: tempPost.location
		})
		this.getObject().setFileList(tempPost.fileList);
	},

	// 保存临时帖子
	saveTempPost() {
		wx.setStorage({
			key: 'tempPost',
			data: {
				content: this.getData().content,
				location: this.getData().location,
				fileList: this.getObject().fileList,
			}
		})
	},

	// 输入内容
	inputContent(e) {
		this.updateData({content: e.detail.value}, true)
	},

	// 获取用户位置
	async getLocation() {
		try {
			var res = await wx.chooseLocation();
			if (res.name) this.updateData({ location: res }, true)
			// TODO: 测试报错
			console.error(res, res.errMsg);

		} catch (e) {
			// TODO: 测试报错
			console.error(e, e.message, e.errMsg);

			if (e.errMsg || e.message == "chooseLocation:fail auth deny") {
				var res2 = await wx.showModal({
					title: '点击右上角进入设置，授权获取位置信息',
					showCancel: true
				});
				if (res2.confirm) wx.openSetting()
			}
		}
	},

	// 去除这个位置信息
	removeLocation() {
		this.updateData({ location: null }, true)
	},

	// 选择一些图片
	// upload选择完会触发这个函数，把所有选择的图片生成临时地址
	chooseMedia(e) {
		this.getObject().addMedia(e.detail.file);
		this.refreshData();
	},

	//删除点击的图片
	removeMedia(e) {
		this.getObject().removeMedia(e.detail.index);
		this.refreshData();
	},

	// 点击预览
	previewMedia(e) {
		wx.previewMedia({
			sources: this.getObject().fileList,
			current: e.detail.index,
			showmenu: true,
		})
	},

	// 匿名发帖
	changeAnonymous(e) {
		// this.setData({ isAnony: e.detail })
		this.getObject().setAnonymous(e.detail);
		this.refreshData();
	},

	// 点击发布按钮
	async publishPost() {
		if (this.getData().content == '')
			wx.showToast({
				title: '内容不能为空！', icon: 'none'
			});
		else {
			var res = await wx.showModal({
				content: '确定要发布吗？'
			})
			if (res.confirm) await this.onPostPublish();
		}
	},

	// 真的发布了！
	async onPostPublish() {
		try {
			await this.getObject().generateFileData();
			var post = await PostManager.add(this.getObject());

			if (this.data.isRoll) // 如果是蒸花卷记录
				await RollManager.addShare('post', post._id);

			this.isPublished = true;
			NavigateUtils.pop();
		} catch (e) {
			console.error(e);
			wx.showToast({
				title: e.message, icon: 'error'
			})
		}
	},
	
	back() { NavigateUtils.pop(); }
}

Page(PageCombiner.Combine(main, userPage()))