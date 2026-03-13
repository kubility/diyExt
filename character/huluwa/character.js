/** @type { importCharacterConfig['character'] } */
const character = {
	// 大娃（红娃）
	"大娃": {
		sex: "male",
		group: "huluwa",
		hp: 4,
		skills: ["libashanhe", "jurentai"],
	},
	// 二娃（橙娃）
	"二娃": {
		sex: "male",
		group: "huluwa",
		hp: 3,
		skills: ["qianliyan", "shunfenger"],
	},
	// 三娃（黄娃）
	"三娃": {
		sex: "male",
		group: "huluwa",
		hp: 4,
		skills: ["gangjintiegu", "jinzhongzhao"],
	},
	// 四娃（绿娃）
	"四娃": {
		sex: "male",
		group: "huluwa",
		hp: 3,
		skills: ["liehuo", "fenshao"],
	},
	// 五娃（青娃）
	"五娃": {
		sex: "male",
		group: "huluwa",
		hp: 3,
		skills: ["ganlu", "shuidun"],
	},
	// 六娃（蓝娃）
	"六娃": {
		sex: "male",
		group: "huluwa",
		hp: 3,
		skills: ["yinshen"],
	},
	// 七娃（紫娃）
	"七娃": {
		sex: "male",
		group: "huluwa",
		hp: 3,
		skills: ["shouyao", "baohulu"],
	},
	// 金刚葫芦妹
	"金刚葫芦妹": {
		sex: "female",
		group: "huluwa",
		hp: 3,
		skills: ["qicaihulu", "xiongmeitongxin"],
	},
	// 葫芦小金刚
	"葫芦小金刚": {
		sex: "male",
		group: "huluwa",
		hp: 1,
		maxHp: 1,
		skills: ["qixinguiyi", "huluzhenhun"],
	},
	// 老爷子
	"老爷子": {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["feifu", "laoDangYiZhuang"],
	},
};
for (let i in character) {
	character[i].img = "extension/搬山道士/image/character/huluwa/" + i + ".jpg";
}

export default character;
