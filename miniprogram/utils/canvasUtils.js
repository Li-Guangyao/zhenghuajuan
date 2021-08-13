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
		if (onSuccess) onSuccess(canvasUtils);
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
 * 获取图片信息
 * @param {图片路径} src 
 */
canvasUtils.getImageInfo = async function(src) {
	var isCloud = src.startsWith("cloud://");
	var cache = this.imageCache[src] ||= (isCloud ? 
			await wx.getImageInfo({ src }) : // 云存储
			{ path: src } // 否则本地图片
		);

	if (!cache.img) { // 图片是否有缓存？
		cache.img = await this.createImage(cache.path);
		cache.width = cache.img.width
		cache.height = cache.img.height
	}

	return cache;
}

/**
 * 绘制图片
 * @param {图片路径} src 
 * @param {X坐标} x 
 * @param {Y坐标} y 
 * @param {宽度（拉伸）} w 
 * @param {高度（拉伸）} h 
 * @param {绘制风格: 
 * 	normal: 普通绘制
 * 	round: 圆形绘制} style 
 */
canvasUtils.drawImage = async function(src, x, y, w, h, style) {
	var cache = await this.getImageInfo(src);
	this.drawImageFromCache(cache, x, y, w, h, style);

	/*
	var cache = this.imageCache[src] ||= 
		(src.startsWith("cloud://") ? 
			await wx.getImageInfo({ src }) : // 是云存储
			{ path: src } // 否则本地图片
		);

	if (!cache.img) {
		cache.img = await this.createImage(cache.path);
		cache.width = img.width
		cache.height = img.height
	}
	this.drawImageFromCache(cache, x, y, w, h, style);
	*/
}
canvasUtils.drawImageFromCache = function(cache, x, y, w, h, style) {
	var img = cache.img;
	var iw = cache.width, ih = cache.height;

	console.log("drawImageFromCache", cache, x, y, w, h);

	switch (style || 'normal') {
		case 'normal':
			this.ctx.drawImage(img, 0, 0, iw, ih, x, y, w, h); break;
		case 'round':
			var r = Math.min(w, h) / 2;
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.arc(x + w / 2, y + h / 2, r, 0, 2 * Math.PI, false);
			this.ctx.clip();
			this.ctx.drawImage(img, 0, 0, iw, ih, x, y, w, h); 
			this.ctx.restore();
			break;
	}
}

canvasUtils.createImage = url =>
	new Promise((resolve, reject) => {
		var img = canvasUtils.canvas.createImage();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});

canvasUtils.setFont = function(font) {
	this.ctx.font = font;
}
canvasUtils.setColor = function(color) {
	this.ctx.fillStyle = color;
}

/**
 * 绘制单行文本
 * @param {文本} text 
 * @param {X坐标} x 
 * @param {Y坐标} y 
 */
canvasUtils.drawText = function(text, x, y) {
	console.log("drawText: ", text, x, y);
	this.ctx.fillText(text, x, y);
}

/**
 * 绘制文本拓展（可绘制多行、自动换行、两种对齐方式）
 * @param {文本} text 
 * @param {X坐标} x 
 * @param {Y坐标} y 
 * @param {宽度} w 
 * @param {行高} lineHeight 
 * @param {对齐方式（目前仅支持left和right）} align 
 */
canvasUtils.drawTextEx = function(text, x, y, w, lineHeight, align) {
	console.log("drawTextEx: ", text, x, y, w, lineHeight, align);

	// 目前只支持left, right
	var right = align == 'right';

	var ox = x, oy = y, cx; // cx 仅用于计算 
	var line = ""; text += "\n";

	var restartX = () => cx = x = right ? ox + w : ox;
	var nextLine = () => {
		this.drawText(line, x, y);
		y += lineHeight; 
		restartX();
		line = "";
	}

	restartX();

	for (var i = 0; i < text.length; ++i) {
		var c = text[i];
		var cw = this.ctx.measureText(c).width;
		if (c == "\n") nextLine()
		else {
			if (right && ((x -= cw) <= ox)) nextLine();
			if (!right && ((cx += cw) >= ox + w)) nextLine();
			line += c;
		}
	}
}

canvasUtils.setTransform = function(scaleX, skewY, skewX, scaleY, posX, posY) {
	scaleX *= this.dpr; scaleY *= this.dpr;
	skewY *= this.dpr; skewX *= this.dpr;
	posX *= this.dpr; posY *= this.dpr;
	this.ctx.setTransform(scaleX, skewY, skewX, scaleY, posX, posY);
}
canvasUtils.resetTransform = function() {
	this.setTransform(1, 0, 0, 1, 0, 0);
}

canvasUtils.clipRect = function(x, y, w, h, draw) {
	this.ctx.rect(x, y, w, h);
	if (draw) this.ctx.stroke();
	this.ctx.clip();
}

canvasUtils.wait = t => new Promise(d => setTimeout(() => d(), t));

// 蒸花卷绘制相关函数封装
canvasUtils.drawFood = async function(food, quality, x, y, w, h, adjust, shadow) {
	if (adjust === undefined) adjust = true;
	if (shadow === undefined) shadow = true;
	if (adjust) { x -= w / 2; y -= h / 2; }
	if (shadow) {
		var sSrc = "../../../../../images/shadow.png";
		await this.drawImage(sSrc, x, y, w, h);
	}
	var src = quality == undefined ? food : food.images[quality];
	await this.drawImage(src, x, y, w, h);
}

export { canvasUtils }