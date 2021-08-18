var MathUtils = {}

/**
 * 随机整数
 * @param {Number} n 随机取值 [0~n)
 */
MathUtils.randomInt = (n) => Math.floor(Math.random() * n)

/**
 * 从组合里随机取数据
 * @param {Array | Object} group 数据组合
 */
MathUtils.randomItem = function(group) {
	if (group instanceof Array) 
		return group[this.randomInt(group.length)]

	var keys = Object.keys(group);
	return group[this.randomItem(keys)];
}

export default MathUtils;