// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const $ = db.command.aggregate

const TOKEN = "dOXi^w$7D0BOwG!UIA";

// 云函数入口函数
exports.main = async (event, context) => {
	switch (event.method.toUpperCase()) {
		case "GET": return await getTools(event.cond);
		case "BUY": return await buyTool(event.userInfo, event.toolId);
		case "UPDATE": updateTools(event.token, event.tools);
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
	// TODO: 写购买烹饪工具的逻辑
}

function updateTools(tools) {
	if (token != TOKEN) return;
	tools.forEach(tool => 
		db.collection('t_tool').where({_id: tool._id}).update(tool)
	);
}