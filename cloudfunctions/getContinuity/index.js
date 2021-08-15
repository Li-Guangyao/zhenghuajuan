// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  var count = 0;
  var startTime = new Date();
  startTime.setHours(0, 0, 0);
  var endTime = new Date();
  endTime.setHours(23, 59, 59);

  var matcher = {
    _openid: event.userInfo,
    rollName: { $ne: null },
    createdAt: _.and(_.lte(endTime), _.gte(startTime))
  }

  var query = db.collection('t_post').aggregate()
    .match(matcher).count('count');

  while ((await query.end()).list.length > 0) {
    count++;
    startTime.setTime(startTime.getTime() - 24*60*60*1000);
    // matcher.createdAt = date;
  }
  
  return count;
}