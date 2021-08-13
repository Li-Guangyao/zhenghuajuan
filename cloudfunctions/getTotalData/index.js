// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
//返回累计蒸花卷次数、蒸花卷时间、累计获得小麦、日均时长
exports.main = async (event, context) => {

  var result={
    timesCount:0,
    rollDuration:0,
    rollCount:0,
    averageTime:0
  };
  var matcher={_openid:event.userInfo.openId,
               rollName:{$ne:null}
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

  var res=await db.collection('t_post').aggregate().match(matcher).group({
    _id:{"$dateToString":{'format':'%Y-%m-%d','date':'$createdAt'}}
  }).count('_daysCount')
  .end();
  if(res.list.length==0)
    result.averageTime=0;
  else
    result.averageTime= result.rollDuration/res.list[0]._daysCount;

    return result;
    
  }


