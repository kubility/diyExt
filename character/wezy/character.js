/** @type { importCharacterConfig['character'] } */
const character = {

	// 刘海柱
	wezy_liuhuizhu: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["wezy_xiayi", "wezy_xiuche", "wezy_dantiao"],
	},

	// 吴京
	wezy_wujing: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["wezy_duoming", "wezy_tanke_wujing", "wezy_zhanlang_paoxiao"],
	},
	// 步惊云
	qun_bujingyun: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["qun_dont_come", "qun_kirin_arm", "qun_sword_curse"],
	},

	// 唐纳德·特朗普
	qun_trump: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["qun_moyin", "qun_jianqiang", "qun_fuguo", "qun_tuite"],
	},

	// 雷军
	qun_leijun: {
		sex: "male",
		group: "qun",
		hp: 3,
		skills: ["qun_ok", "qun_youshang", "qun_xingjiabi", "qun_chonggao", "qun_mifen", "qun_yindushenqu"],
	},
		// 专业律师
	zhuanyelvshi: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["打官司", "觉醒"],
	},


};
for (let i in character) {
	character[i].img = "extension/搬山道士/image/character/wezy/" + i + ".jpg";
}
export default character;
