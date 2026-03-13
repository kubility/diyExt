import { lib, game, ui, get, ai, _status } from "../../main/utils.js";

/** @type { importCharacterConfig['skill'] } */
const skill = {
	// 马保国 - 闪电鞭
	lightningwhip: {
		audio: "ext:搬山道士/audio/skill:2",
		enable: "phaseUse",
		filter: function (event, player) {
			var num = player.getAttackRange();
			if ((player.getStat().skill.lightningwhip || 0) >= num) return false;
			return player.countCards('he', { color: 'black' }) > 0;
		},
		filterTarget: true,
		position: "he",
		filterCard: {
			color: "black",
		},
		selectTarget: 1,
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			await target.damage(1, 'thunder');
			if (!target.isLinked()) {
				await target.link(true);
			}
		},
	},
	// 马保国 - 武德
	wude: {
		audio: "ext:搬山道士/audio/skill:3",
		trigger: {
			global: "phaseBegin",
		},
		direct: true,
		filter: function (event, player) {
			return event.player != player && _status.currentPhase.countCards('hej');
		},
		content: async function (event, trigger, player) {
			const result = await player.chooseBool(get.prompt("wude"), "是否发动\"武德\"，视为对其使用一张【过河拆桥】", function (card, player, target) {
				return true;
			}).forResult();

			if (result.bool) {
				player.logSkill('wude');
				await player.useCard({ name: 'guohe', isCard: true }, _status.currentPhase, false);
			}
		},
		ai: {
			result: {
				player: 0.8,
			},
		},
	},

	// 马保国 - 内功
	neigong: {
		audio: "ext:搬山道士/audio/skill:2",
		frequent: true,
		locked: true,
		forced: true,
		trigger: {
			player: "damageEnd",
		},
		logTarget: "source",
		preHidden: true,
		filter: function (event, player) {
			return (event.source && event.source.countGainableCards(player, 'hej') && event.num > 0 && _status.currentPhase != player);
		},
		content: async function (event, trigger, player) {
			await player.gainPlayerCard(trigger.source, true, 'hej', trigger.source.countCards('hej'));
		},
	},

	// 马保国 - 内功2
	neigong2: {
		audio: "ext:搬山道士/audio/skill:3",
		frequent: true,
		locked: true,
		forced: true,
		trigger: {
			player: "damageEnd",
		},
		logTarget: "source",
		preHidden: true,
		filter: function (event, player) {
			return (event.source && event.source.countGainableCards(player, 'hej') && event.num > 0 && _status.currentPhase == player);
		},
		content: async function (event, trigger, player) {
			await player.chooseToDiscard(player.countCards('hej'), true).forResult();
		},
	},

	// 超商劫匪 - 音响
	lyg_yinxiang: {
		trigger: {
			player: 'phaseBegin',
		},
		forced: true,
		juexingji: true,
		skillAnimation: true,
		animationColor: 'thunder',
		filter: function (event, player) {
			return true;
		},
		content: async function (event, trigger, player) {
			player.awakenSkill('lyg_yinxiang');
			const path = lib.assetURL + '/audio/skill/bgm.mp3';
			ui.backgroundMusic.src = path;
			ui.backgroundMusic.addEventListener('ended', function () {
				ui.backgroundMusic.src = path;
			});
		}
	},

	// 超商劫匪 - 摇枪
	lyg_yaoqiang: {
		mod: {
			targetEnabled: function (card, player, target) {
				var name = get.name(card);
				if (name == 'sha' && target.getEquip(1) && target.inRange(player)) {
					return false;
				}
			},
		}
	},

	// 超商劫匪 - 扫荡
	lyg_saodang: {
		enable: ['chooseToUse'],
		filterCard: function (card) {
			return true;
		},
		mod: {
			cardEnabled2: function (card, player) {
				if (get.itemtype(card) == 'card' && card.hasGaintag('lyg_saodang')) return false;
			},
			ignoredHandcard: function (card, player) {
				if (get.itemtype(card) == 'card' && card.hasGaintag('lyg_saodang')) return true;
			},
			cardDiscardable: function (card, player, name) {
				if (name == 'phaseDiscard' && get.itemtype(card) == 'card' && card.hasGaintag('lyg_saodang')) return false;
			}
		},
		position: 'hes',
		viewAs: {
			name: 'shunshou'
		},
		viewAsFilter: function (player) {
			return player.countCards('h');
		},
		prompt: '将一张牌当【顺手牵羊】使用。',
		check: function (card) {
			return 7 - get.value(card);
		},
		init: function (player) {
			player.addSkill('lyg_saodang_begin');
			player.addSkill('lyg_saodang_end');
		},
		group: ['lyg_saodang_use', 'lyg_saodang_gain'],
		subSkill: {
			end: {
				sub: true,
				charlotte: true,
				priority: 25,
				direct: true,
				trigger: {
					player: 'phaseAfter',
				},
				filter: function (event, player) {
					return true;
				},
				content: async function (event, trigger, player) {
					player.removeGaintag('lyg_saodang');
				}
			},
			begin: {
				sub: true,
				priority: 23,
				popup: false,
				charlotte: true,
				forced: true,
				trigger: {
					player: ['phaseZhunbeiBegin', 'phaseJieshuEnd'],
				},
				filter: function (event, player) {
					return true;
				},
				content: async function (event, trigger, player) {
					if (trigger.name === 'phaseZhunbei') {
						player.node.avatar.setBackgroundImage(lib.assetURL + '/image/character/net/lyg_jiefei2.jpg');
					} else {
						player.node.avatar.setBackgroundImage(lib.assetURL + '/image/character/net/lyg_jiefei.jpg');
					}
				}
			},
			use: {
				sub: true,
				forced: true,
				trigger: {
					player: 'useCardAfter',
				},
				filter: function (event, player) {
					return event.card.name == 'shunshou';
				},
				content: async function (event, trigger, player) {
					trigger.cards.forEach(card => card.addGaintag('lyg_saodang'));
				}
			},
			gain: {
				sub: true,
				forced: true,
				trigger: {
					player: 'gainEnd',
				},
				filter: function (event, player) {
					return event.getParent().name == 'useCard' && event.getParent(2).name == 'lyg_saodang';
				},
				content: async function (event, trigger, player) {
					trigger.cards.forEach(card => card.addGaintag('lyg_saodang'));
				}
			},
		},
	},

	// 超商劫匪 - 抢劫
	qiangjie65: {
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			return target != player && target.countCards('he') > 0;
		},
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			await player.loseHp();
			const hs = target.getCards('he');
			await player.gain(hs, target);
			await target.$giveAuto(hs, player);

			let damage = (target.hp >= player.hp && get.damageEffect(target, player, player) > 0);
			if (damage && target.hp > 1) {
				for (let i = 0; i < hs.length; i++) {
					if (get.value(hs[i], player, 'raw') >= 8) {
						damage = false;
						break;
					}
				}
			}
			if (player.hp > target.hp) {
				await target.damage();
			}
			const chat = ['可爱的羊巴鲁，刚刚拿下印度！'].randomGet();
			player.say(chat);
		},
		ai: {
			order: 11,
			result: {
				target: function (player, target) {
					return -target.countCards('he');
				},
			},
		}
	},

	// 超商劫匪 - 展览
	zhanlan659: {
		trigger: {
			target: "shaBegin",
		},
		forced: true,
		content: async function (event, trigger, player) {
			player.changeHujia(3);
			const chat = ['正在向所有人展示军火。'].randomGet();
			player.say(chat);
		},
	},

	// 超商劫匪 - 破防
	pofang224: {
		trigger: {
			target: ["shaBefore"],
		},
		forced: true,
		frequent: true,
		priority: 10,
		filter: function (event, player) {
			return player.hp <= 3;
		},
		content: async function (event, trigger, player) {
			if (player.hp <= 2) {
				player.removeSkill('zhanlan659');
				await player.loseHp();
				await player.draw(2);
				player.removeSkill('pofang224');
			} else {
				return;
			}
		},
	},
};

export default skill;