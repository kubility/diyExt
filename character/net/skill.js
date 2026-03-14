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
	
	// 步惊云 - 你不要过来啊！
	qun_dont_come: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: { target: "useCardToBefore" },
		forced: true,
		filter: function (event, player) {
			if (!event.targets || !event.targets.includes(player)) return false;
			if (event.player == player) return false;
			return true;
		},
		content: async function (event, trigger, player) {
			player.say('你不要过来啊！');
			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', '你不要过来啊');
			const judge = await player.judge();
			const suit = judge.suit;
			const target = trigger.player;

			if (suit === 'heart') {
				game.log(target, '被迫选择其他目标...');
				if (event.targets.length === 1) {
					const newTarget = await target.chooseTarget('选择一个新目标', (card, player, target) => {
						return target != player && lib.filter.filterTarget.apply(this, [card, player, target]);
					}).forResult();
					if (newTarget.bool && newTarget.targets.length > 0) {
						event.targets = newTarget.targets;
					} else {
						event.cancel();
					}
				} else {
					event.cancel();
				}

			} else if (suit === 'diamond') {
				const drawnCards = await player.draw(1);
				player.say('好可怕，我挡！');
				if (drawnCards && drawnCards.length > 0) {
					await player.showCards(drawnCards);
				}
			} else if (suit === 'spade') {
				await player.damage(1);
				if (target.countCards('h') > 0) {
					await target.discard(1);
				}
			} else {
				await player.draw(1);
				await target.draw(1);
				player.say('三分归元气！');
				target.say('三分归元气！');
			}
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (player.hasSkill('qun_dont_come')) {
						return [0.5, 0.5];
					}
				},
			},
		},
	},
 
	// 步惊云 - 麒麟臂乱甩
	qun_kirin_arm: {
		audio: "ext:搬山道士/audio/skill:3",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		filterTarget: function (card, player, target) {
			return target != player && target.countCards('h') > 0;
		},
		selectTarget: 1,
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			const playerDiscard = await player.chooseCard('h', true, '选择一张手牌进行麒麟臂乱甩').forResult();
			if (!playerDiscard.bool) return;

			const targetDiscard = await target.chooseCard('h', true, '选择一张手牌进行麒麟臂乱甩').forResult();
			if (!targetDiscard.bool) return;

			const playerCard = playerDiscard.cards[0];
			const targetCard = targetDiscard.cards[0];

			await player.discard(playerCard);
			await target.discard(targetCard);

			const playerNum = get.number(playerCard);
			const targetNum = get.number(targetCard);
			if (playerNum > targetNum) {
				await target.damage(1);
				player.say('麒麟臂，发作了！');
			} else if (playerNum < targetNum) {
				await player.damage(1);
				player.say('我的麒麟臂啊！');
			} else {
				await player.draw(2);
				await target.draw(2);
				player.say('风云合璧，摩柯无量！');
				target.say('风云合璧，摩柯无量！');
			}
		},
		ai: {
			order: 6,
			result: {
				target: function (player, target) {
					return -1;
				},
				player: function (player, target) {
					return 1;
				},
			},
		},
	},

	// 步惊云 - 绝世好剑
	qun_sword_curse: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "useCardAfter",
		},
		forced: true,
		mark: true,
		marktext: "⚔",
		intro: {
			name: "剑",
			content: function (storage, player) {
				if (player.countMark('qun_sword_curse') === 1) {
					return '好剑';
				} else if (player.countMark('qun_sword_curse') === 2) {
					return '好贱';
				} else {
					return '郝建';
				}
			},
		},
		filter: function (event, player) {
			if (!event.card) {
				return false;
			}
			return event.card &&
				get.type(event.card) === 'equip' &&
				get.subtype(event.card) === 'equip1';
		},
		content: async function (event, trigger, player) {
			const judge = await player.judge();
			const suit = judge.suit;
			const weapon = player.getEquip(1);

			if (suit === 'heart') {
				player.say('绝世好剑，归我了！');
				player.addTempSkill('qun_sword_curse_boost', { player: 'phaseEnd' });
				player.addMark('qun_sword_curse', 1);

			} else if (suit === 'diamond') {
				if (player.countCards('h') > 0) {
					await player.discard(1);
					player.say('绝世好剑，好剑啊！');
				}
			} else if (suit === 'spade') {
				await player.draw(2);
				player.say('绝世好剑，怎么这样！');
				player.addTempSkill('qun_sword_curse_weak', { player: 'phaseEnd' });
				player.addMark('qun_sword_curse', 2);
			} else {
				if (weapon) {
					await player.discard(weapon);
					player.say('我的绝世好剑啊！');
				}
			}
		},
		subSkill: {
			boost: {
				charlotte: true,
				mod: {
					cardUsable: function (card, player, num) {
						if (card.name === 'sha') {
							return Infinity;  // 杀可以无限使用
						}
						return num;
					},
					attackRange: function (player, num) {
						return num + 3;  // 攻击范围+1
					},
					selectTarget: function (card, player, range) {
						return range + 2;
					},
				},
			},
			weak: {
				charlotte: true,
				mod: {
					attackRange: function (player, num) {
						return 0;  // 攻击范围-1
					},
				},
			},
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (get.type(card) === 'equip' && get.subtype(card) === 'equip1') {
						return [0.5, 0.5];
					}
				},
			},
		},
	},

};

export default skill;