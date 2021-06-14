const cloud = require('wx-server-sdk')
cloud.init()

const tcb = require("@cloudbase/node-sdk");
const extCi = require("@cloudbase/extension-ci");

const app = tcb.init({
	env: "cloud1-1gpq51y7845e8d66"
});
app.registerExtension(extCi);

exports.main = async (event, context) => {

	return contentSec(event.postContent)
	// return imgSec()
}

async function getAccessToken() {
	const res = await cloud.callFunction({
		name: 'getAccessToken'
	})
	return res.result
}

async function imgSec() {
	try {
		const res = await app.invokeExtension("CloudInfinite", {
			action: "ImageProcess",
			cloudPath: 'postPhoto/Jyanon-1621256784608-0.jpg',
			operations: {
				type: "porn,ads,terrorist,politics",
			},
		});
		return res;
	} catch (err) {
		return err
	}
}

async function contentSec(postContent) {
	try {
		const res = await cloud.openapi.security.msgSecCheck({
			content: postContent
		})
		return res
	} catch (err) {
		return err
	}
}

async function contentSecHttp() {
	var accessToken = await getAccessToken()

	return await request({
		method: 'POST',
		url: 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + accessToken,
		data: {
			access_token: '46_jurFZj-jt87a05ayWdOPHw0T0VUnWflyuvxt8Mt92xTUiecR7YTUYs96sZZ_zxfw6eWhfkSgQInEzOmUncybpHBWaZ1FiXowPzrPI0jEzd_VrFAb7RT1XxfP9BLE-hMqgVOsIC7PnYREHxohFGRcAHATUF',
			content: JSON.stringify('哈哈哈'),
		},
	}).then(res => {
		return res
	})
}

async function imaSecHttp() {
	var accessToken = await getAccessToken()

	return request({
		url: 'https://api.weixin.qq.com/wxa/media_check_async?access_token=' + accessToken,
		data: JSON.stringify({
			access_token: accessToken,
			media_url: fileList[0].url,
			media_type: fileList[0].type
		}),
		method: 'POST',
		success: (res) => {
			return res
		}
	})
}