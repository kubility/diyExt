/** @type { importCharacterConfig['character'] } */
const character = {

	// 马保国
	mabaoguo: {
		sex: "male",
		group: "shu",
		hp: 3,
		skills: ["lightningwhip", "wude", "neigong", "neigong2"],
	},

	// 超商劫匪
	lyg_jiefei: {
		sex: "male",
		group: "wu",
		hp: 4,
		skills: ["lyg_yinxiang", "lyg_yaoqiang", "lyg_saodang", "qiangjie65", "zhanlan659", "pofang224"],
	},
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
};
for (let i in character) {
	character[i].img = "extension/搬山道士/image/character/net/" + i + ".jpg";
}

export default character;