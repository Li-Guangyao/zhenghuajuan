import Post from "../../modules/postModule/post";
import PostManager from "../../modules/postModule/postManager";
import NavigateUtils from "../../utils/navigateUtils";
import PageCombiner from "../common/pageCombiner";
import sharePage from "../common/sharePage";
import userPage from "../common/userPage";

var main = {
	data: {
		post: null,
	},

	async onLoad(e) {
		this.setData({ post: PostManager.curPost })
	},

	back() { NavigateUtils.pop(); }
}

Page(PageCombiner.Combine(main, [userPage(), sharePage()]));