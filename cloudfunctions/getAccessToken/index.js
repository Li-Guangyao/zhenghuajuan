const cloud = require('wx-server-sdk')

cloud.init()

// var request = require('request');
var request = require('request-promise')

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	var token = await getNewestAccessToken()
	if (token == null || judgeExpiration(token.createdAt)) {
		return requestAccessToken()
	} else {
		return token.accessToken
	}
}

async function requestAccessToken() {
	const appId = 'wx8bfdd5aaea4938d5'
	const appSecret = '4041e321817ad79f906800bd0756555c'

	const res = await request({
		url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret
	})
	const accessToken = JSON.parse(res).access_token
	saveAccessToken(accessToken)
	return accessToken
}

function saveAccessToken(newAccessToken) {
	db.collection('t_access_token').add({
		data: {
			accessToken: newAccessToken,
			createdAt: new Date()
		}
	})
}

function getNewestAccessToken() {
	return db.collection('t_access_token').aggregate().sort({
		createdAt: -1
	}).end().then(res => {
		return res.list[0]
	})
}

function judgeExpiration(tokenDate) {
	var now = new Date().getTime()
	var tokenDate = new Date(tokenDate).getTime()
	if (now - tokenDate > 7200000) {
		return true
	} else {
		return false
	}
}