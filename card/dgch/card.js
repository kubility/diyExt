import { lib, game, ui, get, ai, _status } from "../../main/utils.js";
const card = {
	// 如意金箍棒
	th_ruyijingubang: {
		fullimage: true,
		type: "equip",
		subtype: "equip1",
		//derivation:["th_sunwukong"],
		skills: ["th_ruyijingubang"],
		ai: {
			basic: {
				equipValue: 520,
				order: function (card, player) {
					if (player && player.hasSkillTag('reverseEquip')) {
						return 8.5 - get.equipValue(card, player) / 20;
					}
					else {
						return 8 + get.equipValue(card, player) / 20;
					}
				},
				useful: 520,
				value: function (card, player, index, method) {
					if (player.isDisabled(get.subtype(card))) return 0.01;
					var value = 0;
					var info = get.info(card);
					var current = player.getEquip(info.subtype);
					if (current && card != current) {
						value = get.value(current, player);
					}
					var equipValue = info.ai.equipValue;
					if (equipValue == undefined) {
						equipValue = info.ai.basic.equipValue;
					}
					if (typeof equipValue == 'function') {
						if (method == 'raw') return equipValue(card, player);
						if (method == 'raw2') return equipValue(card, player) - value;
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != 'number') equipValue = 0;
					if (method == 'raw') return equipValue;
					if (method == 'raw2') return equipValue - value;
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: function (player, target, card) {
					return get.equipResult(player, target, card.name);
				},
			},
		},
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player && (target.name1 == 'th_sunwukong' || target.name2 == 'th_sunwukong');
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
	},
	// 高达宝具牌
	qijinqichu: {
		type: "equip",
		subtype: "equip5",
		skills: ["qijinqichu_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		ai: {
			threaten: 10,
		},
		fullimage: true,
	},

	paoxiaozhendan: {
		type: "equip",
		subtype: "equip1",
		skills: ["paoxiaozhendan_skill"],
		distance: {
			attackFrom: -2,
		},
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		ai: {
			threaten: 10,
		},
		fullimage: true,
	},

	mengjiangzhilie: {
		type: "equip",
		subtype: "equip4",
		distance: {
			globalFrom: -1,
		},
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		skills: ["mengjiangzhilie_skill"],
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	bawanghunzi: {
		type: "equip",
		subtype: "equip2",
		skills: ["bawanghunzi_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	xingluanfangong: {
		type: "equip",
		subtype: "equip3",
		distance: {
			globalTo: 1,
		},
		skills: ["xingluanfangong_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	shibaocichou: {
		type: "equip",
		subtype: "equip3",
		skills: ["shibaocichou_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	piguashangzhen: {
		type: "equip",
		subtype: "equip1",
		skills: ["piguashangzhen_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	kuaimatuxi: {
		type: "equip",
		subtype: "equip4",
		skills: ["kuaimatuxi_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	qizuozhicai: {
		type: "equip",
		subtype: "equip2",
		skills: ["qizuozhicai_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	kuangcaishejian: {
		type: "equip",
		subtype: "equip5",
		skills: ["kuangcaishejian_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	weiyangmoji: {
		type: "equip",
		subtype: "equip4",
		skills: ["weiyangmoji_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	tianxiaguixin: {
		type: "equip",
		subtype: "equip3",
		skills: ["tianxiaguixin_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	fuchouzhihuo: {
		type: "equip",
		subtype: "equip5",
		skills: ["fuchouzhihuo_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	huchiyongli: {
		type: "equip",
		subtype: "equip1",
		skills: ["huchiyongli_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	manwangzaiqi: {
		type: "equip",
		subtype: "equip2",
		skills: ["manwangzaiqi_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	qianxungongbi: {
		type: "equip",
		subtype: "equip4",
		skills: ["qianxungongbi_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	cuixinkemou: {
		type: "equip",
		subtype: "equip3",
		skills: ["cuixinkemou_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	yanyiweizhong: {
		type: "equip",
		subtype: "equip2",
		skills: ["yanyiweizhong_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	jiangdongtiebi: {
		type: "equip",
		subtype: "equip1",
		skills: ["jiangdongtiebi_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},

	shizhanyangwei: {
		type: "equip",
		subtype: "equip5",
		skills: ["shizhanyangwei_skill"],
		enable: true,
		selectTarget: -1,
		filterTarget: function (card, player, target) {
			return target == player;
		},
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (cards.length && get.position(cards[0], true) == 'o') target.equip(cards[0]);
		},
		toself: true,
		fullimage: true,
		ai: {
			threaten: 10,
		},
	},
};

for (let i in card) {
	if (!card[i].cardimage) {
		card[i].image = "ext:搬山道士/image/card/dgch/" + i + ".png";
	}
}

export default card;
