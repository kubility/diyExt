import { lib, game, ui, get, ai, _status } from "../../main/utils.js";

/** @type { importCardConfig['skill'] } */
const skill = {
	// 如意金箍棒技能
	//活动武将作者萌新转型中的源代码，侵删
	th_ruyijingubang: {
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.getEquip('th_ruyijingubang');
		},
		content: function () {
			'step 0'
			var card = player.getEquip('th_ruyijingubang');
			player.chooseControl('1', '2', '3', '4', 'cancel2').set('prompt', '是否调整' + (card ? get.translation(card) : '如意金箍棒') + '的攻击范围？').set('choiceList', [
				'将' + (card ? get.translation(card) : '如意金箍棒') + '的攻击范围调整为1 → 你使用【杀】不计入次数限制',
				'将' + (card ? get.translation(card) : '如意金箍棒') + '的攻击范围调整为2 → 你使用【杀】伤害+1',
				'将' + (card ? get.translation(card) : '如意金箍棒') + '的攻击范围调整为3 → 你使用【杀】无法被响应',
				'将' + (card ? get.translation(card) : '如意金箍棒') + '的攻击范围调整为4 → 你使用【杀】可以额外指定一个目标'
			]).set('ai', function () {
				var player = _status.event.player;
				if (!player.hasSha()) return '4';
				for (var i = 0; i <= 3; i++) {
					_status.th_ruyiCheck = [2, 1, 3, 4][i];
					if (game.hasPlayer(function (current) {
						return player.canUse({ name: 'sha' }, current) && get.effect(current, { name: 'sha' }, player, player) > 0;
					})) {
						delete _status.th_ruyiCheck;
						return i + 1;
					}
				}
				if (_status.th_ruyiCheck) delete _status.th_ruyiCheck;
				return '4';
			});
			'step 1'
			if (result.control != 'cancel2') {
				var num = parseInt(result.control), card = player.getEquip('th_ruyijingubang');
				player.logSkill('th_ruyijingubang');
				player.storage.th_ruyijingubang = num;
				player.popup(num);
				game.log(player, '将', '#g' + (card ? get.translation(card) : '如意金箍棒'), '的攻击范围调整为', '#y' + num);
			}
		},
		group: ["th_ruyijingubang2"],
		init: function (player) {
			if (!player.storage.th_ruyijingubang) player.storage.th_ruyijingubang = 3;
		},
		onremove: true,
		mod: {
			attackRange: function (player, num) {
				if ((player.getEquip(1) && !player.getEquip('th_ruyijingubang')) || player.isDisabled(1)) return;
				if (_status.th_ruyiCheck) return num + _status.th_ruyiCheck - 1;
				return num + player.storage.th_ruyijingubang - 1;
			},
		},
	},
	th_ruyijingubang2: {
		mod: {
			selectTarget: function (card, player, range) {
				if ((player.getEquip(1) && !player.getEquip('th_ruyijingubang')) || player.isDisabled(1)) return;
				var num = player.storage.th_ruyijingubang;
				if (card.name == 'sha' && range[1] != -1 && num == 4) range[1]++;
			},
		},
		equipSkill: true,
		trigger: {
			player: 'useCard',
		},
		filter: function (event, player) {
			var num = player.storage.th_ruyijingubang;
			if (event.card.name != 'sha' || player.isDisabled(1)) return false;
			if (player.getEquip(1) && !player.getEquip('th_ruyijingubang')) return false;
			return num != 4;
		},
		forced: true,
		locked: false,
		content: function () {
			var num = player.storage.th_ruyijingubang;
			switch (num) {
				case 1:
					trigger.addCount = false;
					if (player.stat[player.stat.length - 1].card.sha > 0) player.stat[player.stat.length - 1].card.sha--;
					game.log(trigger.card, '不计入次数');
					break;
				case 2:
					trigger.baseDamage++;
					game.log(trigger.card, '造成的伤害+1');
					break;
				case 3:
					trigger.directHit.addArray(game.players);
					game.log(trigger.card, '不可被响应');
					break;
			}
		},
		ai: {
			directHit_ai: true,
			skillTagFilter: function (player, tag, arg) {
				if (player.isDisabled(1) || (player.getEquip(1) && !player.getEquip('th_ruyijingubang'))) return false;
				return arg.card.name == 'sha' && ((_status.th_ruyiCheck && _status.th_ruyiCheck == 3) || player.storage.th_ruyijingubang == 3);
			},
		},
	},
	// 高达宝具牌技能
	qijinqichu_skill: {
		audio: "chongzhen1",
		equipSkill: true,
		forced: true,
		group: ["chongzhen1", "chongzhen2"],
		trigger: {
			player: "loseAfter",
			global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		filter: function (event, player) {
			if (event.name == 'gain' && event.player == player) return player.countCards('h') > 7;
			var evt = event.getl(player);
			if (!evt || !evt.hs || evt.hs.length == 0 || player.countCards('h') >= 7) return false;
			var evt = event;
			for (var i = 0; i < 7; i++) {
				evt = evt.getParent('qijinqichu');
				if (evt.name != 'qijinqichu') return true;
			}
			return false;
		},
		content: async function (event, trigger, player) {
			var num = 7 - player.countCards('h');
			if (num > 0) await player.draw(num);
			else await player.chooseToDiscard('h', true, -num);
		},
	},

	paoxiaozhendan_skill: {
		locked: true,
		unique: true,
		audio: "paoxiao",
		audioname: ["re_zhangfei", "guanzhang", "xiahouba"],
		equipSkill: true,
		trigger: {
			player: "shaMiss",
		},
		forced: true,
		content: async function (event, trigger, player) {
			player.addTempSkill('olpaoxiao2');
			player.addMark('olpaoxiao2', 1, false);
		},
		mod: {
			cardUsable: function (card, player, num) {
				if (card.name == 'sha') return Infinity;
			},
		},
	},

	mengjiangzhilie_skill: {
		locked: true,
		forced: true,
		equipSkill: true,
		audio: "drlt_wanglie",
		trigger: {
			player: "useCard",
		},
		filter: function (event, player) {
			return player.isPhaseUsing() && (event.card.name == 'sha' || get.type(event.card) == 'trick');
		},
		check: function (trigger, player) {
			return true;
		},
		content: async function (event, trigger, player) {
			trigger.nowuxie = true;
			trigger.directHit.addArray(game.players);
		},
	},

	bawanghunzi_skill: {
		locked: true,
		forced: true,
		equipSkill: true,
		audio: ["hunzi", 2],
		trigger: {
			player: "dying",
		},
		content: async function (event, trigger, player) {
			player.gainMaxHp();
			player.recover(2 - player.hp);
			player.discard(player.getCards('hej'));
			player.link(false);
			await player.draw(player.maxHp);
			player.turnOver(false);
		},
	},

	xingluanfangong_skill: {
		fixed: true,
		audio: "xinfu_xingluan",
		equipSkill: true,
		trigger: {
			target: "useCardToAfter",
		},
		direct: true,
		content: async function (event, trigger, player) {
			await player.draw();
			if (trigger.player != player) {
				const result = await player.chooseBool("是否发动兴乱反攻，对" + get.translation(trigger.player) + "使用一张【杀】？").forResult();
				if (result.bool) {
					const card = game.createCard('sha');
					await player.useCard(card, [trigger.player]);
				}
			}
		},
	},

	shibaocichou_skill: {
		audio: "fuzhu",
		equipSkill: true,
		trigger: {
			global: "phaseEnd",
		},
		filter: function (event, player) {
			return player != event.player && event.player.isAlive();
		},
		check: function (event, player) {
			return get.attitude(player, event.player) < 0 && get.effect(event.player, { name: 'sha' }, player, player) > 0;
		},
		content: async function (event, trigger, player) {
			event.washed = false;
			lib.onwash.push(lib.skill.fuzhu.onWash);
			event.total = game.players.length + game.dead.length;
			event.total--;
			var card = get.cardPile2(function (card) {
				return card.name == 'sha' && player.canUse(card, trigger.player, false);
			});
			if (card) {
				card.remove();
				game.updateRoundNumber();
				await player.useCard(card, [trigger.player], false);
			}
		},
		ai: {
			threaten: 3,
		},
	},

	piguashangzhen_skill: {
		audio: "kuangfu",
		equipSkill: true,
		forced: true,
		trigger: {
			player: "useCardToPlayered",
			target: "useCardToTargeted",
		},
		filter: function (event, player) {
			if (!(event.card.name == 'sha')) return false;
			return player == event.target || event.getParent().triggeredTargets3.length == 1;
		},
		content: async function (event, trigger, player) {
			var card = get.cardPile(function (card) {
				return get.type(card, 'equip') == 'equip';
			});
			if (card) {
				await player.gain(card, 'gain2');
			}
		},
	},

	kuaimatuxi_skill: {
		equipSkill: true,
		forced: true,
		trigger: {
			player: "phaseDrawBegin",
		},
		audio: ["tuxi", 2],
		direct: true,
		fixed: true,
		filter: function (event, player) {
			return !event.player.isMad();
		},
		content: async function (event, trigger, player) {
			var check;
			var num = game.countPlayer(function (current) {
				return current != player && current.countCards('he') && get.attitude(player, current) <= 0;
			});
			check = (num >= 1);
			const result = await player.chooseTarget(get.prompt('gd9_tuxi'), [1, Infinity], function (card, player, target) {
				return target.countCards('he') > 0 && player != target;
			}, function (target) {
				if (!_status.event.aicheck) return 0;
				var att = get.attitude(_status.event.player, target);
				if (target.hasSkill('tuntian')) return att / 10;
				return 1 - att;
			}).set('aicheck', check).forResult();
			if (result.bool) {
				player.logSkill('gd9_tuxi', result.targets);
				player.gainMultiple(result.targets, 'he');
			}
			else {
				event.finish();
			}
			game.delay();
		},
		ai: {
			threaten: 10,
			expose: 1.3,
		},
	},

	qizuozhicai_skill: {
		equipSkill: true,
		audio: "reyiji",
		trigger: {
			global: ["damageEnd", "loseHpEnd"],
		},
		content: async function (event, trigger, player) {
			const result = await player.chooseTarget(get.prompt2('qizuozhicai_skill')).set('ai', function (target) {
				var player = _status.event.player;
				if (get.attitude(player, target) > 0) {
					return get.recoverEffect(target, player, player) + 1;
				}
				return 0;
			}).forResult();
			if (result.bool) {
				var target = result.targets[0];
				event.target = target;
				const judgeResult = await target.judge(function (card) {
					if (get.color(card) == 'red') return true;
					return false;
				}).forResult();
				if (judgeResult.bool) {
					if (target.hp == target.maxHp) {
						target.gainMaxHp();
					}
					if (target.hp < target.maxHp) {
						target.recover();
					}
				}
			}
		},
		ai: {
			maixie: true,
			"maixie_hp": true,
		},
	},

	kuangcaishejian_skill: {
		equipSkill: true,
		enable: "phaseUse",
		usable: 1,
		audio: "kuangcai",
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		content: async function (event, trigger, player) {
			player.discard(player.getCards('h'));
			event.targets = game.filterPlayer();
			event.targets.remove(player);
			event.targets.sort(lib.sort.seat);
			event.targets2 = event.targets.slice(0);
			player.line(event.targets, 'red');
			for (const target of event.targets2) {
				await target.damage('nocard');
			}
		},
		ai: {
			order: 11,
			result: {
				target: -1.5,
			},
			tag: {
				damage: 1,
			},
		},
	},

	weiyangmoji_skill: {
		equipSkill: true,
		audio: "lianzhu",
		mod: {
			ignoredHandcard: function (card, player) {
				if (get.color(card) == 'black') {
					return true;
				}
			},
			cardDiscardable: function (card, player, name) {
				if (name == 'phaseDiscard' && get.color(card) == 'black') return false;
			},
		},
		forced: true,
		trigger: {
			player: "damageBegin",
		},
		filter: function (event, player) {
			return event.card && event.card.color == 'black';
		},
		ai: {
			nodamage: true,
			effect: {
				target: function (card, player, target, current) {
					if (get.tag(card, 'damage')) return [0, 0];
				},
			},
		},
		content: async function (event, trigger, player) {
			trigger.cancel();
			player.update();
		},
	},

	tianxiaguixin_skill: {
		forced: false,
		locked: true,
		equipSkill: true,
		audio: "guixin",
		trigger: {
			player: ["damageEnd", "loseHpEnd"],
		},
		check: function (event, player) {
			if (event.num > 1) return true;
			var num = game.countPlayer(function (current) {
				if (current.countCards('he') && current != player && get.attitude(player, current) <= 0) {
					return true;
				}
				if (current.countCards('j') && current != player && get.attitude(player, current) > 0) {
					return true;
				}
			});
			return num >= 2;
		},
		content: async function (event, trigger, player) {
			player.revive();
			var targets = game.filterPlayer();
			targets.remove(player);
			targets.sort(lib.sort.seat);
			event.targets = targets;
			event.count = trigger.num;
			event.num = 0;
			player.line(targets, 'green');
			for (const target of event.targets) {
				if (!get.is.altered('tianxiaguixin_skill')) {
					if (target.countGainableCards(player, 'hej')) {
						await player.gainPlayerCard(target, true, 'hej');
					}
				}
				else {
					var hej = target.getCards('hej');
					if (hej.length) {
						var card = hej.randomGet();
						await player.gain(card, target);
						if (get.position(card) == 'h') {
							target.$giveAuto(card, player);
						}
						else {
							target.$give(card, player);
						}
					}
				}
			}
			event.count--;
			if (event.count) {
				const result = await player.chooseBool(get.prompt2('tianxiaguixin_skill')).forResult();
				if (result.bool) {
					// 重新执行获取卡牌逻辑
					for (const target of event.targets) {
						if (!get.is.altered('tianxiaguixin_skill')) {
							if (target.countGainableCards(player, 'hej')) {
								await player.gainPlayerCard(target, true, 'hej');
							}
						}
						else {
							var hej = target.getCards('hej');
							if (hej.length) {
								var card = hej.randomGet();
								await player.gain(card, target);
								if (get.position(card) == 'h') {
									target.$giveAuto(card, player);
								}
								else {
									target.$give(card, player);
								}
							}
						}
					}
				}
			}
		},
		ai: {
			maixie: true,
			"maixie_hp": true,
			threaten: function (player, target) {
				if (target.hp == 1) return 2.5;
				return 1;
			},
			effect: {
				target: function (card, player, target) {
					if (get.tag(card, 'damage')) {
						var num = game.countPlayer(function (current) {
							if (current.countCards('he') && current != player && get.attitude(player, current) <= 0) {
								return true;
							}
							if (current.countCards('j') && current != player && get.attitude(player, current) > 0) {
								return true;
							}
						});
						if (num > 2) return [0, 1];
						if (num == 2) return [0.5, 1];
					}
				},
			},
		},
	},

	fuchouzhihuo_skill: {
		audio: "nzry_longnu",
		equipSkill: true,
		trigger: {
			player: "damageBefore",
		},
		filter: function (event) {
			if (event.nature) return true;
		},
		forced: true,
		ai: {
			nofire: true,
			effect: {
				target: function (card, player, target, current) {
					if (get.tag(card, 'fireDamage' && 'thunderDamage')) return 'zerotarget';
				},
			},
		},
		content: async function (event, trigger, player) {
			trigger.cancel();
		},
		mod: {
			targetEnabled: function (card, player, target) {
				if (get.type(card) == 'delay') return false;
			},
		},
	},

	huchiyongli_skill: {
		audio: "reluoyi",
		equipSkill: true,
		forced: true,
		trigger: {
			player: "shaBegin",
		},
		content: async function (event, trigger, player) {
			const target = trigger.target;
			const result = await target.chooseToDiscard(
				'请弃置一张锦囊牌，否则不能使用闪抵消此杀',
				'he',
				(card) => get.type(card) == 'trick'
			).set('ai', (card) => {
				const num = target.countCards('h', 'shan');
				if (num == 0) return 0;
				return 8 - get.value(card);
			}).forResult();
			if (!result.bool) {
				if (!trigger.directHit) {
					trigger.directHit = [];
				}
				trigger.directHit.add(target);
			}
		},
	},

	manwangzaiqi_skill: {
		audio: "zaiqi",
		equipSkill: true,
		trigger: {
			player: "damageEnd",
		},
		filter: function (event, player) {
			return !event.numFixed && player.hp < player.maxHp;
		},
		forced: true,
		content: async function (event, trigger, player) {
			player.recover();
			var card = get.cardPile(function (card) {
				return get.type(card, 'equip') == 'trick';
			});
			if (card) {
				await player.gain(card, 'gain2');
			}
		},
	},

	qianxungongbi_skill: {
		group: ["qianxungongbi_skill_1", "qianxungongbi_skill_2", "qianxungongbi_skill_3"],
		audio: "drlt_qianjie",
		locked: true,
		ai: {
			effect: {
				target: function (card) {
					if (card.name == 'tiesuo') return 'zeroplayertarget';
				},
			},
		},
		subSkill: {
			"1": {
				audio: "drlt_qianjie",
				trigger: {
					player: "linkBegin",
				},
				forced: true,
				filter: function (event, player) {
					return !player.isLinked();
				},
				content: async function (event, trigger, player) {
					trigger.cancel();
				},
				sub: true,
			},
			"2": {
				mod: {
					targetEnabled: function (card, player, target) {
						if (get.type(card) == 'delay') return false;
					},
				},
				sub: true,
			},
			"3": {
				ai: {
					noCompareTarget: true,
				},
				sub: true,
			},
		},
	},

	cuixinkemou_skill: {
		equipSkill: true,
		trigger: {
			player: "shaBegin",
		},
		content: async function (event, trigger, player) {
			trigger.target.discard(1, false, 'random');
			if (!trigger.target.isLinked()) {
				trigger.target.link(true);
			}
		},
	},

	yanyiweizhong_skill: {
		equipSkill: true,
		trigger: {
			player: "maxHpChange",
		},
		content: async function (event, trigger, player) {
			if (player.countCards('h') == game.getMinHand()) {
				await player.draw(5);
			} else {
				await player.draw(3);
			}
		},
	},

	jiangdongtiebi_skill: {
		equipSkill: true,
		trigger: {
			player: "damageEnd",
		},
		content: async function (event, trigger, player) {
			if (trigger.source && !trigger.source.isTurnOver()) {
				await trigger.source.turnOver(true);
			}
		},
	},

	shizhanyangwei_skill: {
		equipSkill: true,
		trigger: {
			global: "dying",
		},
		content: async function (event, trigger, player) {
			await trigger.player.die();
		},
	},
};

export default skill;
