// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command

// 用来获取连续蒸花卷x天
exports.main = async (event, context) => {
  var _openid = cloud.getWXContext().OPENID

  var count = 0;
  var startTime = new Date();
  startTime.setHours(0, 0, 0);
  var endTime = new Date();
  endTime.setHours(23, 59, 59);

  // var matcher = {
  //   // _openid
  //   _openid: "oD2yB5Wi1-uPQ9rDXKsstLaWdVxc",
  //   rollName: {
  //     $ne: null
  //   },
  //   createdAt: _.and(_.lte(endTime), _.gte(startTime))
  // }

  // var query = db.collection('t_post').aggregate()
  //   .match(matcher).count('count');

  // var s2 = new Date(startTime.getTime() - 24 * 60 * 60 * 1000)
  // var e2 = new Date(endTime.getTime() - 24 * 60 * 60 * 1000)

  // return {
  //   startTime,
  //   endTime,
  //   s2,
  //   e2
  // }

  // return query(startTime,endTime)

  while (query(startTime, endTime, _openid)) {
    count += 1
    startTime = new Date(startTime.getTime() - 24 * 60 * 60 * 1000)
    endTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000)
  }
  // while ((await query.end()).list[0].count > 0) {
  //   count++;
  //   startTime = new Date(startTime.getTime() - 24 * 60 * 60 * 1000)
  //   endTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000)
  // }
  return count;
}

async function query(startTime, endTime, openId) {
  var matcher = {
    // _openid
    _openid: "oD2yB5Wi1-uPQ9rDXKsstLaWdVxc",
    rollName: _.exists(true),
    // rollName: {
    //   $ne: null
    // },
    createdAt: _.and(_.lte(endTime), _.gte(startTime))
  }

  return (await db.collection('t_post').aggregate()
    .match(matcher).count('count').end()).list[0].count > 0
}