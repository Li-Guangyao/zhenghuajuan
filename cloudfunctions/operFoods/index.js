// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

// 云函数入口函数
exports.main = async (event, context) => {
	switch (event.method.toUpperCase()) {
		case "GET": return (await getFoods(event.cond)).data;
		case "BUY": return await buyFood(event.userInfo, event.foodId);
		case "UPDATE": updateFoods(event.token, event.foods);
	}
}

async function getFoods(cond) {
	// cond: 判断条件，为空则获取全部
	if (cond)
		return await db.collection('t_food').where(cond).get();
	else 
		return await db.collection('t_food').get();
}

async function buyFood(userInfo, foodId) {
	// TODO: 写购买食谱的逻辑
}

function updateFoods(token, foods) {
	if (token != TOKEN) return;
	foods.forEach(food => 
		db.collection('t_food').where({_id: food._id}).update(food)
	);
}