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
		for (var _key in p) {
			let key = _key, val = p[key], tVal = target[key];
			if (val instanceof Function) {
				let callers = target[key + '_caller'] ||= [tVal];
				callers.push(val);
				
				target[key] = function() {
					var res = [];
					for (let i = 0; i < callers.length; i++) {
						// console.log("combiner.call: ", key, callers[i], arguments, target, this);
						if (callers[i]) res.push(callers[i].apply(this, arguments));
					}
					return res.length == 1 ? res[0] : res;
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