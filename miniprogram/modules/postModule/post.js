import FSM from '../coreModule/fileStroageManager'
import UserManager from '../userModule/userManager'
import FoodManager from '../foodModule/foodManager'
import MathUtils from '../../utils/mathUtils'
import PostComment from './postComment';
import PostLike from './postLike';
import DateUtils from '../../utils/dateUtils';
import CFM from '../coreModule/cloudFuncManager';

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
		coordinate: null, // 坐标
	
		createdAt: null, // new Date() 发布日期
	
		comments: [], // 评论列表
		likes: [], // 点赞列表

		rollRecordId: null, // 关联的蒸花卷记录
		
		anonyFoodId: null, // 是否匿名，如果是，匿名的菜品ID
		anonyFoodQuality: 0, // 匿名的菜品品质
		anonyFoodDesc: null, // 匿名的菜品描述词
	
		visibility: 1, // 可见性，0为对所有人隐藏，1为公开，2仅自己可见
	
		status: 1, // 审核状态，0为待审核，1为已审核，2为审核未通过

		userInfo: null, // 查询时返回
		rollRecord: null // 查询时返回
	}
	Object.assign(this.data, data);

	this.isAnony = !!this.data.anonyFoodId;
	this.fileList = [];
	this.timeDiff = '';

	this.likeValue = 0; // 累计点赞数
	this.commentCnt = 0; // 累计评论数

	this.anonyName = this._getAnonyName();
	this.anonyImage = this._getAnonyImage();

	this.rollFood = this._getRollFood();

	this.isSelfPost = false; // 是否自己的帖子
	this.curLike = null; // 当前用户点赞

	this.postStyle = this._getPostStyle();

	this._generateTimeDiff();
	this._convertFileList();
	this._processComments();
	this._processLikes();

	this.refresh();
};

Post.prototype._getAnonyName = function() {
	if (!this.isAnony) return '';
	var food = FoodManager.foods[this.data.anonyFoodId];
	return this.data.anonyFoodDesc + food.data.name;
}

Post.prototype._getAnonyImage = function() {
	if (!this.isAnony) return '';
	var food = FoodManager.foods[this.data.anonyFoodId];
	return food.data.images[this.data.anonyFoodQuality];
}

Post.prototype._getRollFood = function() {
	if (!this.data.rollRecord) return null;
	return FoodManager.foods[this.data.rollRecord.foodId];
}

Post.prototype._getPostStyle = function() {
	if (this.data.rollRecord) return 'roll-post';
	if (this.data.anonyFoodId) return 'anony-post';
	return ''
}

Post.prototype._isSelfPost = function() {
	if (!UserManager.userInfo) return false;
	var userInfo = UserManager.userInfo.data;
	return userInfo._openid == this.data._openid;
}

Post.prototype._processComments = function() {
	this.data.comments = this.data.comments.map(
		this._processComment.bind(this))
}
Post.prototype._processComment = function(comment) {
	return comment instanceof PostComment ? comment : 
		new PostComment(this, comment);
}

Post.prototype._processLikes = function() {
	this.data.likes = this.data.likes.map(
		this._processLike.bind(this))
}
Post.prototype._processLike = function(like) {
	return like instanceof PostLike ? like : 
		new PostLike(this, like);
}

Post.prototype._convertFileList = function() {
	
	var photoIdx = 0, videoIdx = 0, url;

	this.data.typeList.forEach(type => {
		switch (type) {
			case 'image': 
				url = this.data.photoList[photoIdx++]; break;
			case 'video': 
				url = this.data.videoList[videoIdx++]; break;
			default: return;
		}
		this.fileList.push({ url, type })
	});
}

Post.prototype._generateTimeDiff = function() {
	if (this.data.createdAt)
		this.timeDiff = DateUtils.getDateOff(this.data.createdAt);	
}

Post.prototype.addLike = function(like) {
	this.curLike = like = this._processLike(like);
	this.data.likes.push(like);
}
Post.prototype.removeLike = function() {
	var index = this.data.likes.indexOf(this.curLike);
	if (index >= 0) this.data.likes.splice(index, 1);
	this.curLike = null;
}

Post.prototype.getCurLike = function() {
	var openid = UserManager.openid();
	return this.data.likes.find(
		l => l.data._openid == openid
	);
}

Post.prototype.addComment = function(comment) {
	comment = this._processComment(comment);
	this.data.comments.push(comment);
}
Post.prototype.removeComment = function(comment) {
	comment.data.isDeleted = true;
	// var index = this.data.comments.indexOf(comment);
	// if (index >= 0) this.data.comments.splice(index, 1);
}

/**
 * 添加多媒体数据
 * @param {Array} media 多媒体数据
 */
Post.prototype.addMedia = function(media) {
	console.log("addMedia: " + media);

	var oldLen = this.fileList.length;

	media.forEach((m, i) => {
		var url = m.url;
		var format = FSM.getFormat(url)
		this.fileList.push({
			type: m.type, url,
			name: Post.GenerateFileName(i + oldLen, format)
		})
	})
}

/**
 * 移除多媒体数据
 * @param {Array} media 多媒体数据
 */
Post.prototype.removeMedia = function(index) {
	this.fileList.splice(index, 1);
}

Post.prototype.setFileList = function(fileList) {
	this.fileList = fileList;
}

Post.prototype.setAnonymous = function(anony) {
	if (!(this.isAnony = anony)) 
		this.data.anonyFoodId = null;
	else {
		var food = FoodManager.getRandom();
		var imgCnt = food.data.images.length;
		var quality = MathUtils.randomInt(imgCnt);
	
		this.data.anonyFoodId = food.data._id;
		this.data.anonyFoodQuality = quality;
	}
}

Post.prototype.setRollRecord = function(roll) {
	this.data.content = roll.data.message;
	this.data.rollRecordId = roll.data._id;
	this.fileList.push({
		type: 'image', url: roll.data.shareImage,
		name: Post.GenerateFileName('poster', 'png')
	})
}

Post.prototype.refresh = function() {
	this._refreshBasicData();
	this._refreshLikeValue();
	this._refreshCommentCnt();
}

Post.prototype._refreshBasicData = function() {
	this.isSelfPost = this._isSelfPost();
	this.curLike = this.getCurLike();
}
Post.prototype._refreshLikeValue = function() {
	this.likeValue = this.data.likes.reduce(
		(sum, l) => sum += l.data.value, 0);
	if (this.data.rollRecord)
		this.likeValue += this.data.rollRecord.rollCount;
}
Post.prototype._refreshCommentCnt = function() {
	var comments = this.data.comments.filter(c => !c.data.isDeleted);
	this.commentCnt = comments.length;
}

Post.prototype.generateFileData = async function() {
	var fileData = await Post._GenerateFileData(this.fileList);
	Object.assign(this.data, fileData);
}

Post.CheckCFName = 'checkPost';

/**
 * 内容审核
 */
Post.prototype.check = async function() {
	var postPhotoList = this.data.photoList.map(
		p => {
			var index = p.indexOf("/", 10);
			return p.substr(index + 1);
		}
	)

	return await CFM.call(Post.CheckCFName, null, {
		postContent: this.data.content,
		postPhotoList
	});
}

Post.PhotoFilePath = 'postPhoto';
Post.VideoFilePath = 'postVideo';

Post.GenerateFileName = function(name, format) {
	var _openid = UserManager.openid();
	return _openid + '-' + Date.now() + '-' + name + '.' + format;
}

/*
Post.Create = async function(content, 
	fileList, location, isAnony, visibility) {
	visibility ||= 1;
	
	var data = {
		content, location, visibility
	}

	var fileData = this._GenerateFileData(fileList);
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
		anonyFoodId: food.data._id, 
		anonyFoodQuality: quality
	}
}
*/

Post._GenerateFileData = async function(fileList) {
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