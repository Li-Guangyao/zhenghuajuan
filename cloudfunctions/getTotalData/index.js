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
    timesCount:null,
    rollDuration:null,
    rollCount:null,
    averageTime:null
  };
  var matcher={_openid:event.userInfo.openId,
               rollName:{$ne:null}
              };


  result.timesCount= (await db.collection('t_post').aggregate().match(matcher).count('_timesCount').end()).list[0]._timesCount;

  result.rollDuration= (await db.collection('t_post').aggregate().match(matcher).group({
      _id:null,
      _rollDuration:$.sum('$rollDuration')
    })
    .project({
      _id:0,
    }).end()).list[0]._rollDuration;
   
    result.rollCount= (await db.collection('t_post').aggregate().match(matcher).group({
      _id:null,
      _rollCount:$.sum('$rollCount')
    })
    .project({
      _id:0,
    })
    .end()).list[0]._rollCount;

    result.averageTime= result.rollDuration/(await db.collection('t_post').aggregate().match(matcher).group({
      _id:{"$dateToString":{'format':'%Y-%m-%d','date':'$createdAt'}}
    }).count('_daysCount')
    .end()).list[0]._daysCount

    return result;
    
      
  }


