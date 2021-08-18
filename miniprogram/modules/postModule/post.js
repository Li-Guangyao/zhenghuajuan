import FSM from '../coreModule/fileStroageManager'
import UserManager from '../userModule/userManager'
import FoodManager from '../userModule/foodManager'
import MathUtils from '../../utils/mathUtils'
import PostComment from './postComment';
import PostLike from './postLike';

function Post() {
	this.initialize.apply(this, arguments);
}

Post.prototype.initialize = function(data) {

	this.data = {
		_id: null, // 帖子ID
		_openid: null, // 对应用户openid
		content: '', // 内容
	
		photoList: [], // 图像列表
		videoList: [], // 视频列表
		typeList: [], // 类型列表
	
		location: null, // 定位
	
		createdAt: null, // new Date() 发布日期
	
		likeValue: 0, // 点赞数

		comments: [], // 评论列表
		likes: [], // 点赞列表

		rollRecordId: null, // 关联的蒸花卷记录
		
		anonyFoodId: null, // 是否匿名，如果是，匿名的菜品ID
		anonyFoodQuality: 0, // 匿名的菜品品质
		anonyFoodDesc: null, // 匿名的菜品描述词
	
		visibility: 1, // 可见性，0为对所有人隐藏，1为公开，2仅自己可见
	
		status: 1, // 审核状态，0为待审核，1为已审核，2为审核未通过
	}
	Object.assign(this.data, data);

	this._processComments();
	this._processLikes();
};

Post.prototype._processComments = function() {
	this.data.comments = this.data.comments.map(c => 
		c instanceof PostComment ? this.processComment(c) : c)
}
Post.prototype._processComment = function(comment) {
	return new PostComment(this, comment);
}

Post.prototype._processLikes = function() {
	this.data.comments = this.data.comments.map(l => 
		l instanceof PostLike ? this._processLike(l) : l)
}
Post.prototype._processLike = function(like) {
	return new PostLike(this, like);
}

Post.PhotoFilePath = 'postPhoto';
Post.VideoFilePath = 'postVideo';

Post.Create = async function(content, 
	fileList, location, isAnony, visibility) {
	visibility ||= 1;
	
	var data = {
		content, location, visibility
	}

	var fileData = this._GenerateFileLists(fileList);
	Object.assign(data, fileData);

	if (isAnony) {
		var anonyData = this._ProcessAnony();
		Object.assign(data, anonyData);
	}

	return new Post(data);
}
Post._ProcessAnony = function() {
	var food = FoodManager.getRandom();
	var imgCnt = food.data.images.length;
	var quality = MathUtils.randomInt(imgCnt);

	return {
		anonyFoodId: food.data._id, quality
	}
}
Post._GenerateFileLists = async function(fileList) {
	var fileList = this.data.fileList
	var photoList = [], videoList = [], typeList = []

	fileList.forEach(f => {
		switch(f.type) {
			case 'image': photoList.push(f); break;
			case 'video': videoList.push(f); break;
		}
		typeList.push(f.type)
	})

	var photoList = await FSM.uploadFiles(photoList, Post.PhotoFilePath)
	var videoList = await FSM.uploadFiles(videoList, Post.VideoFilePath)

	return { photoList, videoList, typeList }
}

export default Post;