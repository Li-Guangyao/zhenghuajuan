// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

exports.main = async (event, context) => {
	var wxContext = cloud.getWXContext();
	var openid = wxContext.OPENID;

	// 测试鉴权
	var test = event.token == TOKEN;
	if (test && event.openid) openid = event.openid;

	// 函数参数
	var method = event.method;

	// 函数主体
	switch (method.toUpperCase()) {
		case "GET": // 获取菜品
			var cond = event.cond; // 附加参数

			return await getFoods(cond);
		case "BUY": // 购买菜品
			var foodId = event.foodId; // 菜品ID

			return await buyFood(openid, foodId);
	}
}

// cond: 判断条件，为空则获取全部
getFoods = async (cond) => {
	var res = await db.collection('t_food')
		.where(cond || {}).get()
	return res.data;
}

// 购买食物
buyFood = async (openid, foodId) => {
	var data = await getRollCountAndFoods(openid)
	if (data.unlockFoods.includes(foodId)) 
		throw new Error("该菜品已经解锁！")

	var cost = await getCost(foodId)
	if (data.rollCount < cost) 
		throw new Error("小麦数量不足！")

	return db.collection('t_user').where({
		_openid: openid
	}).update({
		data: {
			rollCount: _.inc(-cost),
			unlockFoods: _.push(foodId)
		}
	})
}

getRollCountAndFoods = async (openId) => {
	var res = await db.collection('t_user').where({ _openid: openId }).get()
	return {
		rollCount: res.data[0].rollCount,
		unlockFoods: res.data[0].unlockFoods
	}
}

getCost = async (foodId) => {
	var res = await db.collection('t_food').doc(foodId).get()
	return res.data.cost;
}