var CanvasUtils = {}

CanvasUtils.canvas = null;
CanvasUtils.ctx = null;
CanvasUtils.dpr = 1;

CanvasUtils.imageCache = {};

/**
 * 配置Canvas
 */
CanvasUtils.setupById = async function(query, id) {
	var res = await this.querySelect(query, '#' + id);
	this.setupByRes(res);
	return res;
}
CanvasUtils.setupByRes = function(res) {
	this.setupByCanvas(res[0].node, res[0].width, res[0].height);
}
CanvasUtils.setupByCanvas = function(canvas, width, height) {
	this.canvas = canvas
	this.ctx = this.canvas.getContext('2d')

	this.canvas.dpr = this.dpr = wx.getSystemInfoSync().pixelRatio
	this.canvas.width = width * this.dpr
	this.canvas.height = height * this.dpr
	this.ctx.scale(this.dpr, this.dpr);

	console.info("CanvasUtils.setupByCanvas: ", this);
}

CanvasUtils.querySelect = (query, selector, fields) =>
	new Promise((resolve, reject) => 
		query.select(selector)
			.fields(fields || { node: true, size: true })
			.exec(resolve)
	);

CanvasUtils.reset = function() {
	this.canvas = this.ctx = null;
	this.dpr = 1;
}

/**
 * 获取图片信息
 * @param {String} src 图片路径
 */
CanvasUtils.getImageInfo = async function(src) {
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
 * @param {String} src 图片路径
 * @param {Number} x X坐标
 * @param {Number} y Y坐标
 * @param {Number} w 宽度（拉伸）
 * @param {Number} h 高度（拉伸）
 * @param {"normal" | "round"} style 绘制风格: 
 * 	normal: 普通绘制
 * 	round: 圆形绘制
 */
CanvasUtils.drawImage = async function(src, x, y, w, h, style) {
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
CanvasUtils.drawImageFromCache = function(cache, x, y, w, h, style) {
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

CanvasUtils.createImage = url =>
	new Promise((resolve, reject) => {
		var img = CanvasUtils.canvas.createImage();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});

CanvasUtils.setFont = function(font) {
	this.ctx.font = font;
}
CanvasUtils.setColor = function(color) {
	this.ctx.fillStyle = color;
}

/**
 * 绘制单行文本
 * @param {String} text 文本
 * @param {Number} x X坐标
 * @param {Number} y Y坐标
 */
CanvasUtils.drawText = function(text, x, y) {
	console.log("drawText: ", text, x, y);
	this.ctx.fillText(text, x, y);
}

/**
 * 绘制文本拓展（可绘制多行、自动换行、两种对齐方式）
 * @param {String} text 文本
 * @param {Number} x X坐标
 * @param {Number} y Y坐标
 * @param {Number} w 宽度
 * @param {Number} lineHeight 行高
 * @param {"left" | "right"} align 对齐方式（目前仅支持left和right）
 */
CanvasUtils.drawTextEx = function(text, x, y, w, lineHeight, align) {
	console.log("drawTextEx: ", text, x, y, w, lineHeight, align);

	// 目前只支持left, right
	var right = align == 'right';

	var ox = x, oy = y, cx; // cx 仅用于计算 
	var line = "", flag; text += "\n";

	var restartX = () => cx = x = right ? ox + w : ox;
	var nextLine = () => {
		this.drawText(line, x, y);
		y += lineHeight; 
		restartX();
		flag = true;
		line = "";
	}

	restartX();

	for (var i = 0; i < text.length; ++i) {
		flag = false;
		var c = text[i];
		var cw = this.ctx.measureText(c).width;
		if (c == "\n") nextLine()
		else {
			console.log(c, x, ox, (x - cw) <= ox, i)
			if (right && ((x -= cw) <= ox)) { nextLine(); x -= cw; }
			if (!right && ((cx += cw) >= ox + w)) nextLine();
			flag ? i-- : line += c;
		}
	}
}

CanvasUtils.setTransform = function(scaleX, skewY, skewX, scaleY, posX, posY) {
	scaleX *= this.dpr; scaleY *= this.dpr;
	skewY *= this.dpr; skewX *= this.dpr;
	posX *= this.dpr; posY *= this.dpr;
	this.ctx.setTransform(scaleX, skewY, skewX, scaleY, posX, posY);
}
CanvasUtils.resetTransform = function() {
	this.setTransform(1, 0, 0, 1, 0, 0);
}

CanvasUtils.clipRect = function(x, y, w, h, draw) {
	this.ctx.rect(x, y, w, h);
	if (draw) this.ctx.stroke();
	this.ctx.clip();
}

CanvasUtils.wait = t => new Promise(d => setTimeout(() => d(), t));

CanvasUtils.clearAll = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
}
CanvasUtils.clearRect = function(x, y, w, h) {
	this.ctx.clearRect(x, y, w, h)
}

// 蒸花卷绘制相关函数封装
CanvasUtils.drawFood = async function(food, quality, x, y, w, h, adjust, shadow) {
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

export default CanvasUtils