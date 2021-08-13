var canvasUtils = {}

canvasUtils.canvas = null;
canvasUtils.ctx = null;
canvasUtils.dpr = 1;

canvasUtils.imageCache = {};

/**
 * 配置Canvas
 */
canvasUtils.setupById = function(query, id, onSuccess) {
	query.select('#' + id).fields({
		node: true, size: true
	}).exec((res) => {
		this.setupByRes(res);
		onSuccess(canvasUtils);
	})
}
canvasUtils.setupByRes = function(res) {
	this.setupByCanvas(res[0].node, res[0].width, res[0].height);
}
canvasUtils.setupByCanvas = function(canvas, width, height) {
	this.canvas = canvas
	this.ctx = this.canvas.getContext('2d')

	this.canvas.dpr = this.dpr = wx.getSystemInfoSync().pixelRatio
	this.canvas.width = width * this.dpr
	this.canvas.height = height * this.dpr
	this.ctx.scale(this.dpr, this.dpr);

	console.info("canvasUtils.setupByCanvas: ", this);
}

canvasUtils.clear = function() {
	this.canvas = this.ctx = null;
	this.dpr = 1;
}

/**
 * 绘制图片
 * @param {图片URL} src 
 * @param {X坐标} x 
 * @param {Y坐标} y 
 * @param {宽度（拉伸）} w 
 * @param {高度（拉伸）} h 
 * @param {绘制风格: 
 * 	normal: 普通绘制
 * 	circle: 圆形绘制} style 
 */
canvasUtils.drawImage = async function(src, x, y, w, h, style) {
	var cache = this.imageCache[src] ||= 
		(src.startsWith("cloud://") ? 
			await wx.getImageInfo({ src }) : // 是云存储
			{ path: src } // 否则本地图片
		);

	if (!cache.img) {
		var img = this.canvas.createImage();
		img.src = cache.path;
		img.onload = () => this.drawImageFromCache(cache, img, x, y, w, h, style);
	} else this.drawImageFromCache(cache, null, x, y, w, h, style);
}
canvasUtils.drawImageFromCache = function(cache, img, x, y, w, h, style) {
	if (img) {
		cache.img = img;
		cache.width = img.width
		cache.height = img.height
	}
	var iw = cache.width, ih = cache.height;

	console.log("drawImageFromCache", cache, x, y, w, h);

	switch (style || 'normal') {
		case 'normal':
			this.ctx.drawImage(cache.img, 0, 0, iw, ih, x, y, w, h); break;
		case 'circle':
			var r = Math.min(iw, ih) / 2;
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.arc(x + iw / 2, y + ih / 2, r, 0, 2 * Math.PI, false);
			this.ctx.drawImage(cache.img, 0, 0, iw, ih, x, y, w, h); 
			this.ctx.restore();
			break;
	}
}

canvasUtils.setFont = function(font) {
	this.ctx.font = font;
}
canvasUtils.drawText = function(text, x, y, fillStyle) {
	this.ctx.fillStyle = fillStyle;
	this.ctx.fillText(text, x, y);
}

canvasUtils.setTransform = function(scaleX, skewY, skewX, scaleY, posX, posY) {
	this.ctx.setTransform(scaleX, skewY, skewX, scaleY, posX, posY);
}

// 蒸花卷绘制相关函数封装
canvasUtils.drawFood = async function(food, quality, x, y, w, h, adjust, shadow) {
	if (adjust === undefined) adjust = true;
	if (shadow === undefined) shadow = true;
	if (adjust) { x -= w / 2; y -= h / 2; }
	if (shadow) {
		var sSrc = "../../../../../images/shadow.png";
		await this.drawImage(sSrc, x, y, w, h);
	}
	var src = food.images[quality];
	await this.drawImage(src, x, y, w, h);
}

export { canvasUtils }