export default function getAccessToken() {
	var accessToken = '111'

	wx.request({
		url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx8bfdd5aaea4938d5&secret=4041e321817ad79f906800bd0756555c',
		success: res => {
			accessToken = res
			console.log(accessToken)
		}
	})

	return accessToken
}