// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

// 云函数入口函数
exports.main = async (event, context) => {
	switch (event.method.toUpperCase()) {
		case "GET":
			return await getTools(event.cond);
		case "BUY":
			return await buyTool(event.userInfo, event.toolId);
		case "UPDATE":
			updateTools(event.token, event.tools);
	}
}

async function getTools(cond) {
	// cond: 判断条件，为空则获取全部
	if (cond)
		return await db.collection('t_tool').where(cond).get();
	else
		return await db.collection('t_tool').get();
}

async function buyTool(userInfo, toolId) {
	var {
		rollCount,
		unlockTools
	} = await getRollCountAndTools(userInfo.openId)
	var cost = await getCost(toolId)
	if (rollCount < cost) {
		return
	} else {
		return db.collection('t_user').where({
			_openid: userInfo.openId
		}).update({
			data: {
				rollCount: _.inc(-cost),
				unlockTools: unlockTools.push(toolId)
			}
		})
	}
}

function updateTools(tools) {
	if (token != TOKEN) return;
	tools.forEach(tool =>
		db.collection('t_tool').where({
			_id: tool._id
		}).update(tool)
	);
}

function getRollCountAndTools(openId) {
	return db.collection('t_user').where({
		_openid: openId
	}).get().then(res => {
		return {
			rollCount: res.data.rollCount,
			unlockTools: res.data.unlockTools
		}
	})
}

function getCost(toolId) {
	return db.collection('t_user').doc(toolId).get().then(res => {
		return res.data.cost
	})
}