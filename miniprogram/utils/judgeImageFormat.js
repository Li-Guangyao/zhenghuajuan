//在保存图片的时候，识别图片的格式
export default function judgeImageFormat(filePath) {
	//获取最后一个.的位置
	var index = filePath.lastIndexOf(".");
	//获取后缀
	var ext = filePath.substr(index + 1);
	//输出结果
	return ext;
}