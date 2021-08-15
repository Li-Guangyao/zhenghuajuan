// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

exports.main = async (event, context) => {
	switch (event.method.toUpperCase()) {
		case "GET":
			return await getFoods(event.cond);
		case "BUY":
			return await buyFood(event.userInfo, event.foodId);
		case "UPDATE":
			updateFoods(event.token, event.foods);
	}
}

async function getFoods(cond) {
	// cond: 判断条件，为空则获取全部
	var oper = cond ? 
		db.collection('t_food').where(cond) :
		db.collection('t_food');

	return (await oper.get()).data;
}

// 购买食物
async function buyFood(userInfo, foodId) {
	var { rollCount, unlockFoods } = await getRollCountAndFoods(userInfo.openId)
	if (unlockFoods.includes(foodId)) return;

	var cost = await getCost(foodId)
	if (rollCount < cost) return

	return db.collection('t_user').where({
		_openid: userInfo.openId
	}).update({
		data: {
			rollCount: _.inc(-cost),
			unlockFoods: _.push(foodId)
		}
	})
}

function updateFoods(token, foods) {
	if (token != TOKEN) return;
	foods.forEach(food =>
		db.collection('t_food').where({
			_id: food._id
		}).update(food)
	);
}

async function getRollCountAndFoods(openId) {
	var res = await db.collection('t_user').where({ _openid: openId }).get()
	return {
		rollCount: res.data.rollCount,
		unlockFoods: res.data.unlockFoods
	}
}

async function getCost(foodId) {
	var res = await db.collection('t_food').doc(foodId).get()
	return res.data.cost;
}