/** @type { importCharacterConfig['character'] } */
const character = {
	// 孙悟空
	th_sunwukong: {
		sex: "male",
		group: "qun",
		hp: 3,
		skills: ["th_jinjing", "th_cibei", "th_ruyi", "wusheng"],
	},

	// 林正英
	dqzw_linzhengying: {
		sex: "male",
		group: "qun",
		hp: 3,
		skills: ["dqzw_fuzhen", "dqzw_fengguan", "dqzw_xiangmo"],
	},

	// 曾小贤
	cxyChenHe: {
		sex: "male",
		group: "shu",
		hp: 4,
		skills: ["cxyTianCai"],
	},

	// 楚云飞
	cxyChuYunFei: {
		sex: "male",
		group: "wei",
		hp: 4,
		skills: ["cxyXiaoXiong"],
	},

	// 贾贵
	dxjtz_jiagui: {
		sex: "male",
		group: "wu",
		hp: 3,
		skills: ["dxjtz_jugong", "dxjtz_shili"],
	},

	// 石青山
	dxjtz_shiqingshan: {
		sex: "male",
		group: "shu",
		hp: 4,
		skills: ["dxjtz_baibian", "dxjtz_shenqiang"],
	},

	// 蔡水根
	dxjtz_caishuigen: {
		sex: "male",
		group: "shu",
		hp: 3,
		skills: ["dxjtz_qingbao", "dxjtz_qiaoshi", "dxjtz_fengyuan"],
	},

	// 刘华强
	liuhuaqiang: {
		sex: "male",
		group: "shu",
		hp: 3,
		skills: ["bigdao", "yingbian", "dianlv", "yidao228", "zhaocha3399"],
	},

	// 穿山甲
	chuanshanjia: {
		sex: "male",
		group: "qun",
		hp: "7/8",
		skills: ["dpoioned", "doubleagent", "selfbang", "dutang233","qianfu233", "csj_zhending", "csj_baolu"],
		tags: ["des:重庆军统，和小日本双料搬山道士，代号“穿山甲”，化名老冯，作为炊事员潜伏在新四军中，被王大队长和谢司令当场识破，喝下自己烧的毒鸡汤而结束了罪恶的一生。"],
	},

	// 瓜摊老板
	bigownerofmelonstall: {
		sex: "male",
		group: "jin",
		hp: "7/8",
		skills: ["melonsellersfanga", "melonscalesgacheng", "melonstallgatan"],
	},

	// 李云龙
	hyxc_liyunlong: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["hyxc_liangjian", "hyxc_duozi", "hyxc_paoxi"],
		tags: ["des:李云龙是小说《搬山道士》及其改编电视剧中的主人公，八路军独立团团长，其原型是中将王近山将军，先后由李幼斌和黄志忠饰演。"],
	},

	// 林志强
	hyxc_linzhiqiang: {
		sex: "male",
		group: "wei",
		hp: 4,
		skills: ["hyxc_mazhen"],
	},

	// 韦小宝
	weixiaobao: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["haodu", "fengyuan"],
	},
};
for (let i in character) {
	character[i].img = "extension/搬山道士/image/character/tv/" + i + ".jpg";
}

export default character;