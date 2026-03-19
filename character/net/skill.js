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

			// 创建 GIF 元素
			ui.backgroundMusic.pause();
			const gifOverlay = ui.create.div();

			// 直接设置样式
			gifOverlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url('extension/搬山道士/image/character/net/bygl.gif');
				background-position: center;
				background-repeat: no-repeat;
				background-size: contain;
				z-index: 9999;
				pointer-events: none;
			`;

			document.body.appendChild(gifOverlay);
			player.say('你不要过来啊！');
			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', '你不要过来啊');
			// 使用标准 setTimeout（推荐）
			await new Promise(resolve => {
				setTimeout(resolve, 2340);  // 等待2.34秒
			});
			gifOverlay.delete();
			ui.backgroundMusic.play();

			const judge = await player.judge().forResult();
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
			name: '剑',
			content: function (storage, player) {
				const curse = player.storage && player.storage.qun_sword_curse;
				if (!curse) return '郝建';
				if (curse === 'heart') {
					return '好剑';
				} else if (curse === 'spade') {
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
			const judge = await player.judge().forResult();
			const suit = judge.suit;
			const weapon = player.getEquip(1);
			delete player.storage.qun_sword_curse;
			if (suit === 'heart') {
				player.say('绝世好剑，归我了！');
				player.addTempSkill('qun_sword_curse_boost', { player: 'phaseEnd' });
				player.storage.qun_sword_curse = 'heart';

			} else if (suit === 'diamond') {
				if (player.countCards('h') > 0) {
					await player.discard(1);
					player.say('绝世好剑，好剑啊！');
				}
			} else if (suit === 'spade') {
				await player.draw(2);
				player.say('绝世好剑，怎么这样！');
				player.addTempSkill('qun_sword_curse_weak', { player: 'phaseEnd' });
				player.storage.qun_sword_curse = 'spade';
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

	// 唐纳德·特朗普 - 魔音
	qun_moyin: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "useCardToAfter",
		},
		forced: true,
		filter: function (event, player) {
			if (!event.card) return false;
			return event.card.name === 'sha' || get.type(event.card) === 'trick';
		},
		content: async function (event, trigger, player) {
			const result = await player.judge().forResult();
			const color = result.color;
			const targets = trigger.targets;
			if (color === 'red') {
				player.say('China! China! China!');
				trigger.card.wuxie = true;
			} else if (color === 'black') {
				player.say("It's gonna be Huge! Yuge!");
				for (const target of targets) {
					if (target.countCards('h') > 0) {
						const discard = await target.chooseCard('h', true, '弃置一张手牌，否则本回合武将技能无效').forResult();
						if (discard.bool) {
							await target.discard(discard.cards);
						} else {
							target.addTempSkill('qun_moyin_disable', { player: 'phaseBegin' });
						}
					} else {
						target.addTempSkill('qun_moyin_disable', { player: 'phaseBegin' });
					}
				}
			}
		},
		subSkill: {
			disable: {
				charlotte: true,
				mark: true,
				marktext: "禁",
				intro: {
					content: "本回合武将技能无效"
				},
				trigger: {
					player: "useSkill",
				},
				filter: function (event, player) {
					return event.skill && !event.skill.includes('qun_moyin_disable');
				},
				content: async function (event, trigger, player) {
					event.cancel();
				},
			},
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (card.name === 'sha' || get.type(card) === 'trick') {
						return [0.5, 0.5];
					}
				},
			},
		},
	},

	// 唐纳德·特朗普 - 建墙
	qun_jianqiang: {
		audio: "ext:搬山道士/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards('h') >= 2;
		},
		filterTarget: function (card, player, target) {
			return target !== player;
		},
		selectTarget: 1,
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			const discard = await player.chooseCard('h', 2, true, '弃置两张手牌').forResult();
			if (discard.bool) {
				await player.discard(discard.cards);
				player.say('I will build a great wall!');
				target.link(true);
				target.addTempSkill('qun_jianqiang_effect', { player: 'phaseBegin' });
			}
		},
		subSkill: {
			effect: {
				charlotte: true,
				mark: true,
				marktext: "墙",
				intro: {
					content: "不能使用或打出牌指定特朗普为目标，且计算与特朗普的距离+1"
				},
				mod: {
					attackRange: function (player, num) {
						return Math.max(1, num - 1);
					},
					globalFrom: function (from, to, distance) {
						if (to.hasSkill('qun_jianqiang')) {
							return distance + 1;
						}
						return distance;
					},
				},
				trigger: {
					player: "useCardToBefore",
				},
				filter: function (event, player) {
					if (!event.targets || !event.targets.includes(player)) return false;
					const trump = game.findPlayer(i => i.hasSkill('qun_jianqiang'));
					if (!trump) return false;
					return event.targets.includes(trump);
				},
				content: async function (event, trigger, player) {
					trigger.cancel();
					player.say('该死的墙!');
				},
			},
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

	// 唐纳德·特朗普 - 复国
	qun_fuguo: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "phaseBegin",
		},
		forced: true,
		juexingji: true,
		filter: function (event, player) {
			return player.isDamaged() && player.countCards('h') > player.hp;
		},
		content: async function (event, trigger, player) {
			player.say('Make America Great Again!');
			await player.loseMaxHp();
			await player.recover();

			if (player.hasSkill('qun_tuite')) {
				await player.draw(3);
				const sha = await player.chooseCard('h', true, '选择一张牌作为火杀').forResult();
				if (sha.bool) {
					const targets = game.filterPlayer(i => i !== player);
					for (const target of targets) {
						await target.damage(1, 'fire');
					}
				}
			} else {
				player.addSkill('qun_tuite');
			}
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (player.hasSkill('qun_fuguo')) {
						return [0.5, 0.5];
					}
				},
			},
		},
	},

	// 唐纳德·特朗普 - 推特
	qun_tuite: {
		audio: "ext:搬山道士/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		content: async function (event, trigger, player) {
			const choose = await player.chooseCard('h', true, '选择一张牌展示').forResult();
			if (choose.bool) {
				const card = choose.cards[0];
				await player.showCards(card);
				const suit = get.suit(card);
				const num = get.number(card);
				const suitText = {
					'heart': '红桃',
					'diamond': '方块',
					'spade': '黑桃',
					'club': '梅花'
				}[suit];
				const cardText = suitText + num + '!';
				player.say(`Twitter! ${cardText}!`);

				const targets = game.filterPlayer(i => i !== player);
				const sameSuitCards = [];

				for (const target of targets) {
					if (target.countCards('h') > 0) {
						const result = await target.chooseCard('h', true, `展示一张${suitText}牌`).set('ai', function (card) {
							if (get.suit(card) === suit) {
								return 10;
							}
							return 0;
						}).forResult();
						if (result.bool) {
							const targetCard = result.cards[0];
							if (get.suit(targetCard) === suit) {
								sameSuitCards.push({ target, card: targetCard });
							} else {
								await target.damage(1, 'thunder');
								if (target.countCards('h') > 0) {
									const discard = await target.chooseCard('h', true, '弃置一张牌').forResult();
									if (discard.bool) {
										await target.discard(discard.cards);
									}
								}
							}
						} else {
							await target.damage(1, 'thunder');
							if (target.countCards('h') > 0) {
								const discard = await target.chooseCard('h', true, '弃置一张牌').forResult();
								if (discard.bool) {
									await target.discard(discard.cards);
								}
							}
						}
					} else {
						await target.damage(1, 'thunder');
					}
				}

				if (sameSuitCards.length > 0) {
					const gain = await player.chooseCard(sameSuitCards.map(i => i.card), true, '获得一张牌').forResult();
					if (gain.bool) {
						const gainCard = gain.cards[0];
						const owner = sameSuitCards.find(i => i.card === gainCard);
						if (owner) {
							await player.gain(gainCard, owner.target, 'giveAuto');
						}
					}
				}
			}
		},
		ai: {
			order: 6,
			result: {
				player: function (player, target) {
					return 1;
				},
			},
		},
	},

	// 雷军 - 友商
	qun_youshang: {
		audio: "ext:搬山道士/audio/skill:2",
		enable: "phaseUse",  // 出牌阶段使用
		usable: 1,  // 每回合限1次
		mark: false,
		markText: "友商",
		intro: {
			content: "友商是鲨臂"
		},
		filter: function (event, player) {
			return !player.storage.qun_youshang_friend;
		},
		content: async function (event, trigger, player) {
			const targetResult = await player.chooseTarget('观看一名角色的手牌', function (card, player, target) {
				return target != player && target.countCards('h') > 0;
			}).forResult();

			if (!targetResult.bool || targetResult.targets.length === 0) return;
			const target = targetResult.targets[0];
			await player.viewCards("友商是鲨臂",target.getCards('h'));
			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ysssb');
			player.storage.qun_youshang_friend = target.playerid;
			target.markSkill('qun_youshang');
		},
		ai: {
			expose: 0.3,
		},
		group: ['qun_youshang_clear'],
		subSkill: {
			clear: {
				trigger: 'phaseBegin',
				filter: function (event, player) {
					return player.storage.qun_youshang_friend;
				},
				content: async function (event, trigger, player) {
					const friends = game.findPlayer(player => player.playerid === player.storage.qun_youshang_friend);
					if (friends && friends.length > 0) {
						for (const friend of friends) {
							friend.unmarkSkill('qun_youshang');
						}
					}
					delete player.storage.qun_youshang_friend;
				},
			},
		},
	},
	// 雷军 - OK（主动技能）
	qun_ok: {
		audio: "ext:搬山道士/audio/skill:1",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		filterTarget: function (card, player, target) {
			return target !== player;
		},
		selectTarget: 1,
		content: async function (event, trigger, player) {
			const discard = await player.chooseCard('h', true, '弃置一张手牌').forResult();
			if (!discard.bool) return;

			await player.discard(discard.cards);
			const target = event.targets[0];

			const judge = await player.judge().forResult();

			const suit = judge.suit;

			if (suit === 'heart') {
				const choices = ['摸两张牌', '回复1点体力', '本回合使用的下一张牌无视距离'];
				const choice = await player.chooseControl(choices).set('prompt', '选择一项效果').forResult();
				const lucky = Math.random() < 0.5 ? player : target;
				if (choice.control === '摸两张牌') {
					await lucky.draw(2);
				} else if (choice.control === '回复1点体力') {
					if (lucky.hp === lucky.maxHp) {
						await lucky.gainMaxHp();
					} else {
						await lucky.recover();
					}
				} else if (choice.control === '本回合使用的下一张牌无视距离') {
					lucky.addTempSkill('qun_ok_range', { player: 'phaseUseEnd' });
				}
			} else if (suit === 'spade') {
				if (target.countCards('h') > 0) {
					const give = await target.chooseCard('h', true, '交给雷军一张手牌').forResult();
					if (give.bool) {
						await target.give(give.cards, player);
					}
				}
				target.addTempSkill('qun_ok_invalid', { player: 'phaseUseEnd' });
				player.say('Are you Not OK?');
			} else {
				player.draw();
				target.draw();
				player.say('Hmm...');
			}
		},
		ai: {
			order: 6,
			result: {
				player: function (player, target) {
					return 1;
				},
				target: function (player, target) {
					const friend = game.findPlayer(player => player.playerid === player.storage.qun_youshang_friend);
					if (friend && target === friend) {
						return 2;
					}
					return get.attitude(player, target) > 0 ? 1 : -1;
				},
			},
		},
		subSkill: {
			range: {
				charlotte: true,
				mod: {
					targetInRange: function (card, player, target) {
						return true;
					},
				},
			},
			invalid: {
				charlotte: true,
				mod: {
					cardEnabled: function (card, player) {
						return false;
					},
				},
			},
		},
	},

	// 雷军 - 性价比
	qun_xingjiabi: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "phaseDrawBegin",
		},
		filter: function (event, player) {
			return true;
		},
		forced: true,
		content: async function (event, trigger, player) {
			trigger.changeToZero();
			const quotes = ['感动人心，价格厚道！', '我们要和用户做朋友！'];
			const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
			player.say(randomQuote);

			await player.draw(3);
			const { cards } = event;
			const sortedCards = cards.sort((a, b) => get.number(a) - get.number(b));
			const otherCards = sortedCards.slice(1);

			const result = await player.chooseTarget('将剩余牌交给一名其他角色', true, (card, player, target) => {
				return target !== player;
			}).forResult();

			if (result.bool && result.targets.length > 0) {
				const target = result.targets[0];
				await player.give(otherCards, target);
				target.addTempSkill('qun_xingjiabi_draw', { player: 'phaseUseBegin' });
			}
		},
		ai: {
			order: 5,
			result: {
				player: function (player, target) {
					return 1;
				},
			},
		},
		subSkill: {
			draw: {
				charlotte: true,
				trigger: {
					player: "phaseDraw",
				},
				filter: function (event, player) {
					return true;
				},
				forced: true,
				content: async function (event, trigger, player) {
					event.num = Math.min(event.num + 1, 5);
				},
			},
		},
	},

	// 雷军 - 冲高
	qun_chonggao: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "phaseUseBegin",
		},
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		forced: true,
		content: async function (event, trigger, player) {
			const cards = player.getCards('h');
			const count = cards.length;

			if (player.countCards('h') > player.hp) {
				// 手牌数 > hp：全部变成点数大于7的杀
				await player.lose(cards, ui.discardPile);
				const newCards = [];
				for (let i = 0; i < count; i++) {
					const newCard = game.createCard('sha', 'diamond', Math.floor(Math.random() * 6) + 8);
					newCards.push(newCard);
				}
				await player.gain(newCards, 'draw');
				player.addTempSkill('qun_chonggao_sha', { player: 'phaseEnd' });
			} else {
				// 手牌数 ≤ hp：全部变成点数小于7的闪
				await player.lose(cards, ui.discardPile);
				const newCards = [];
				for (let i = 0; i < count; i++) {
					const newCard = game.createCard('shan', 'club', Math.floor(Math.random() * 6) + 1);
					newCards.push(newCard);
				}
				await player.gain(newCards, 'draw');
			}
		},
		subSkill: {
			sha: {
				charlotte: true,
				mod: {
					cardUsable: function (card, player) {
						if (card.name === 'sha') {
							return Infinity;
						}
						return null;
					},
				},
			},
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (card.name === 'sha') {
						return [0.5, 0.5];
					}
				},
			},
		},
	},

	// 雷军 - 隐藏彩蛋：米粉
	qun_mifen: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			global: "damageBegin",
		},
		filter: function (event, player) {
			if (!event.source || !event.source.hasSkill('qun_chonggao')) return false;
			const huawei = game.findPlayer(i => i.hasSkill('qun_chonggao') && i !== event.source);
			return event.source.hasSkill('qun_chonggao') && huawei;
		},
		forced: true,
		content: async function (event, trigger, player) {
			event.num++;
		},
	},

	// 雷军 - 隐藏彩蛋：印度神曲
	qun_yindushenqu: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "judgeEnd",
		},
		filter: function (event, trigger, player) {
			const friend = game.findPlayer(player => player.playerid === player.storage.qun_youshang_friend);
			return friend && event.result.suit === 'heart';
		},
		forced: true,
		content: async function (event, trigger, player) {
			const gif = ui.create.div();
			gif.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url('extension/搬山道士/image/character/net/areyouok.gif');
				background-position: center;
				background-repeat: no-repeat;
				background-size: contain;
				z-index: 9999;
				pointer-events: none;
			`;
			document.body.appendChild(gif);

			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'areyouok2');

			await new Promise(resolve => {
				setTimeout(resolve, 5000);
			});

			gif.delete();
		},
	},

};

export default skill;