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
			return (await getFoods(event.cond)).data;
		case "BUY":
			return await buyFood(event.userInfo, event.foodId);
		case "UPDATE":
			updateFoods(event.token, event.foods);
	}
}

async function getFoods(cond) {
	// cond: 判断条件，为空则获取全部
	if (cond)
		return await db.collection('t_food').where(cond).get();
	else
		return await db.collection('t_food').get();
}

// 购买食物
async function buyFood(userInfo, foodId) {
	var {
		rollCount,
		unlockFoods
	} = await getRollCountAndTools(userInfo.openId)
	var cost = await getCost(foodId)
	if (rollCount < cost) {
		return
	} else {
		return db.collection('t_user').where({
			_openid: userInfo.openId
		}).update({
			data: {
				rollCount: _.inc(-cost),
				unlockFoods: unlockFoods.push(foodId)
			}
		})
	}
}

function updateFoods(token, foods) {
	if (token != TOKEN) return;
	foods.forEach(food =>
		db.collection('t_food').where({
			_id: food._id
		}).update(food)
	);
}

function getRollCountAndTools(openId) {
	return db.collection('t_user').where({
		_openid: openId
	}).get().then(res => {
		return {
			rollCount: res.data.rollCount,
			unlockFoods: res.data.unlockFoods
		}
	})
}

function getCost(foodId) {
	return db.collection('t_user').doc(foodId).get().then(res => {
		return res.data.cost
	})
}