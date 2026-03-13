import { lib, game, ui, get, ai, _status } from "../../main/utils.js";

/** @type { importCharacterConfig['skill'] } */
const skill = {
	bigdao: {
		audio: "ext:搬山道士/audio/skill:3",
		shaRelated: true,
		trigger: {
			player: "useCardToPlayered",
		},
		filter: function (event, player) {
			return event.card.name == 'sha';
		},
		logTarget: "target",
		preHidden: true,
		content: async function (event, trigger, player) {
			const target = trigger.target;
			if (!target.hasSkill("liuxue")) {
				target.addSkill("liuxue");
			}
			target.addMark("liuxue");
		},
	},
	liuxue: {
		trigger: {
			global: "useCardAfter",
		},
		marktext: "流",
		forced: true,
		locked: true,
		popup: false,
		charlotte: true,
		filter: function (event, player) {
			return player.countMark('liuxue') > 0;;
		},
		content: function () {
			player.logSkill("liuxue");
			player.loseHp(player.countMark('liuxue'))
		},
		intro: {
			content: function (storage, player, skill) {
				return '当前有' + storage + '个“流血”标记';
			},
		},
	},
	yingbian: {
		audio: "yingbian_1",
		mark: true,
		locked: false,
		forced: true,
		zhuanhuanji: true,
		marktext: "☯",
		intro: {
			content: function (storage, player, skill) {
				if (player.storage.yingbian == true) return '【阴】：若你没有【闪】，防止此伤害';
				return '【阳】：若你没有【杀】，防止此伤害';
			},
		},
		group: ["yingbian_1", "yingbian_2"],
		subSkill: {
			"1": {
				audio: "2",
				forced: true,
				trigger: {
					player: "damageBegin4",
				},
				filter: function (event, player) {
					return !player.countCards('h', 'sha') && !player.storage.yingbian;
				},
				content: function () {
					'step 0'
					player.chooseBool(get.prompt("yingbian"), "是否发动“应变【阳】”，制衡所有手牌，免疫此次伤害")

					'step 1'
					var cc = player.countCards('h');
					if (result.bool) {
						player.logSkill("yingbian_1");
						player.chooseToDiscard(player.countCards('h'), true);
						player.draw(cc);
						trigger.cancel();
						player.changeZhuanhuanji('yingbian');


					}
				},
				sub: true,
			},
			"2": {
				audio: 2,
				forced: true,
				trigger: {
					player: "damageBegin4",
				},
				filter: function (event, player) {
					return !player.countCards('h', 'shan') && player.storage.yingbian == true;
				},
				content: function () {
					'step 0'
					player.chooseBool(get.prompt("yingbian"), "是否发动“应变【阴】”，制衡所有手牌，免疫此次伤害")
					'step 1'
					if (result.bool) {
						var cc = player.countCards('h');
						player.logSkill("yingbian_2");
						player.chooseToDiscard(player.countCards('h'), true);
						player.draw(cc);
						trigger.cancel();
						player.changeZhuanhuanji('yingbian');

					}
				},
				sub: true,
			},
		},
	},
	dianlu: {
		audio: "ext:搬山道士/audio/skill:2",
		locked: true,
		forced: true,
		mod: {
			cardname: function (card, player) {
				var type = get.subtype(card, false);
				if (type == 'equip3' || type == 'equip4' || type == 'equip6') { return 'jiu' }
			},
			globalFrom: function (from, to, distance) {
				return distance - 2;
			},
		},
	},
	csj_baolu: {
		audio: "ext:搬山道士/audio/skill:8",
		trigger: {
			player: "phaseBegin",
		},
		filter: function (event, player) {
			return player.countMark("dpoioned") >= 3;
		},
		content: async function (event, trigger, player) {
			player.logSkill("csj_baolu");
			// 暴露技能：当蓄力点达到3时，获得额外摸牌机会
			await player.draw(2);
			// 但会暴露身份，受到1点伤害
			await player.loseHp(1);
		},
	},

	csj_dutang: {
		audio: "ext:搬山道士/audio/skill:8",
		trigger: {
			player: "phaseUse",
		},
		enable: "phaseUse",
		filter: function (event, player) {
			return player.countCards("h") > 0;
		},
		content: async function (event, trigger, player) {
			player.logSkill("csj_dutang");
			// 毒汤技能：将一张手牌视为【毒】使用
			const result = await player.chooseCard("选择一张牌制作毒汤", "h", 1, true).forResult();
			if (result.bool) {
				const card = result.cards[0];
				await player.useCard({ name: "du" }, null, [card]);
			}
		},
	},

	csj_zhending: {
		audio: "ext:搬山道士/audio/skill:8",
		trigger: {
			player: "damageBegin",
		},
		filter: function (event, player) {
			return event.target === player;
		},
		content: async function (event, trigger, player) {
			player.logSkill("csj_zhending");
			// 镇定技能：受到伤害时，有机会减少伤害
			const result = await player.chooseBool("是否使用镇定技能减少伤害？").forResult();
			if (result.bool) {
				trigger.num = Math.max(0, trigger.num - 1);
				// 消耗一个蓄力点
				if (player.countMark("dpoioned") > 0) {
					player.removeMark("dpoioned");
					player.syncStorage("dpoioned");
				}
			}
		},
	},

	cxyTianCai: {
		trigger: { global: "phaseUseBegin" },
		filter: function (event, player) {
			return event.player != player;
		},
		forced: true,
		content: async function (event, trigger, player) {
			await player.draw();

			const targets = game.filterPlayer(function (current) {
				return current != player && current.num('h');
			});
			const num = Math.min(3, targets.length);
			const result = await player.chooseTarget("选择弃置其他" + num + "名角色的各一张手牌", num, function (card, player, target) {
				return target != player && target.num('h');
			}, true)
				.set('ai', function (target) {
					return 12 - get.attitude(player, target);
				})
				.forResult();

			if (result.bool) {
				result.targets.sort(lib.sort.seat);
				player.line(result.targets);
				for (const target of result.targets) {
					await player.discardPlayerCard(target, "h", true);
				}
			}

			if (trigger.player.isAlive()) {
				await trigger.player.damage(player);
				trigger.player.addTempSkill("cxyTianCai_delay", { player: "phaseBefore" });
			}
		},
		subSkill: {
			delay: {
				onremove: function (player) {
					player.addSkill("cxyTianCai_ban");
				},
			},
			ban: {
				mod: {
					playerEnabled: function (card, player, target) {
						if (["basic", "trick"].contains(get.type(card)) && get.distance(player, target) > 1) {
							return false;
						}
					},
				},
				mark: true,
				marktext: "禁",
				intro: {
					name: "天才",
					content: "你不能对距离1以外的角色使用基本牌和非延时锦囊牌",
				},
				temp: true,
			},
		},
	},

	cxyXiaoXiong: {
		trigger: { target: "useCardToBefore" },
		filter: function (event, player) {
			return event.player != player && _status.currentPhase != player && ["basic", "trick"].contains(get.type(event.card));
		},
		forced: true,
		content: async function (event, trigger, player) {
			await player.draw();
			player.loseHp();

			const result = await player.chooseTarget("选择两名角色", 2, true)
				.set('ai', function (target) {
					return 12 - get.attitude(player, target);
				})
				.forResult();

			if (result.bool) {
				result.targets.sort(lib.sort.seat);
				player.line(result.targets);
				for (const target of result.targets) {
					target.addSkill("cxyXiaoXiong_buff1");
					target.storage.cxyXiaoXiong_buff1 = player;
					target.markSkillCharacter("cxyXiaoXiong", player, "枭雄", "你替" + get.translation(player) + "承受除体力流失和闪电以外所有伤害");
				}
			}

			trigger.player.addSkill("cxyXiaoXiong_buff2");
			trigger.player.markSkillCharacter('cxyXiaoXiong', player, '枭雄', '出牌阶段结束时，你失去1点体力');
		},
		subSkill: {
			buff1: {
				temp: true,
				trigger: { global: "damageBegin" },
				filter: function (event, player) {
					return event.player == player.storage.cxyXiaoXiong_buff1;
				},
				onremove: function (player) {
					player.unmarkSkill("cxyXiaoXiong");
					delete player.storage.cxyXiaoXiong_buff1;
				},
				logTarget: 'player',
				forced: true,
				content: function () {
					trigger.player = player;
				},
			},
			buff2: {
				temp: true,
				trigger: { player: "phaseUseAfter" },
				forced: true,
				content: function () {
					player.loseHp();
				},
			},
		},
	},

	dianlu: {
		audio: "ext:搬山道士/audio/skill:2",
		locked: true,
		forced: true,
		mod: {
			cardname: function (card, player) {
				var type = get.subtype(card, false);
				if (type == 'equip3' || type == 'equip4' || type == 'equip6') { return 'jiu' }
			},
			globalFrom: function (from, to, distance) {
				return distance - 2;
			},
		},
	},

	doubleagent: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			global: "phaseEnd",
		},
		forced: true,
		zhuanhuanji: "doubleagent",
		filter: function (event, player) {
			return true;
		},
		content: async function (event, trigger, player) {
			let list;
			if (player.hasSkill("chshu")) {
				list = ["魏势力", "吴势力", "群势力"].map((i) => get.strNumber(i));
			} else if (player.hasSkill("chwei")) {
				list = ["蜀势力", "吴势力", "群势力"].map((i) => get.strNumber(i));
			} else if (player.hasSkill("chwu")) {
				list = ["蜀势力", "魏势力", "群势力"].map((i) => get.strNumber(i));
			} else if (player.hasSkill("chqun")) {
				list = ["蜀势力", "魏势力", "吴势力"].map((i) => get.strNumber(i));
			} else {
				list = ["蜀势力", "魏势力", "吴势力", "群势力"].map((i) => get.strNumber(i));
			}
			const result = await player.chooseControl(list).set("promote", "选择一个势力").forResult();
			if (result.control == "吴势力") {
				player.changeGroup("wu");
				player.addSkill("chwu");
			} else if (result.control == "蜀势力") {
				player.changeGroup("shu");
				player.addSkill("chshu");
			} else if (result.control == "魏势力") {
				player.changeGroup("wei");
				player.addSkill("chwei");
			} else if (result.control == "群势力") {
				player.changeGroup("qun");
				player.addSkill("chqun");
			}
			player.changeZhuanhuanji('doubleagent');
		},
		mod: {},
		mark: true,
		marktext: "☣",
		intro: {
			content: function (storage, player) {
				return '当前势力：' + get.translation(player.group);
			},
		},
	},

	dpoioned: {
		audio: "ext:搬山道士/audio/skill:2",
		unique: true,
		dutySkill: true,
		forced: true,
		locked: true,
		mark: true,
		marktext: "☢",
		intro: {
			name: "蓄力点",
			content: function (storage, player, skill) {
				return "蓄力点数量：（" + player.storage.dpoioned + "/7）";
			},
		},
		init: function (player) {
			player.storage.dpoioned = 3;
		},
		trigger: {
			global: "phaseBegin",
		},
		filter: function (event, player) {
			return event.player != player && _status.currentPhase.countCards('h');
		},
		content: async function (event, trigger, player) {
			await player.loseMaxHp(1);
			await player.draw(1);
			const compareResult = await player.chooseToCompare(trigger.player).forResult();
			if (compareResult.num1 == compareResult.num2) {
				const minc = compareResult.num1;
				if (player.countMark("dpoioned") != 7) {
					player.addMark("dpoioned");
					player.syncStorage("dpoioned");
				}
				await player.loseHp(minc);
				await trigger.player.loseHp(minc);
			}
			if (compareResult.num1 < compareResult.num2) {
				if (player.countMark("dpoioned") != 7) {
					player.addMark("dpoioned");
					player.syncStorage("dpoioned");
				}
				await player.loseHp(compareResult.num1);
			}
			if (compareResult.num1 > compareResult.num2) {
				player.removeMark("dpoioned");
				await trigger.player.loseHp(compareResult.num2);
			}
		},
		derivation: "selfbang",
		group: ["dpoioned_achieve", "dpoioned_fail"],
		subSkill: {
			achieve: {
				trigger: {
					global: "dieBegin",
				},
				forced: true,
				skillAnimation: true,
				animationColor: "metal",
				filter: function (event, player) {
					if (game.dead.length >= game.countPlayer() / 2) {
						return true;
					}
					return false;
				},
				content: async function (event, trigger, player) {
					game.log(player, '成功完成使命');
					player.awakenSkill('dpoioned');
					player.removeSkill('selfbang');
				},
				sub: true,
			},
			fail: {
				trigger: {
					player: "dying",
				},
				forced: true,
				content: async function (event, trigger, player) {
					game.log(player, '使命失败');
					player.awakenSkill('dpoioned');
					player.addSkillLog('selfbang');
					await player.die();
				},
				sub: true,
			},
		},
	},

	dqzw_fengguan: {
		subSkill: {
			effect: {
				intro: {
					content: "expansion",
					markcount: "expansion",
					onunmark: function (player) {
						if (player.hasSkill('dqzw_fengguan_effect')) player.removeSkill('dqzw_fengguan_effect')
					},
				},
				onremove: function (player, skill) {
					var cards = player.getExpansions(skill);
					if (cards.length) player.loseToDiscardpile(cards);
				},
				marktext: "棺",
				trigger: {
					player: "useCardToPlayered",
				},
				silent: true,
				filter: function (event, player) {
					if (!event.isFirstTarget) return false;
					if (event.noai) return false;
					return player.getExpansions('dqzw_fengguan_effect').length
				},
				content: async function (event, trigger, player) {
					const result = await player.chooseCardButton('获得一张"棺"', true).forResult();
					trigger.getParent().cancel();
					if (result.bool && result.links) {
						await player.gain(result.links, player, 'give');
					}
				},
				sub: true,
				forced: true,
				popup: false,
				"_priority": 1,
			},
		},
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			global: "phaseEnd",
		},
		frequent: true,
		filter: function (event, player) {
			return player.getExpansions('dqzw_fuzhen').length
		},
		content: async function (event, trigger, player) {
			const cards = player.getExpansions('dqzw_fuzhen');
			const choice = ['cancel2'];
			const bool1 = game.hasPlayer(function (c) {
				return player.canUse(get.autoViewAs({ name: 'sha' }, cards), c);
			});
			const bool2 = game.hasPlayer(function (c) {
				return !c.hasSkill('dqzw_fengguan_effect');
			});
			const list = ['将' + get.translation(cards) + '当做一张【杀】使用', '将' + get.translation(cards) + '顺序打乱然后作为"棺"置于一名没有"棺"的角色上'];
			if (bool1) choice.push('选项一');
			if (bool2) choice.push('选项二');
			const result = await player.chooseControl(choice).set('choiceList', list).set('ai', function () {
				if (bool1 && bool2) {
					if (game.hasPlayer(function (c) {
						return get.attitude(c, player) < 0 && player.canUse('sha', c);
					})) return 0;
					return 1;
				}
				if (bool1 && !bool2) return 0;
				if (bool2 && !bool1) return 1;
				return 'cancel2';
			}).forResult();
			if (result.control == 'cancel2') return;
			if (result.control == '选项一') {
				await player.chooseUseTarget({ name: 'sha' }, player.getExpansions('dqzw_fuzhen')).forResult();
				return;
			}
			if (result.control == '选项二') {
				const targetResult = await player.chooseTarget('将' + get.translation(cards) + '顺序打乱然后作为"棺"置于一名没有"棺"的角色上', lib.filter.notMe, true).set('ai', function (target) {
					return get.attitude(player, target);
				}).forResult();
				if (targetResult.bool) {
					const targetCards = player.getExpansions('dqzw_fuzhen');
					targetCards.randomSort();
					targetResult.targets[0].addToExpansion(targetCards, player, 'give').gaintag.add('dqzw_fengguan_effect');
					targetResult.targets[0].addSkill('dqzw_fengguan_effect');
				}
			}
		},
		"_priority": 0,
	},

	dqzw_fuzhen: {
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
		onremove: function (player, skill) {
			var cards = player.getExpansions(skill);
			if (cards.length) player.loseToDiscardpile(cards);
		},
		marktext: "符",
		subSkill: {
			effect: {
				onremove: true,
				trigger: {
					global: ["useCard", "respond"],
				},
				forced: true,
				mark: true,
				intro: {
					content: "其他角色每回合第一次使用或打出的$牌时你将该牌置于武将牌且你可令该牌无效",
				},
				filter: function (event, player) {
					if (event.player == player) return false
					var history = event.player.getHistory('useCard', function (evt) {
						return get.suit(evt.card) == player.storage.dqzw_fuzhen_effect;
					}).concat(event.player.getHistory('respond', function (evt) {
						return get.suit(evt.card) == player.storage.dqzw_fuzhen_effect;
					}));
					return history[0] == event;
				},
				content: async function (event, trigger, player) {
					player.addToExpansion(trigger.cards, player, 'give').gaintag.add('dqzw_fuzhen');
					const str = event.triggername == 'useCard' ? '使用' : '打出';
					const result = await player.chooseBool('是否令' + get.translation(trigger.player) + '' + str + '的' + get.translation(trigger.card) + '无效').set('ai', function () {
						if (get.attitude(_status.event.player, _status.event.trigger.player) < 0) return true;
						return false;
					}).forResult();
					if (result.bool) trigger.cancel();
				},
				sub: true,
				"_priority": 0,
			},
		},
		trigger: {
			global: "roundStart",
		},
		forced: true,
		content: async function (event, trigger, player) {
			const result = await player.chooseControl(lib.suit).set('prompt', '请选择一种花色').set('ai', function () {
				return lib.suit.randomGet();
			}).forResult();
			const suit = result.control;
			player.chat(get.translation(suit + 2));
			game.log(player, '选择了', '#y' + get.translation(suit + 2));
			player.addTempSkill(event.name + '_effect', 'roundStart');
			player.storage.dqzw_fuzhen_effect = suit;
		},
		"_priority": 0,
	},

	dqzw_xiangmo: {
		trigger: {
			source: "damageBegin",
		},
		filter: function (event, player) {
			return event.player.getExpansions('dqzw_fengguan_effect').length && player.getExpansions('dqzw_fuzhen').length
		},
		check: function (event, player) {
			return get.attitude(event.player, player) < 0
		},
		content: async function (event, trigger, player) {
			const result = await player.chooseCardButton('弃置一张"符"', player.getExpansions('dqzw_fuzhen'), true).forResult();
			if (result.bool) {
				const card = result.links[0];
				if (get.color(card) == 'black') trigger.num++;
				else trigger.nature = 'fire';
				player.loseToDiscardpile(card);
			}
		},
		"_priority": 0,
	},

	dutang233: {
		audio: "ext:搬山道士/audio/skill:8",
		trigger: {
			global: "phaseZhunbeiBegin",
		},
		filter: function (event, player) {
			return event.player != player;
		},
		subSkill: {
			mark: {
				sub: true,
				charlotte: true,
				forced: true,
				firstDo: true,
				popup: false,
				trigger: {
					player: "g_du_giveBefore",
				},
				filter: function (event, player) {
					return true;
				},
				content: async function (event, trigger, player) {
					trigger.cancel();
				},
			},
		},
		content: async function (event, trigger, player) {
			player.addMark('qianfu233', 1);
			const cards = get.cards(5);
			trigger.player.addTempSkill('dutang233_mark');
			player.addTempSkill('dutang233_mark');

			const result = await player.chooseCardButton("请选择一张牌将其替换为毒。", cards, 1)
				.set('ai', function (button) {
					if (get.attitude(player, trigger.player) >= 0) {
						return -2;
					}
					return get.value(button.link);
				}).forResult();

			if (result.bool && result.links && result.links.length) {
				for (let i = 0; i < 5; i++) {
					if (cards[i] === result.links[0]) {
						const rc = cards[i];
						cards.splice(i, 1, game.createCard('du', 'spade', 2));
						cards.remove(rc);
						await game.cardsDiscard([rc]);
						break;
					}
				}
			}

			for (let i = 4; i >= 0; i--) {
				cards[i].fix();
				ui.cardPile.insertBefore(cards[i], ui.cardPile.firstChild);
			}
		},
	},

	dxjtz_baibian: {
		audio: "ext:搬山道士/audio/skill:3",
		forced: true,
		mark: true,
		marktext: "妆",
		intro: {
			name: "百变",
			content: "card",
			onunmark: function (storage, player) {
				if (storage) {
					player.$throw(storage, 1000);
					game.cardsDiscard(storage);
					game.log(storage, '被置入了弃牌堆');
					delete player.storage.tlbb_zaojie2;
				}
			},
		},
		trigger: {
			player: ["damageEnd", "phaseZhunbeiBegin"],
			source: ["damageEnd"],
		},
		filter: function () {
			return true;
		},
		content: async function (event, trigger, player) {
			const result = await player.judge("百变", function (card) {
				return get.value(card);
			}).forResult();

			if (!result.card) {
				return;
			} else {
				let foundName = false;
				if (player.storage.dxjtz_baibian) {
					for (const card of player.storage.dxjtz_baibian) {
						if (card.name === result.card.name) {
							if (result.card.name === 'sha') {
								if (result.card.nature === card.nature) {
									foundName = true;
									break;
								}
							} else {
								foundName = true;
								break;
							}
						}
					}
				}
				if ((get.type(result.card) === 'basic' || get.type(result.card) === 'trick') && !foundName) {
					if (!player.storage.dxjtz_baibian) {
						player.storage.dxjtz_baibian = [];
					} else if (player.storage.dxjtz_baibian.length >= 4) {
						const discardCard = player.storage.dxjtz_baibian[0];
						player.storage.dxjtz_baibian.remove(discardCard);
						await game.cardsDiscard([discardCard]);
						player.$throw([discardCard], 1000);
						game.log(player, '弃置了', discardCard);
						const skills = player.getSkills();
						if (skills.length) {
							for (const sk of skills) {
								const card = player.storage.dxjtz_baibian_map[sk];
								if (card && card === discardCard) {
									player.removeSkill(sk);
									player.storage.dxjtz_baibian_map[sk] = undefined;
								}
							}
						}
					}
					player.storage.dxjtz_baibian.add(result.card);
					player.lose(result.card, ui.special, 'toStorage');
					let skillName = 'dxjtz_baibian';
					let skillNameTrans = "";
					const skillCard = result.card;
					skillName = skillName + "_" + skillCard.name;
					skillName = skillName + "_" + get.suit(skillCard);
					skillNameTrans = skillNameTrans + get.translation(skillCard);
					if (skillCard.nature) {
						skillName = skillName + "_" + skillCard.nature;
					}
					skillName = skillName + Math.floor(100000000 + Math.random() * 9999999);
					if (!player.storage.dxjtz_baibian_map) {
						player.storage.dxjtz_baibian_map = {};
					}
					player.storage.dxjtz_baibian_map[skillName] = skillCard;
					const prompt0 = function () {
						return get.translation(get.suit(skillCard)) + "牌当作" + get.translation(skillCard.name) + "使用。";
					};
					const filterCard0 = function (card) {
						return get.suit(skillCard) === get.suit(card);
					};
					const filter0 = function (event, player) {
						const sit = get.suit(skillCard);
						return player.countCards('he', { suit: sit }) > 0;
					};
					const tempSkillInfo = {
						filter: filter0,
						audio: "ext:搬山道士/audio/skill:2",
						viewAs: {
							name: skillCard.name,
						},
						position: "he",
						selectCard: 1,
						enable: ["chooseToUse", "chooseToRespond"],
						filterCard: filterCard0,
						prompt: prompt0,
						precontent: function () {
							game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'dxjtz_baibian3');

						},
						ai: get.info(skillCard).ai,
					};
					if (skillCard.name === 'tao') {
						tempSkillInfo.ai.save = true;
					}
					if (skillCard.name === 'sha') {
						tempSkillInfo.ai.respondSha = true;
					}
					if (skillCard.nature) {
						tempSkillInfo.viewAs.nature = skillCard.nature;
					}
					lib.skill[skillName] = tempSkillInfo;
					lib.translate[skillName] = skillNameTrans;
					player.addSkill(skillName);
					player.syncStorage("dxjtz_baibian");
				} else {
					await player.gain(result.card);
				}
			}
		},
	},

	dxjtz_fengyuan: {
		audio: "ext:搬山道士/audio/skill:2",
		enable: "phaseUse",
		filter: function (event, player) {
			return player.countCards('he', { color: 'black' }) > 0;
		},
		filterCard: function (card) {
			return get.color(card) == 'black';
		},
		selectCard: [1, 1],
		selectTarget: 1,
		discard: false,
		lose: false,
		position: 'he',
		filterTarget: function (card, player, target) {
			return !target.hasSkill('dxjtz_fengyuan_off') && target != player;
		},
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			const cards = event.cards;
			await target.gain(cards, player, 'giveAuto');
			target.addTempSkill('dxjtz_fengyuan_off', 'phaseUseEnd');
			await player.draw();
		},
		check: function (card) {
			return get.value(card);
		},
		subSkill: {
			off: {
				sub: true,
				mark: true,
				marktext: "源",
				intro: {
					name: "逢源",
					content: "本回合已被发动过逢源。",
				}
			}
		},
		ai: {
			order: 15,
			result: {
				player: function (player, target) {
					if (!ui.selected.cards) {
						return -3;
					}
					if (ui.selected.cards.length < 1) {
						return -3;
					}
					return 1 - get.value(ui.selected.cards[0], player);
				},
				target: function (player, target) {
					if (!ui.selected.cards) {
						return -3;
					}
					if (ui.selected.cards.length < 1) {
						return -3;
					}
					return get.value(ui.selected.cards[0], target);
				}
			}
		}
	},

	dxjtz_jugong: {
		forced: true,
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: 'damageBegin',
		},
		priority: 100,
		group: ['dxjtz_jugong_ju'],
		filter: function (event, player) {
			return event.source && event.source.hp > player.hp && player.countGainableCards(event.source, 'he') >= 2;
		},
		content: async function (event, trigger, player) {
			await trigger.source.gainPlayerCard('he', player, 2, true);
			trigger.source.line(player, 'green');
			trigger.cancel();
		},
		subSkill: {
			ju: {
				audio: "ext:搬山道士/audio/skill:3",
				forced: true,
				sub: true,
				trigger: {
					source: 'damageAfter',
				},
				filter: function (event, player) {
					if (!event.player) return false;
					if (event.player.hp >= player.hp) return false;
					if (event.player.countGainableCards('he') < 1) return false;
					return true;
				},
				content: async function (event, trigger, player) {
					await player.gainPlayerCard(1, 'he', trigger.player, true);
					player.line(trigger.player, 'green');
				}
			},
		},
	},

	dxjtz_qiaoshi: {
		audio: "ext:搬山道士/audio/skill:3",
		trigger: {
			player: "useCard",
		},
		filter: function (event, player) {
			return get.type(event.card) == 'trick' || event.card.name == 'sha';
		},
		check: function (event, player) {
			return game.hasPlayer(function (current) {
				if (!event.targets) {
					return false;
				}
				var targetsExceptCurrent = game.filterPlayer(function (cur2) {
					return cur2 != current && event.targets.contains(cur2);
				});
				if (!event.targets.contains(player)) {
					var maxDamageEffect = -1000;
					for (var i = 0; i < targetsExceptCurrent.length; i++) {
						var p = targetsExceptCurrent[i];
						var eff = get.damageEffect(current, p, player);
						if (eff > maxDamageEffect) {
							maxDamageEffect = eff;
						}
					}
					var myEffect = get.effect(player, event.card, current, player);
					if (maxDamageEffect > myEffect) {
						return true;
					}
				}
				var effUseSum = 0;
				for (var i = 0; i < targetsExceptCurrent.length; i++) {
					var p = targetsExceptCurrent[i];
					effUseSum += get.effect(p, event.card, current, player);
				}
				var effUseSumOrigin = 0;
				for (var i = 0; i < event.targets.length; i++) {
					var p = event.targets[i];
					effUseSumOrigin += get.effect(p, event.card, player, player);
				}
				return effUseSum > effUseSumOrigin;
			});
		},
		content: async function (event, trigger, player) {
			const tri = trigger;
			const firstResult = await player.chooseTarget(1, true, '请选择一名其他角色成为此牌的使用者', function (card, player, target) {
				return target != player;
			})
				.set('ai', function (target) {
					if (!tri.targets) {
						return -1;
					}
					const targetsExceptCurrent = game.filterPlayer(function (cur2) {
						return cur2 != target && tri.targets.contains(cur2);
					});
					if (!tri.targets.contains(player)) {
						let maxDamageEffect = -1000;
						for (const p of targetsExceptCurrent) {
							const eff = get.damageEffect(target, p, player);
							if (eff > maxDamageEffect) {
								maxDamageEffect = eff;
							}
						}
						const myEffect = get.effect(player, tri.card, target, player);
						if (maxDamageEffect - myEffect > 0) {
							return maxDamageEffect - myEffect;
						}
					}
					let effUseSum = 0;
					for (const p of targetsExceptCurrent) {
						effUseSum += get.effect(p, tri.card, target, player);
					}
					let effUseSumOrigin = 0;
					for (const p of tri.targets) {
						effUseSumOrigin += get.effect(p, tri.card, player, player);
					}
					return effUseSum - effUseSumOrigin;
				})
				.forResult();

			if (!firstResult.bool) {
				return;
			}

			event.cplayer = player;
			trigger.player = firstResult.targets[0];
			player.line(trigger.player, 'green');
			game.log(trigger.player, '代替', event.cplayer, '成为了', trigger.card, '的使用者。');

			if (!trigger.targets || !trigger.targets.contains(trigger.player)) {
				return;
			}

			if (!game.hasPlayer(function (current) {
				return !trigger.targets.contains(current);
			})) {
				return;
			}

			const tri2 = trigger;
			const cp = event.cplayer;
			const secondResult = await event.cplayer.chooseTarget(1, true, "请为此牌选择一个额外目标。", function (card, player, target) {
				return !tri2.targets.contains(target);
			})
				.set('ai', function (target) {
					return get.effect(target, tri2.card, tri2.player, cp);
				})
				.forResult();

			if (!secondResult.bool) {
				return;
			}

			const newTarget = secondResult.targets[0];
			trigger.targets.push(newTarget);
			trigger.targets.remove(trigger.player);
			game.log(newTarget, '替代了', trigger.player, '成为', trigger.card, '的目标。');

			if (newTarget != event.cplayer) {
				return;
			}

			const tri3 = trigger;
			const thirdResult = await event.cplayer.chooseTarget(1, true, "请选择对" + get.translation(trigger.player) + "造成伤害的角色。", function (card, player, target) {
				return tri3.targets.contains(target);
			})
				.set('ai', function (target) {
					return get.damageEffect(tri3.player, target, cp);
				})
				.forResult();

			if (thirdResult.bool) {
				await trigger.player.damage(1, thirdResult.targets[0]);
				event.cplayer.line(thirdResult.targets[0], 'green');
				thirdResult.targets[0].line(trigger.player, 'green');
			}
		},
	},

	dxjtz_qingbao: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			global: "judgeBegin",
		},
		check: function () {
			return true;
		},
		filter: function (event, player) {
			return !player.hasSkill('dxjtz_qingbao_off');
		},
		content: async function (event, trigger, player) {
			await player.draw(2);

			const result = await player.chooseCard('he', "请将一张牌放在牌堆顶", true)
				.set('ai', function (card) {
					const result = trigger.judge(card);
					const attitude = get.attitude(event.target, trigger.player);
					if (attitude === 0) return -get.value(card);
					if (attitude > 0) {
						return (30 - get.value(card)) * result;
					} else {
						return (30 - get.value(card)) * (-result);
					}
				})
				.forResult();

			if (result.bool) {
				const card = result.cards[0];
				player.lose(card, ui.special);
				game.log(player, '将', card, '置于牌堆顶');
				ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
				player.addTempSkill('dxjtz_qingbao_off');
			}
		},
		subSkill: {
			off: {
				sub: true,
			}
		},
		ai: {
			expose: 0.1,
			tag: {
				rejudge: 0.6,
			},
		},
	},

	dxjtz_shenqiang: {
		audio: "ext:搬山道士/audio/skill:3",
		trigger: {
			player: "shaBegin",
		},
		check: function (event, player) {
			return get.attitude(player, event.target) < 0;
		},
		filter: function (event, player) {
			return event.target && get.distance(player, event.target) >= player.hp;
		},
		content: async function (event, trigger, player) {
			trigger.directHit = true;
			player.line(trigger.target, 'green');
		}
	},

	dxjtz_shili: {
		usable: 1,
		enable: "phaseUse",
		audio: "ext:搬山道士/audio/skill:3",
		group: ['dxjtz_shili_damage'],
		check: function (event, player) {
			return true;
		},
		ai: {
			order: 10,
			result: {
				player: function () {
					return 3;
				},
			}
		},
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return current.getCards('h') > player.getCards('h');
			});
		},
		content: async function (event, trigger, player) {
			const maxHandPlayers = game.filterPlayer(function (current) {
				return !game.hasPlayer(function (cur) {
					return cur.getCards('h') > current.getCards('h');
				});
			});
			if (maxHandPlayers.length) {
				const num = maxHandPlayers[0].countCards('h');
				await player.draw(num - player.countCards('h'));
				const originMarks = game.filterPlayer(function (current) {
					return current.hasSkill('dxjtz_shili_mark');
				});
				if (originMarks.length) {
					for (const markPlayer of originMarks) {
						markPlayer.removeSkill('dxjtz_shili_mark');
					}
				}
				for (const maxHandPlayer of maxHandPlayers) {
					maxHandPlayer.addSkill('dxjtz_shili_mark');
				}
			}
		},
		subSkill: {
			mark: {
				sub: true,
				mark: true,
				marktext: "势",
				intro: {
					name: "势利",
					content: "你对贾贵造成的伤害+1。",
				},
			},
			damage: {
				sub: true,
				priority: 120,
				trigger: {
					player: 'damageBegin',
				},
				forced: true,
				filter: function (event, player) {
					return event.source && event.source.hasSkill('dxjtz_shili_mark');
				},
				content: async function (event, trigger, player) {
					player.say(["好汉，好汉饶命！", "八路爷爷，我贾贵给您陪不是了！"].randomGet());
					trigger.num++;
				}
			},
		},
	},
	hyxc_duozi: {
		trigger: {
			player: "loseEnd",
		},
		audio: "ext:搬山道士/audio/skill:4",
		check: function (event, player) {
			return player.hp > 2 && event.cards && event.cards.length >= game.countPlayer(function (current) { return get.attitude(player, current) <= 0; });
		},
		filter: function (event, player) {
			if (!event.cards) return false;
			if (event.cards.length == 0) return false;
			let hasHandcard = false;
			for (let i = 0; i < event.cards.length; i++) {
				if (event.cards[i].original == 'h') {
					hasHandcard = true;
					break;
				}
			}
			if (!hasHandcard) {
				return false;
			}
			if (player.countCards('h')) {
				return false;
			}
			return true;
		},
		content: async function (event, trigger, player) {
			let hcount = 0;
			for (let i = 0; i < trigger.cards.length; i++) {
				if (trigger.cards[i].original == 'h') {
					hcount = hcount + 1;
				}
			}
			const result = await player.chooseTarget([0, hcount], true, "请选择最多" + hcount + "名角色各获得他们一张牌", function (card, player, target) {
				return target != player && target.countGainableCards(player, 'he') > 0;
			}).set('ai', function (current) {
				return -get.attitude(player, current);
			}).forResult();
			if (result.targets && result.targets.length) {
				result.targets.sortBySeat();
				for (let i = 0; i < result.targets.length; i++) {
					await player.gainPlayerCard('he', result.targets[i], true);
					player.line(result.targets[i], 'green');
				}
			}
			await player.loseHp();
		},
	},

	hyxc_liangjian: {
		trigger: {
			player: "damageEnd",
		},
		audio: "ext:搬山道士/audio/skill:5",
		forced: true,
		filter: function (event, player) {
			return event.source && event.source != player;
		},
		content: async function (event, trigger, player) {
			await player.draw(2);
			await player.useCard({ name: 'juedou' }, trigger.source);
		},
	},

	hyxc_mazhen: {
		audio: "ext:搬山道士/audio/skill:2",
		usable: 3,
		enable: 'phaseUse',
		selectTarget: 1,
		filterTarget: function (card, player, target) {
			return player.canCompare(target);
		},
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return player.canCompare(current);
			});
		},
		content: async function (event, trigger, player) {
			const compareResult = await player.chooseToCompare(target).forResult();
			if (compareResult.bool && target.countCards('he')) {
				const cardResult = await target.chooseCard(true, 'he', function (card) {
					return true;
				}).set('ai', function (card) {
					return -get.value(card);
				}).forResult();
				if (cardResult && cardResult.cards && cardResult.cards.length) {
					target.give(cardResult.cards, player);
				}
			}
		},
		ai: {
			order: 22,
			result: {
				target: -2,
			}
		}
	},

	hyxc_paoxi: {
		enable: "phaseUse",
		usable: 3,
		audio: "ext:搬山道士/audio/skill:1",
		selectTarget: 1,
		filterTarget: function (card, player, target) {
			if (target == player) return false;
			if (!game.hasPlayer(function (current) {
				return get.distance(player, current) > get.distance(player, target);
			})) {
				return true;
			}
			if (!game.hasPlayer(function (current) {
				return current.hp > target.hp;
			})) {
				return true;
			}
			return false;
		},
		filter: function (event, player) {
			return player.countCards('h') && player.countDiscardableCards(player, 'h') == player.countCards('h');
		},
		content: async function (event, trigger, player) {
			await player.chooseToDiscard('h', player.countDiscardableCards(player, 'h'), true).forResult();
			const result = await target.judge("炮袭", function (card) {
				if (get.suit(card) == 'heart') {
					return -4;
				}
				return 0;
			}).forResult();
			if (result.bool === false) {
				target.damage('fire', 2, player);
			} else {
				target.damage('fire', 1, player);
			}
		},
		ai: {
			order: 6,
			result: {
				player: function (player, target) {
					return -player.countCards('h') + 2;
				},
				target: -5,
			}
		}
	},

	melonscalesgacheng: {
		mark: true,
		locked: false,
		zhuanhuanji: true,
		marktext: "↕∆",
		intro: {
			content: function (storage, player, skill) {
				if (player.storage.melonscalesgacheng == true) return '【阳】：将' + (player.countMark("melonstallgatan") + 1) + '张牌置于牌堆底，摸一张牌';
				return '【阴】：将1张牌置于牌堆底，摸' + (player.countMark("melonstallgatan") + 1) + '张牌';
			},
		},
		enable: "phaseUse",
		audio: "ext:搬山道士/audio/skill:2",
		init: function (player) {
			player.storage.melonscalesgacheng = false;
		},
		filter: function (event, player) {
			if (player.countCards('he') <= player.countMark("melonstallgatan") && player.storage.melonscalesgacheng == true) { return false };
			if (player.countCards('he') <= 1 && !player.storage.melonscalesgacheng == true) { return false };
			const num = player.countMark("melonstallgatan");
			if ((player.getStat().skill.melonscalesgacheng || 0) >= num) return false;
			return true;
		},
		content: async function (event, trigger, player) {
			player.logSkill("melonsellersgacheng");
			await player.loseHp();
			let cardResult;
			if (!player.storage.melonscalesgacheng == true) {
				cardResult = await player.chooseCard('将一张牌置于牌堆底', "he", 1, true).set("ai", function (card) {
					return get.value(card);
				}).forResult();
			}
			if (player.storage.melonscalesgacheng == true) {
				cardResult = await player.chooseCard('将' + player.countMark("melonstallgatan") + '张牌置于牌堆底', "he", player.countMark("melonstallgatan"), true).set("ai", function (card) {
					return get.value(card);
				}).forResult();
			}
			for (const i of cardResult.cards) {
				i.fix();
				ui.cardPile.appendChild(i);
			}
			if (!player.storage.melonscalesgacheng == true) {
				await player.draw(player.countMark("melonstallgatan"));
				player.changeZhuanhuanji('melonscalesgacheng');
			} else if (player.countCards('he') >= player.countMark("melonstallgatan") && player.storage.melonscalesgacheng == true) {
				await player.draw(1);
				player.changeZhuanhuanji('melonscalesgacheng');
			}
		},
	},

	melonsellersfanga: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "useCardAfter",
		},
		forced: true,
		locked: true,
		filter: function (event, player) {
			if (player.countMark("melonstallgatan") == 0) return false;
			if (event.parent.name == 'melonsellersfanga') return false;
			if (!event.targets || !event.card) return false;
			if (event.card && event.card.name == 'wuxie') return false;
			var type = get.type(event.card);
			if (type != 'trick') return false;
			var card = game.createCard(event.card.name, event.card.suit, event.card.number);
			var targets = event._targets || event.targets;
			for (var i = 0; i < event.targets.length; i++) {
				if (!event.targets[i].isAlive()) return false;
				if (!targets[i].isIn()) return false;
				if (!player.canUse({ name: event.card.name }, event.targets[i], false, false)) {
					return false;
				}
			}
			return true;
		},
		content: function (trigger, player, event) {
			player.logSkill("melonsellersfanga");
			var cm = player.countMark("melonstallgatan");
			var targets = trigger._targets || trigger.targets;
			var card = game.createCard(trigger.card.name, trigger.card.suit, trigger.card.number, trigger.card.nature);
			for (var i = 0; i < cm; i++) {
				if (!targets[0].isIn()) { break; }
				if (!trigger.targets[0].isAlive()) { break; }
				if (!player.canUse({ name: trigger.card.name }, trigger.targets[0], false, false)) {
					break;
				}
				player.useCard(card, (trigger._targets || trigger.targets).slice(0));
			}
		},
	},

	melonstallgatan: {
		audio: "ext:搬山道士/audio/skill:2",
		marktext: "瓜",
		locked: true,
		forced: true,
		unique: true,
		trigger: {
			player: "phaseBegin",
		},
		filter: function (event, player) {
			return true;
		},
		content: async function (event, trigger, player) {
			const gamarkmax = 4;
			for (let i = 0; i < player.getDamagedHp(); i++) {
				if (player.countMark("melonstallgatan") != gamarkmax) {
					player.addMark("melonstallgatan");
					player.syncStorage("melonstallgatan");
				}
			}
		},
		intro: {
			name: "瓜标记",
			content: function (storage, player, skill) {
				return "你使用的普通锦囊牌额外结算" + player.countMark("melonstallgatan") + "次";
			},
		},
		group: ["melonstallgatan_1", "melonstallgatan_2"],
		subSkill: {
			"1": {
				audio: 2,
				locked: true,
				forced: true,
				trigger: {
					player: "loseHpBegin",
				},
				content: async function (event, trigger, player) {
					player.logSkill("melonstallgatan_1");
					const gamarkmax = 4;
					await player.draw(trigger.num);
					for (let i = 0; i < trigger.num; i++) {
						if (player.countMark("melonstallgatan") != gamarkmax) {
							player.addMark("melonstallgatan");
							player.syncStorage("melonstallgatan");
						}
					}
				},
				sub: true,
			},
			"2": {
				audio: 2,
				locked: true,
				forced: true,
				trigger: {
					player: "phaseEnd",
				},
				filter: function (event, player) {
					return player.countMark("melonstallgatan") > 0;
				},
				content: async function (event, trigger, player) {
					player.logSkill("melonstallgatan_2");
					await player.loseHp(player.countMark("melonstallgatan"));
				},
				sub: true,
			},
		},
	},

	qianfu233: {
		audio: "ext:搬山道士/audio/skill:2",
		marktext: "暴",
		unique: true,
		trigger: {
			player: "phaseBefore",
		},
		forced: true,
		content: async function (event, trigger, player) {
			player.addMark('qianfu233', trigger.name === 'damage' ? trigger.num : 1);
		},
		intro: {
			name: "暴露",
			content: "mark",
		},
		group: ["qianfu233_1"],
		subSkill: {
			"1": {
				audio: "ext:搬山道士/audio/skill:1",
				trigger: {
					player: "phaseBefore",
				},
				frequent: true,
				filter: function (event, player) {
					return player.countMark('qianfu233') >= 16;
				},
				content: async function (event, trigger, player) {
					player.loseMaxHp(3);
					await player.draw();
					await game.me.gain(game.createCard({ name: 'du' }));
					await game.me.gain(game.createCard({ name: 'du' }));
					await game.me.gain(game.createCard({ name: 'du' }));
					await game.me.gain(game.createCard({ name: 'du' }));
					player.removeSkill('qianfu233');
					player.removeSkill('dutang233');
				},
				sub: true,
			},
		},
	},

	selfbang: {
		audio: "ext:搬山道士/audio/skill:2",
		forced: true,
		locked: true,
		trigger: {
			player: "dieBegin",
		},
		filter: function (event, player) {
			return true;
		},
		content: async function (event, trigger, player) {
			const macks = player.countMark("dpoioned");
			for (const i of game.players) {
				await i.damage(macks, "fire");
			}
		},
	},


	th_jinjing: {
		trigger: {
			global: "phaseBefore",
		},
		silent: true,
		locked: true,
		direct: true,
		filter: function (event, player) {
			return game.hasPlayer((c) => c != player && !c.hasSkill('th_jinjing2')) && lib.config.extensions && lib.config.extensions.contains('手杀ui') && lib.config['extension_手杀ui_enable'];
		},
		content: function () {
			game.countPlayer(function (current) {
				if (!current.hasSkill('th_jinjing2') || current != player) current.addSkill('th_jinjing2');
			})
		},
		ai: {
			viewHandcard: true,
			skillTagFilter: function (player, tag, arg) {
				if (player == arg) return false;
			},
		},
	},
	th_jinjing2: {
		charlotte: true,
		mark: true,
		locked: true,
		marktext: "金睛",
		intro: {
			name: "金睛",
			mark: function (dialog, content, player) {
				if (player.hasSkill('th_cibei_cancel')) dialog.addText('我佛慈悲，本回合不能再对' + get.translation(player) + '发动【慈悲】');
				var cards = player.getCards('h');
				if (game.me.hasSkillTag('viewHandcard', true, player)) {
					if (cards && cards.length) {
						dialog.addText('手牌区');
						dialog.addSmall(cards);
					}
				} else dialog.addText('你没有火眼金睛哦');
			},
		},
	},
	th_cibei: {
		trigger: {
			source: "damageBegin2",
		},
		filter: function (event, player) {
			return !event.player.hasSkill('th_cibei_cancel');
		},
		check: function (event, player) {
			if (get.damageEffect(event.player, player, player) < 0) return true;
			if (get.attitude(player, event.player) > 0) return true;
			var att = get.attitude(player, event.player);
			if (att > 0) return true;
			if (event.num > 1) {
				if (att < 0) return false;
				if (att > 0) return true;
			}
			return false;
		},
		content: function () {
			trigger.player.addTempSkill('th_cibei_cancel');
			trigger.cancel();
			player.draw(5);
		},
		subSkill: {
			cancel: { charlotte: true, },
		},
	},
	th_ruyi: {
		trigger: {
			global: "phaseBefore",
			player: ["enterGame", "loseBefore", "equipBefore", "disableEquipBefore"],
		},
		filter: function (event, player) {
			if (event.name == 'lose') {
				while (event.cards) {
					for (var i = 0; i < event.cards.length; i++) {
						if (event.cards[i].name == 'th_ruyijingubang') {
							event.cards.splice(i--, 1);
						}
					}
					if (event.getParent) event = event.getParent();
					else break;
				}
			}
			else if (event.name == 'equip') return get.subtype(event.card) == 'equip1' && event.card.name != 'th_ruyijingubang';
			else if (event.name == 'disableEquip') return player.getEquip('th_ruyijingubang') && event.pos == 'equip1';
			else if (['phase', 'enterGame'].contains(event.name)) return game.phaseNumber == 0;
			return false;
		},
		content: function () {
			if (trigger.name == 'phase' || trigger.name == 'enterGame') {
				if (!lib.inpile.contains('th_ruyijingubang')) {
					lib.inpile.push('th_ruyijingubang');
					player.equip(game.createCard('th_ruyijingubang', 'heart', 9));
				}
				else {
					var card = get.cardPile(function (card) {
						return card.name == 'th_ruyijingubang';
					}, 'field');
					if (card) player.equip(card);
				}
			} else {
				if (trigger.name == 'equip' && trigger.card) player.gain(trigger.card, 'gain2');
				trigger.cancel();
			}
		},
		locked: true,
		direct: true,
		unique: true,
		mod: {
			canBeDiscarded: function (card) {
				if (get.position(card) == 'e' && card.name == 'th_ruyijingubang') return false;
			},
			canBeGained: function (card) {
				if (get.position(card) == 'e' && card.name == 'th_ruyijingubang') return false;
			},
			cardDiscardable: function (card) {
				if (get.position(card) == 'e' && card.name == 'th_ruyijingubang') return false;
			},
			cardEnabled: function (card) {
				if (get.itemtype(card) == 'card' && get.position(card) == 'e' && card.name == 'th_ruyijingubang') return false;
			},
			"cardEnabled2": function (card) {
				if (get.itemtype(card) == 'card' && get.position(card) == 'e' && card.name == 'th_ruyijingubang') return false;
			},
			cardname: function (card) {
				if (card.name == 'th_ruyijingubang') return;
				if (lib.card[card.name].subtype == 'equip1') return 'sha';
			},
		},
	},

	fengyuan: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			global: "recoverEnd",
		},
		filter: function (event, player) {
			return event.player.sex == 'female' && event.num > 0;
		},
		content: async function (event, trigger, player) {
			if (player.hp < player.maxHp) {
				player.recover();
				game.log(player, '发动', '【逢源】', '回复1点体力');
			} else {
				player.draw();
				game.log(player, '发动', '【逢源】', '摸了1张牌');
			}
		},
	},

	haodu: {
		audio: "ext:搬山道士/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		content: async function (event, trigger, player) {
			const result = await player.chooseBool('是否押大（8~K）？').set('ai', function () {
				return true;
			}).forResult();
			if (result.bool) {
				// 押大逻辑
				player.logSkill('豪赌', '押大');
				// 实际逻辑需要根据原代码实现
			} else {
				// 押小逻辑
				player.logSkill('豪赌', '押小');
				// 实际逻辑需要根据原代码实现
			}
		},
	},

	yidao228: {
		trigger: {
			player: "shaBegin",
		},
		audio: "ext:搬山道士/audio/skill:3",
		forced: true,
		content: async function (event, trigger, player) {
			trigger.directHit = true;
		},
		group: ["yidao228_1"],
		subSkill: {
			"1": {
				trigger: {
					source: "damageBegin",
				},
				forced: true,
				unique: true,
				filter: function (event, player) {
					return event.card.name == 'sha';
				},
				content: async function (event, trigger, player) {
					trigger.num++;
				},
				sub: true,
			},
		},
	},

	yingbian: {
		audio: "yingbian_1",
		mark: true,
		locked: false,
		forced: true,
		zhuanhuanji: true,
		marktext: "☯",
		intro: {
			content: function (storage, player, skill) {
				if (player.storage.yingbian == true) return '【阴】：若你没有【闪】，防止此伤害';
				return '【阳】：若你没有【杀】，防止此伤害';
			},
		},
		group: ["yingbian_1", "yingbian_2"],
		subSkill: {
			"1": {
				audio: "2",
				forced: true,
				trigger: {
					player: "damageBegin4",
				},
				filter: function (event, player) {
					return !player.countCards('h', 'sha') && !player.storage.yingbian;
				},
				content: async function (event, trigger, player) {
					const boolResult = await player.chooseBool(get.prompt("yingbian"), "是否发动\"应变【阳】\"，制衡所有手牌，免疫此次伤害").forResultBool();
					const cc = player.countCards('h');
					if (boolResult) {
						player.logSkill("yingbian_1");
						await player.chooseToDiscard(player.countCards('h'), true);
						await player.draw(cc);
						trigger.cancel();
						player.changeZhuanhuanji('yingbian');
					}
				},
				sub: true,
			},
			"2": {
				audio: 2,
				forced: true,
				trigger: {
					player: "damageBegin4",
				},
				filter: function (event, player) {
					return !player.countCards('h', 'shan') && player.storage.yingbian == true;
				},
				content: async function (event, trigger, player) {
					const boolResult = await player.chooseBool(get.prompt("yingbian"), "是否发动\"应变【阴】\"，制衡所有手牌，免疫此次伤害").forResultBool();
					const cc = player.countCards('h');
					if (boolResult) {
						player.logSkill("yingbian_2");
						await player.chooseToDiscard(player.countCards('h'), true);
						await player.draw(cc);
						trigger.cancel();
						player.changeZhuanhuanji('yingbian');
					}
				},
				sub: true,
			},
		},
	},

	zhaocha3399: {
		audio: "ext:搬山道士/audio/skill:4",
		enable: "phaseUse",
		usable: 1,
		unique: true,
		filterCard: true,
		discard: false,
		prepare: "give",
		position: "h",
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		filterTarget: function (card, player, target) {
			return player != target;
		},
		check: function (card) {
			return 6 - ai.get.value(card);
		},
		content: async function (event, trigger, player) {
			const target = event.target;  // 修正：获取目标
			const cards = event.cards;    // 修正：获取选择的牌
			player.showCards(cards[0]);
			await target.gain(cards[0], player);

			const damageEffect = Math.max(...game.filterPlayer(c => c != player).map(c => get.damageEffect(c, target, target)));
			const result = await target.chooseCard('交给' + get.translation(player) + '一张大于' + get.number(cards[0]) + '的牌然后弃置一张牌或者对' + get.translation(player) + '以外的一名角色造成1点伤害', function (card) {
				return get.number(card) > 13;
			}).set('ai', function (card) {
				return -damageEffect - get.value(card);
			}).forResult();

			if (result.bool) {
				await target.give(result.cards, player);
				await target.chooseToDiscard('he', true).forResult();
			} else {
				target.addSkill('zhaocha3400');
				await target.chooseToDiscard('h', true).forResult();
			}
		},
		ai: {
			order: 6,
			result: {
				target: function (player, target) {
					return ai.get.attitude(player, target);
				},
				player: -1,
			},
		},
	},
	zhaocha3400: {
		audio: "ext:搬山道士:3",
		trigger: {
			player: "loseBegin",
		},
		frequent: true,
		content: function () {
			player.removeSkill('zhaocha3400');
		},
	},
};

export default skill;
