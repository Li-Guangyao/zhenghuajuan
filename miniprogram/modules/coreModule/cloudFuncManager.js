function CloudFuncManager() {
	throw new Error('This is a static class');
}

CloudFuncManager.call = async function(name, method, data, loading, title, mask) {
	data ||= {}; title ||= "加载中"; 
	if (loading == undefined) loading = true;
	if (mask == undefined) mask = true;
	
	data.method = method;

	wx.showLoading({ title, mask })
	try {
		console.log("call: ", name, data);
		var res = await wx.cloud.callFunction({name, data});
		console.log("call: ", name, ": res: ", res);
		return res.result;
	} catch (e) {
		console.error("call: ", name, ": error: ", e)
		throw e;
	} finally {
		wx.hideLoading()
	} 
}

export default CloudFuncManager;