// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db=cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {

  var dayBegin=new Date();
  dayBegin.setHours(0,0,0);
  var dayEnd=new Date();
  dayEnd.setHours(23,59,59);

  var result = {
    timesCount:0,
    rollDuration:0,
    rollCount:0
  };
  
  var matcher = {
    _openid: event.userInfo.openId,
    rollName:{$ne:null},
    createdAt:_.and(_.lte(dayEnd),_.gte(dayBegin))
  };
  
  var res= (await db.collection('t_post').aggregate().match(matcher).count('_timesCount').end());
  if(res.list.length==0)
      result.timesCount=0;
  else
      result.timesCount=res.list[0]._timesCount;
    

  var res=(await db.collection('t_post').aggregate().match(matcher).group({
    _id:null,
    _rollDuration: $.sum('$rollDuration')
  })
  .project({
    _id:0,
  })
  .end())

  if(res.list.length==0)
    result.rollDuration=0;
  else
    result.rollDuration=res.list[0]._rollDuration;
  

  var res= (await db.collection('t_post').aggregate().match(matcher).group({
    _id:null,
    _rollCount:$.sum('$rollCount')
  })
  .project({
    _id:0,
  })
  .end())

  if(res.list.length==0)
    result.rollCount=0;
  else
    result.rollCount=res.list[0]._rollCount;

  return result;
}