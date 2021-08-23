import MathUtils from "../../utils/mathUtils";

var sharePage = (texts) => {
	texts ||= [
		"来蒸花卷，争做最卷的“卷王”吧",
		"来蒸花卷，记录你学习的点滴",
		"来蒸花卷，沉浸在学习的快乐中吧"
	];

	return {
		onShareAppMessage() {
			return { title: MathUtils.randomItem(texts) }
		},		
		onShareTimeline() {
			return { title: MathUtils.randomItem(texts) }
		}
	}
}

export default sharePage;