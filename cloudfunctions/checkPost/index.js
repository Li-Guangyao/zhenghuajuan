const tcb = require("@cloudbase/node-sdk");
const extCi = require("@cloudbase/extension-ci");
const cloud = require('wx-server-sdk')

cloud.init()

const app = tcb.init({
	env: "cloud1-1gpq51y7845e8d66"
});
app.registerExtension(extCi);

exports.main = async (event, context) => {
	
	var a = await contentSec(event.postContent)
	var b = await imgSec(event.postPhotoList)
	//var b = true; 

	if (a == true && b == true) {
		return true
	} else {
		return false
	}

	// if ((await contentSec(event.postContent)) && (await imgSec(event.postPhotoList))) {
	// 	return true
	// } else {
	// 	return false
	// }
}

async function imgSec(photoList) {
	if (photoList.length == 0) {
		return true
	}
	for (var i = 0; i < photoList.length; i++) {
		// try {
			const res = (await app.invokeExtension("CloudInfinite", {
				action: "DetectType",
				cloudPath: photoList[i],
				operations: {
					type: "porn,politics",
				},
			})).data.RecognitionResult

			if (res.PoliticsInfo.Code != 0 || res.PornInfo.Code != 0) {
				return false
			}

			// return [res.status, res.statusText, res.headers, res.config, res.request, res.data] ;
			// return Object.keys(res.request.res.req);
			// return res; //错误，存在交叉引用
		// } catch (err) {
		// 	return err
		// }
	}
	return true
}

// 检查内容
async function contentSec(postContent) {
	try {
		const res = await cloud.openapi.security.msgSecCheck({
			content: postContent
		})
		if (res.errCode == 87014) {
			return false
		} else {
			return true
		}
	} catch (err) {
		return err
	}
}

// 获取accessToken，用于http访问
// async function getAccessToken() {
// 	const res = await cloud.callFunction({
// 		name: 'getAccessToken'
// 	})
// 	return res.result
// }

// 内容检查的http请求
// async function contentSecHttp() {
// 	var accessToken = await getAccessToken()

// 	return await request({
// 		method: 'POST',
// 		url: 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + accessToken,
// 		data: {
// 			access_token: '46_jurFZj-jt87a05ayWdOPHw0T0VUnWflyuvxt8Mt92xTUiecR7YTUYs96sZZ_zxfw6eWhfkSgQInEzOmUncybpHBWaZ1FiXowPzrPI0jEzd_VrFAb7RT1XxfP9BLE-hMqgVOsIC7PnYREHxohFGRcAHATUF',
// 			content: JSON.stringify('哈哈哈'),
// 		},
// 	}).then(res => {
// 		return res
// 	})
// }

// 图片检查的http请求
// async function imaSecHttp() {
// 	var accessToken = await getAccessToken()

// 	return request({
// 		url: 'https://api.weixin.qq.com/wxa/media_check_async?access_token=' + accessToken,
// 		data: JSON.stringify({
// 			access_token: accessToken,
// 			media_url: fileList[0].url,
// 			media_type: fileList[0].type
// 		}),
// 		method: 'POST',
// 		success: (res) => {
// 			return res
// 		}
// 	})
// }