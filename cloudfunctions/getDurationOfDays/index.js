// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  var date=new Date();
  var count=0;
  var matcher={
    _openid: event.userInfo,
    rollName:{
      $ne:null
    },
    createdAt:date,
  }
  while((await db.collection('t_post').aggregate().match(matcher).count('count').end()).list.length!=0)
  {
    count+=1;
    date.setTime(date.getTime()-24*60*60*1000);
    matcher.createdAt=date;
  }
  return count;
}