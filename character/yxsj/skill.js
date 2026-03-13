const skill = {
	poti: {
		audio: "ext:搬山道士:2",
		trigger: {
			global: "dieAfter",
		},
		derivation: ["lueshi", "suanxie2"],
		animationColor: "fire",
		skillAnimation: "legend",
		forced: true,
		filter: function (event, player) {
			return event.player.hasSkill('suzhu');
		},
		mark: true,
		intro: {
			content: "limited",
		},
		init: function (player) {
			player.storage[i] = false;
		},
		content: function () {
			'step 0'
			player.awakenSkill('poti');
			player.storage.poti = true;
			'step 1'
			player.setAvatar('yixing', 'yixing2');
			player.removeSkill('yingni')
			'step 2'
			player.addSkill('lueshi')
			player.addSkill('suanxie2')
			player.draw(player.maxHp - player.countCards('h'))
		},
	},
	lueshi: {
		trigger: {
			source: "damageEnd",
		},
		forced: true,
		filter: function (event, player) {
			return player.inRange(event.player) && event.player != player;
		},
		content: function () {
			var a = trigger.num
			player.recover(a)
			player.draw(a)
		},
		mod: {
			cardUsable: function (card, player, num) {
				if (card.name == 'sha') return Infinity;
			},
		},
		ai: {
			unequip: true,
			skillTagFilter: function (player, tag, arg) {
				if (arg && arg.name == 'sha') return true;
				return false;
			},
		},
	},
	yunyu: {
		trigger: {
			player: "phaseEnd",
		},
		forced: true,
		priority: -20,
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return current.hasSkill('yingni');
			});
		},
		content: function () {
			var boss = game.findPlayer(function (current2) {
				return current2.name == 'yixing';
			});
			boss.line(player)
			player.damage(boss);
			if (boss.maxHp <= player.maxHp) {
				boss.gainMaxHp()
				boss.recover()
			} else {
				player.damage(boss);
			}
		},
	},
	yingni: {
		trigger: {
			player: ["deadBefore", "turnOverBefore", "linkBefore", "damageBegin", "loseHpBegin"],
		},
		priority: 20,
		forced: true,
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return current.hasSkill('suzhu');
			});
		},
		content: function () {
			trigger.cancel();
		},
		mod: {
			targetEnabled: function (card, player) {
				if (game.hasPlayer(function (current) {
					return current.hasSkill('suzhu');
				})) return false;
			},
		},
	},
	suzhu: {
		mark: true,
		intro: {
			content: "锁定技，手牌上限+1，[杀]的可用次数+1；【孕育】:回合结束阶段，你受到一点来自“三国异形”的伤害，若“三国异形”体力上限不大于你，其增加一点体力上限并回复一点体力，否则你再受到一次伤害【滋润】:当你使其他角色进入濒死状态时，你回复一点体力并摸一张牌。",
		},
		mod: {
			maxHandcard: function (player, num) {
				return num + 1;
			},
			cardUsable: function (card, player, num) {
				if (card.name == 'sha') return num + 1;
			},
		},
		group: ["zirun", "yunyu"],
		ai: {
			threaten: 2,
		},
	},
	zhuyun: {
		audio: "ext:搬山道士:2",
		enable: "phaseUse",
		animationColor: "fire",
		skillAnimation: "legend",
		filterTarget: function (card, player, target) {
			return player != target && player.inRange(target) && target.identity != 'zhu';
		},
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return !current.hasSkill('suzhu');
			}) && player.name == "baolian";
		},
		content: function () {
			'step 0'
			player.awakenSkill('zhuyun');
			player.storage.zhuyun = true;
			player.link(false)
			player.turnOver(false)
			player.init('yixing');
			'step 1'
			target.gainMaxHp()
			target.recover()
			target.addSkill('suzhu');
			'step 2'
			var cards = player.getCards('he')
			player.$give(cards, target);
			target.gain(cards, player);
		},
		mark: true,
		intro: {
			content: "limited",
		},
		init: function (player, skill) {
			player.storage[skill] = false;
		},
		ai: {
			result: {
				target: function (player, target) {
					var hs = player.getCards('h');
					if (hs.length < 3) return 0;
					var bool = false;
					for (var i = 0; i < hs.length; i++) {
						if (hs[i].number >= 9 && get.value(hs[i]) < 7) {
							bool = true;
							break;
						}
					}
					if (!bool) return 0;
					return -1;
				},
			},
			order: 9,
		},
	},
	suanxie: {
		trigger: {
			player: "damageEnd",
		},
		forced: true,
		filter: function (event, player) {
			return (event.source && event.source != player);
		},
		content: function () {
			'step 0'
			player.loseHp()
			'step 1'
			var num = player.maxHp - player.hp
			player.line(trigger.source, 'fire')
			if (trigger.source.countCards('he') >= num) {
				player.discardPlayerCard(trigger.source, 'he', num, true);
			} else {
				trigger.source.loseHp()
			}
		},
		ai: {
			"maixie_defend": true,
			effect: {
				target: function (card, player, target) {
					if (player.countCards('he') > 1 && get.tag(card, 'damage')) {
						if (player.hasSkillTag('jueqing', false, target)) return [1, -1.5];
						if (get.attitude(target, player) < 0) return [1, 1];
					}
				},
			},
		},
	},
	huozhi: {
		audio: "ext:搬山道士:2",
		trigger: {
			player: "phaseDrawBegin",
		},
		forced: true,
		content: function () {
			'step 0'
			var n = [4, 5, 6].randomGet();
			trigger.cancel();
			event.cards = get.cards(n);
			if (player.hasSkill("lueshi")) {
				player.chooseCardButton(event.cards, [1, 3], '选择获得一至三张牌', true).set('ai', get.buttonValue);
			} else {
				player.chooseCardButton(event.cards, [1, 2], '选择获得一至两张牌', true).set('ai', get.buttonValue);
			}
			'step 1'
			if (result.bool) {
				var choice = [];
				for (var i = 0; i < result.links.length; i++) {
					choice.push(result.links[i]);
					cards.remove(result.links[i]);
				}
				var first = ui.cardPile.firstChild;
				for (var i = 0; i < cards.length; i++) {
					ui.cardPile.insertBefore(cards[i], first);
				}
				player.gain(choice, 'draw');
			}
			'step 2'
			game.countPlayer(function (current) {
				if (current != player && current.hasSkill('suzhu')) {
					var cards = player.getCards('he')
					player.$give(cards, current);
					current.gain(cards, player);
					player.skip('phaseUse')
				}
			});
		},
	},
	"suanxie2": {
		trigger: {
			player: "damageEnd",
		},
		filter: function (event, player) {
			return (event.source && event.source != player);
		},
		content: function () {
			'step 0'
			player.loseHp()
			'step 1'
			var num = player.maxHp - player.hp
			player.line(trigger.source, 'fire')
			if (trigger.source.countCards('he') >= num) {
				player.discardPlayerCard(trigger.source, 'he', num, true);
			} else {
				trigger.source.loseHp(num - 1)
			}
		},
		ai: {
			"maixie_defend": true,
			effect: {
				target: function (card, player, target) {
					if (player.countCards('he') > 1 && get.tag(card, 'damage')) {
						if (player.hasSkillTag('jueqing', false, target)) return [1, -1.5];
						if (get.attitude(target, player) < 0) return [1, 1];
					}
				},
			},
		},
	},
	zirun: {
		audio: "ext:搬山道士:2",
		trigger: {
			source: "dying",
		},
		forced: true,
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return current.hasSkill('yingni');
			}) && event.player != player;
		},
		content: function () {
			player.recover()
			player.draw();
		},
	},
};

export default skill;