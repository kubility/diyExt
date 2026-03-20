const skill = {

	// 刘海柱技能
	// 侠义
	wezy_xiayi: {
		audio: "ext:搬山道士/audio/skill:5",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		filterTarget: function (card, player, target) {
			return player !== target;
		},
		selectTarget: 1,
		content: async function (event, trigger, player) {
			const result = await player.chooseCard('h', true, '选择一张牌弃置').forResult();
			if (!result.bool) return;
			await player.discard(result.cards);

			const target = event.targets[0];
			const quotes = ['欺负老实人是吧？今天这事我管定了！', '傻子不是人啊？再欺负人，全给你剁咯！'];
			const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
			player.say(randomQuote);

			target.addTempSkill('wezy_xiayi_forbid', { player: 'phaseUseAfter' });
			target.markSkill('wezy_xiayi_forbid');
		},
		ai: {
			order: 8,
			result: {
				target: function (player, target) {
					if (target.countCards('h', 'sha') + target.countCards('h', 'shan') > 0) return -1;
					return 0;
				},
			},
		},
		subSkill: {
			forbid: {
				charlotte: true,
				mark: true,
				marktext: "侠义",
				intro: {
					content: "本回合不能使用或打出【杀】或【闪】",
				},
				mod: {
					cardEnabled: function (card, player) {
						if (card.name === 'sha' || card.name === 'shan') return false;
					},
					cardRespondable: function (card, player) {
						if (card.name === 'sha' || card.name === 'shan') return false;
					},
				},
			},
		},
	},

	// 修车
	wezy_xiuche: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: {
			player: "loseAfter",
			global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		forced: true,
		filter: function (event, player) {
			const evt = event.getl(player);
			if (evt && evt.player === player && evt.es) {
				return evt.es.length;
			}
			return false;
		},
		content: async function (event, trigger, player) {
			const quotes = ['车坏了我给你修，人坏了我给你收拾！', '想拆我东西？没那么容易！'];
			const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
			player.say(randomQuote);
			await player.draw(2);
		},
		mod: {
			targetInRange: function (card, player, target) {
				if (get.type(card) === 'equip') return true;
			},
		},
		ai: {
			result: {
				player: function (player) {
					if (player.countCards('he', { type: 'equip' }) > 0) {
						return 1;
					}
					return 0;
				},
			},
		},
		group: ['wezy_xiuche_wuxie'],
		subSkill: {
			wuxie: {
				charlotte: true,
				trigger: {
					player: "useCard",
				},
				filter: function (event, player) {
					return get.type(event.card) === 'equip';
				},
				forced: true,
				popup: false,
				content: async function (event, trigger, player) {
					trigger.card.wuxie = true;
				},
			},
		},
	},

	// 单挑
	wezy_dantiao: {
		audio: "ext:搬山道士/audio/skill:2",
		zhuSkill: true,
		awake: true,
		skillAnimation: true,
		animationColor: 'thunder',
		trigger: {
			player: "phaseUseBegin",
		},
		filter: function (event, player) {
			return player.hp === 1 && !player.storage.wezy_dantiao_awakened;
		},
		forced: true,
		content: async function (event, trigger, player) {
			player.say('黄老邪，今天咱俩必须没一个！');
			await player.recover(1);
			player.awakenSkill('wezy_dantiao');
			player.storage.wezy_dantiao_awakened = true;
			player.addSkill('wezy_dantiao_boost');
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (target.hp === 1) return [1, 1];
				},
			},
		},
		subSkill: {
			boost: {
				charlotte: true,
				mark: true,
				marktext: "挑",
				intro: {
					content: "使用【杀】无距离限制且可额外指定一名目标；其他角色对你使用【杀】需额外弃置一张牌",
				},
				mod: {
					targetInRange: function (card, player, target) {
						if (card.name === 'sha') return true;
					},
					selectTarget: function (card, player, range) {
						if (card.name === 'sha') {
							return range + 1;
						}
						return range;
					},
				},
				trigger: {
					target: "useCardToBefore",
				},
				filter: function (event, player) {
					return event.card.name === 'sha' && event.player !== player;
				},
				forced: true,
				content: async function (event, trigger, player) {
					if (event.player.countCards('he') > 0) {
						const result = await event.player.chooseCard('he', true, '弃置一张牌，否则【杀】无效').forResult();
						if (result.bool) {
							await event.player.discard(result.cards);
						} else {
							trigger.cancel();
						}
					} else {
						trigger.cancel();
					}
				},
			},
		},
	},

};

export default skill;
