/** @type { importCharacterConfig['character'] } */
const character = {

	// 黑衣人
	heiyiren: {
		sex: "none",
		group: "shen",
		hp: 1,
		skills: ["duanlu", "gaizaoshengji"],
		tags: ["zhu"],
	},

	// 管理大师
	guanlidashi: {
		sex: "male",
		group: "wei",
		hp: 4,
		skills: ["shijianGL"],
	},
	// 大宝
	"yldb": {
		sex: "male",
		group: "wu",
		hp: 4,
		skills: ["yldb_pojun", "yldb_nglmy"],
		tags: ["des:闹够了没有"],
	},
	// 毒刘备
	"毒刘备": {
		sex: "male",
		group: "shu",
		hp: 3,
		skills: ["毒枭", "枭雄"],
		tags: ["des:给你牌啊，怎么不要啊"],
	},
};
for (let i in character) {
	character[i].img = "extension/搬山道士/image/character/other/" + i + ".jpg";
}

export default character;