function PageCombiner() {
	throw new Error('This is a static class');
}

/**
 * 合成页面
 * @param {Object} target 目标页面
 * @param {Object | Array} pages 需要合成的页面数组
 */
PageCombiner.Combine = function(target, pages) {
	if (!(pages instanceof Array)) pages = [pages];

	pages.forEach(p => {
		// 遍历页面每个键
		for(var key in p) {
			var val = p[key], tVal = target[key];
			if (val instanceof Function) {
				var caller = target[key + '_caller'] ||= [tVal];
				caller.push(val);
				
				target[key] = async function() {
					for (let i = 0; i < caller.length; i++) 
						if (caller[i]) await caller[i].call(target, arguments);
				}
			} else if (val instanceof Object) {
				target[key] ||= {};
				Object.assign(target[key], val);
			}
		}
	});
	return target;
}

export default PageCombiner;