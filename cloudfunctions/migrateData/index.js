// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 原有数据迁移
exports.main = async (event, context) => {

	// 修复rollRecordId的错误 删除原有的不可见的蒸花卷帖子
	for (let skip = 20; skip <= 100; skip += 20) {
		let posts = (await db.collection('t_post').aggregate()
			.match({
				rollRecordId: _.neq(null)
			}).skip(skip).end()).list;
	
		posts.forEach(p => {
			if (typeof(p.rollRecordId) == 'number') return;

			var pid = p._id;
			var rrid = p.rollRecordId._id;

			var post = db.collection('t_post').doc(pid);

			if (p.visibility == 0) { // 不可见，删除
				db.collection('t_roll_record').doc(rrid)
					.update({ data: { postId: null } });
				post.remove();
			} else 
				post.update({ data: { rollRecordId: rrid } })
		});
	}

	/*
	for (let skip = 20; skip <= 100; skip += 20) {
		// 修改t_post数据
		let posts = (await db.collection('t_post').aggregate().skip(skip).lookup({
			from: 't_post_comment',
			localField: '_id',
			foreignField: 'postId',
			as: 'comments'
		}).lookup({
			from: 't_post_like',
			localField: '_id',
			foreignField: 'postId',
			as: 'likes'
		})
		.end()).list;

		for (let i = 0; i < posts.length; i++) {
			const p = posts[i], pid = p._id;

			p.visibility = p.isPrivate ? 0 : 1;

			if (p.isAnonymous) { // 如果是匿名
				p.anonyFoodId = 'cd045e756105f4e2018e3f8300be0e06';
				p.anonyFoodQuality = Math.floor(Math.random() * 3);
				p.anonyFoodDesc = processAnony();
			}

			if (p.rollName) { // 如果是蒸花卷记录
				if (p.strictMode === undefined)
				p.strictMode = true;

				var data = { // 插入的数据
					_openid: p._openid,
					flavor: p.rollName,
					duration: p.rollDuration,
					foodId: p.foodId,
					quality: p.quality,
					strictMode: p.strictMode,
					status: 1,
					message: p.content,
					rollCount: p.rollCount,
					postId: pid,
					createdAt: p.createdAt,
					terminatedAt: p.createdAt
				}

				// res += JSON.stringify(data) + "\n";

				var rrid = (await db.collection('t_roll_record').add({ data }))._id;

				// 删除的数据
				p.rollName = _.remove();
				p.rollDuration = _.remove();
				p.foodId = _.remove();
				p.quality = _.remove();
				p.strictMode = _.remove();
				p.rollCount = _.remove();
				p.rollRecordId = rrid;
			}

			var newComments = [];
			p.comments.forEach((c, i) => 
				newComments.push({
					index: i,
					_openid: c._openid,
					content: c.content,
					createdAt: c.createdAt
				})
			);
			p.comments = newComments;

			var newLikes = [];
			p.likes.forEach(l => {
				if (l._openid == 'system_roll') return;
				newLikes.push({
					_openid: l._openid,
					value: l.value,
					likeIndex: l.valueIndex,
					createdAt: l.createdAt
				})
			});
			p.likes = newLikes;

			p.isPrivate = _.remove(),
			p.isAnonymous = _.remove();
			p.likeValue = _.remove();

			delete p._id;

			// res += JSON.stringify(p) + "\n";

			db.collection('t_post').doc(pid).update({ data: p });
		}
	}
	*/
}

// 处理匿名数据
processAnony = function() {
	var descs = ["美味", "诱人", "卓越", "黯淡无光", "隔壁家", 
	"精致", "饱满", "极品", "楼上", "楼下", "金色", "粗糙", "普通", 
	"平凡", "香喷喷", "香飘飘", "我最爱", "金黄", "家门口"]
	return descs[Math.floor(Math.random() * descs.length)] + "的"
}