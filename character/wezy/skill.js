const skill = {

	// 刘海柱技能
	// 侠义
	wezy_xiayi: {
		audio: "ext:搬山道士/audio/skill:5",
		enable: "phaseUse",
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
					return event.card && event.card.name === 'sha' && event.player !== player;
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

	// 吴京技能
	// 夺命八问
	wezy_duoming: {
		audio: "ext:搬山道士/audio/skill:2",
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
			const target = event.targets[0];
			const questions = [
				{
					question: "我跳过楼，你跳过吗？",
					audio: "duoming1",
					yes: () => {
						target.addTempSkill('wezy_duoming_pozh', { global: 'roundStart' });
					},
					no: () => {
						target.addTempSkill('wezy_duoming_noshan', { global: 'roundStart' });
					},
				},
				{
					question: "我让坦克轧过，你轧过吗？",
					audio: "duoming2",
					yes: () => {
						target.addTempSkill('wezy_duoming_noequip', { global: 'roundStart' });
					},
					no: () => {
						target.changeHujia(1);
					},
				},
				{
					question: "我差点死过，你死过吗？",
					audio: "duoming3",
					yes: () => {
						target.addTempSkill('wezy_duoming_nodes', { global: 'roundStart' });
					},
					no: () => {
						target.addTempSkill('wezy_duoming_nohandlimit', { global: 'roundStart' });
					},
				},
				{
					question: "野外生存我把人干了，你干过吗？",
					audio: "duoming4",
					yes: async () => {
						await player.useCard({ name: 'juedou', isCard: true }, target);
					},
					no: () => {
						target.addTempSkill('wezy_duoming_notrick', { global: 'roundStart' });
					},
				},
				{
					question: "中国的蚯蚓我吃遍了，你吃过吗？",
					audio: "duoming5",
					yes: () => {
						target.addTempSkill('wezy_duoming_onedraw', { global: 'roundStart' });
					},
					no: () => {
						target.addTempSkill('wezy_duoming_zhongdu', { global: 'roundStart' });
					},
				},
				{
					question: "我能开飞机，你会吗？",
					audio: "duoming6",
					yes: async () => {
						await player.useCard({ name: 'wuzhong', isCard: true }, player);
					},
					no: () => {
						target.addTempSkill('wezy_duoming_distance', { global: 'roundStart' });
					},
				},
				{
					question: "我能坦克漂移，你会吗？",
					audio: "duoming7",
					yes: () => {
						target.addTempSkill('wezy_duoming_extrasha', { global: 'roundStart' });
					},
					no: async () => {
						if (target.countCards('e') > 0) {
							const result = await player.choosePlayerCard(target, 'e', true, '选择弃置目标一张装备牌').forResult();
							if (result.bool && result.cards && result.cards.length > 0) {
								await target.discard(result.cards);
							} else {
								await target.damage();
							}
						} else {
							await target.damage();
						}
					},
				},
				{
					question: "我干了两件中国电影没人干的事，你干过吗？",
					audio: "duoming8",
					yes: () => {
						target.addTempSkill('wezy_duoming_kangfen', { global: 'roundStart' });
					},
					no: () => {
						target.addTempSkill('wezy_duoming_noskill', { global: 'roundStart' });
					},
				},
			];

			const shuffled = questions.sort(() => Math.random() - 0.5);
			const numQuestions = Math.floor(Math.random() * 3) + 1;
			const selectedQuestions = shuffled.slice(0, numQuestions);

			player.say('我有' + numQuestions + '个问题，你回答吗？');

			for (let i = 0; i < selectedQuestions.length; i++) {
				const q = selectedQuestions[i];
				game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', q.audio);
				await new Promise(resolve => setTimeout(resolve, 1000));
				const judge = await target.judge();
				if (judge.color === 'red') {
					q.yes();
				} else {
					q.no();
				}
			}
		},
		ai: {
			order: 10,
			result: {
				target: -1,
			},
		},
		subSkill: {
			pozh: {
				charlotte: true,
				mark: true,
				marktext: "破绽",
				intro: {
					content: "本回合受到的伤害+1",
				},
				trigger: {
					player: "damageBegin",
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.num++;
				},
			},
			noshan: {
				charlotte: true,
				mark: true,
				marktext: "无闪",
				intro: {
					content: "本回合无法使用【闪】",
				},
				mod: {
					cardEnabled: function (card, player) {
						if (card.name === 'shan') return false;
					},
					cardRespondable: function (card, player) {
						if (card.name === 'shan') return false;
					},
				},
			},
			noequip: {
				charlotte: true,
				mark: true,
				marktext: "无防",
				intro: {
					content: "本回合装备区所有防具失效",
				},
				mod: {
					targetEnabled: function (card, player, target, now) {
						if (get.subtype(card) === 'equip2') return false;
					},
				},
			},
			nodes: {
				charlotte: true,
				mark: true,
				marktext: "无力",
				intro: {
					content: "本回合无法触发濒死自救",
				},
				trigger: {
					player: "dyingBegin",
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.cancel();
				},
			},
			nohandlimit: {
				charlotte: true,
				mark: true,
				marktext: "虚弱",
				intro: {
					content: "手牌上限-2",
				},
				mod: {
					maxHandcard: function (player, num) {
						return num - 2;
					},
				},
			},
			notrick: {
				charlotte: true,
				mark: true,
				marktext: "无谋",
				intro: {
					content: "本回合无法使用普通锦囊",
				},
				mod: {
					cardEnabled: function (card, player) {
						if (get.type(card) === 'trick') return false;
					},
					cardRespondable: function (card, player) {
						if (get.type(card) === 'trick') return false;
					},
				},
			},
			onedraw: {
				charlotte: true,
				mark: true,
				marktext: "少摸",
				intro: {
					content: "摸牌阶段只能摸1张牌",
				},
				trigger: {
					player: "drawBegin",
				},
				filter: function (event, player) {
					return event.num > 1;
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.num = 1;
				},
			},
			zhongdu: {
				charlotte: true,
				mark: true,
				marktext: "中毒",
				intro: {
					content: "每回合结束流失1点体力",
				},
				trigger: {
					global: "phaseEnd",
				},
				forced: true,
				content: async function (event, trigger, player) {
					await player.loseHp(1);
				},
			},
			distance: {
				charlotte: true,
				mark: true,
				marktext: "疏远",
				intro: {
					content: "与你的距离永久+2",
				},
				mod: {
					globalTo: function (from, to, current) {
						if (to === player) return current + 2;
					},
				},
			},
			extrasha: {
				charlotte: true,
				mark: true,
				marktext: "代价",
				intro: {
					content: "使用【杀】需额外弃1张手牌",
				},
				trigger: {
					player: "shaBegin",
				},
				forced: true,
				content: async function (event, trigger, player) {
					if (player.countCards('h') > 0) {
						const result = await player.chooseCard('h', true, '使用【杀】需额外弃置1张手牌').forResult();
						if (result.bool) {
							await player.discard(result.cards);
						}
					}
				},
			},
			kangfen: {
				charlotte: true,
				mark: true,
				marktext: "亢奋",
				intro: {
					content: "本回合可多使用1张【杀】",
				},
				mod: {
					cardUsable: function (card, player, num) {
						if (card.name === 'sha') return num + 1;
					},
				},
			},
			noskill: {
				charlotte: true,
				mark: true,
				marktext: "无用",
				intro: {
					content: "本回合无法发动任何主动技能",
				},
				trigger: {
					player: "useSkillBegin",
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.cancel();
				},
			},

		},
	},

	// 坦克无镜
	wezy_tanke_wujing: {
		audio: "ext:搬山道士/audio/skill:3",
		trigger: {
			player: "damageBegin3",
		},
		forced: true,
		filter: function (event, player) {
			return event.source && event.source.isIn();
		},
		content: async function (event, trigger, player) {
			player.say('坦克里没有后视镜的，枪炮是不长眼的，还有黑哥们儿的语言是不通的。');
			trigger.source.addTempSkill('wezy_tanke_wujing_nosha', { global: 'roundStart' });
		},
		mod: {
			cardDiscardable: function (card, player, name) {
				if (get.position(card) === 'e' && player === _status.event.player) return false;
			},
			targetEnabled: function (card, player, target, now) {
				if (get.position(card) === 'e' && target === player) return false;
			},
		},
		ai: {
			effect: {
				target: function (card, player, target, current) {
					if (player !== target && get.type(card) === 'equip') {
						return [0, 0];
					}
				},
			},
		},
		subSkill: {
			nosha: {
				charlotte: true,
				mark: true,
				marktext: "无镜",
				intro: {
					content: "本回合无法使用【杀】",
				},
				mod: {
					cardEnabled: function (card, player) {
						if (card.name === 'sha') return false;
					},
				},
			},
		},
	},

	// 战狼咆哮
	wezy_zhanlang_paoxiao: {
		audio: "ext:搬山道士/audio/skill:3",
		zhuSkill: true,
		awake: true,
		skillAnimation: true,
		animationColor: 'fire',
		trigger: {
			player: "damageBegin3",
		},
		filter: function (event, player) {
			return player.hp <= 1 && !player.storage.wezy_zhanlang_awakened;
		},
		forced: true,
		content: async function (event, trigger, player) {
			player.say('犯我中华者，虽远必诛！');
			await player.recover(1);
			await player.damage(game.filterPlayer(target => target !== player && target.isIn()), 'fire');
			player.awakenSkill('wezy_zhanlang_paoxiao');
			player.storage.wezy_zhanlang_awakened = true;
			player.addSkill('wezy_zhanlang_paoxiao_damage');
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (target.hp <= 1) return [1, 1];
				},
			},
		},
		subSkill: {
			damage: {
				charlotte: true,
				mark: true,
				marktext: "战狼",
				intro: {
					content: "【杀】伤害+1",
				},
				trigger: {
					player: "damageBegin",
				},
				filter: function (event, player) {
					return event.card && event.card.name === 'sha';
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.num++;
				},
			},
		},
	},


	// 步惊云 - 你不要过来啊！
	qun_dont_come: {
		audio: "ext:搬山道士/audio/skill:2",
		trigger: { target: "useCardToTargeted" },
		forced: true,
		filter: function (event, trigger, player) {
			return event.player != player && get.tag(event.card, "damage");
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
				background-image: url('extension/搬山道士/image/character/wezy/bygl.gif');
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
				if (trigger.targets && trigger.targets.length === 1) {
					const newTarget = await target.chooseTarget('选择一个新目标', (card, player, target) => {
						return target != player && lib.filter.filterTarget(card, player, target);
					}).forResult();
					if (newTarget.bool && newTarget.targets.length > 0) {
						trigger.targets = newTarget.targets;
					} else {
						trigger.cancel();
					}
				} else {
					trigger.cancel();
				}

			} else if (suit === 'diamond') {
				const drawnCards = await player.draw(1);
				player.say('好可怕！');
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
					const result = await player.chooseCard('h', true, '选择一张手牌弃置').forResult();
					if (result.bool) {
						await player.discard(result.cards);
					}
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
					return player.hasSkill('qun_moyin_disable');
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
			await player.viewCards("友商是鲨臂", target.getCards('h'));
			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ysssb');
			player.storage.qun_youshang_friend = target.playerid;
			target.markSkill('qun_youshang');
		},
		ai: {
			expose: 0.3,
		},
		group: ['qun_youshang_clear', 'qun_youshang_distance'],
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
			distance: {
				mod: {
					globalFrom: function (from, to, distance) {
						if (from.hasSkill('qun_youshang') && to.hasMark('qun_youshang')) {
							return 1;
						}
						return distance;
					},
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
				background-image: url('extension/搬山道士/image/character/wezy/areyouok.gif');
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
	// 专业律师 - 打官司
	"打官司": {
		audio: 2,
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			return player.canCompare(target);
		},
		filter: function (event, player) {
			return player.countCards('h') > 0;
		},
		content: async function (event, trigger, player) {
			const target = event.target;
			// 随机决定x的值（1-5）
			const x = [1, 2, 3, 4, 5].randomGet();

			// 进行拼点
			const result = await player.chooseToCompare(target).forResult();

			if (result.bool) {
				// 拼点赢：摸x张牌，并对角色造成x点伤害
				await player.draw(x);
				await target.damage(x);
			} else {
				// 拼点输：弃x张牌，并获得1点护甲
				if (player.countCards('h') >= x) {
					await player.discard(player.getCards('h').randomGets(x));
				} else {
					await player.discard(player.getCards('h'));
				}
				await player.changeHujia(1);
			}
		},
		ai: {
			order: 7,
			result: {
				target: function (player, target) {
					// 评估拼点胜率
					var playerCards = player.getCards('h').sort((a, b) => get.number(b) - get.number(a));
					var targetCards = target.getCards('h').sort((a, b) => get.number(b) - get.number(a));

					// 简单估算：如果自己最大牌大于对方最大牌，胜率较高
					if (playerCards.length > 0 && targetCards.length > 0) {
						if (get.number(playerCards[0]) > get.number(targetCards[0])) {
							return -2; // 胜率较高，值得发动
						}
					}
					return -0.5;
				}
			}
		}
	},
	"觉醒": {
		unique: true,
		skillAnimation: true,
		trigger: {
			player: "dying",
		},
		forced: true,
		content: function () {
			player.maxHp = player.maxHp * 2;
			player.recover(3);
			player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/zhuanyelvshi2.jpg');
			player.addSkill('审判');
			player.awakenSkill('觉醒');
		},
	},
	// 专业律师 - 审判
	"审判": {
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			// 回合开始后可以使用
			return true;
		},
		content: async function (event, trigger, player) {
			// 获取场上所有其他角色
			const targets = game.filterPlayer(current => current !== player);

			for (const target of targets) {
				target.animate("target");

				// 随机选择一个名字
				const names = ["刘大", "陈二", "张三", "李四", "王五", "赵六", "孙七", "周八", "吴九", "郑十"];
				const name = names.randomGet();
				target.say("我是..." + name);

				// 随机决定x值（0-5）
				const x = [0, 1, 2, 3, 4, 5].randomGet();

				if (name === '张三') {
					// 张三：失去至少3点体力，翻面横置，随机丢掉手牌x张
					const damage = Math.max(3, x);
					target.turnOver();
					target.link();
					if (target.countCards('h') > 0) {
						await target.discard(target.getCards('h').randomGets(Math.min(x, target.countCards('h'))));
					}
					await target.loseHp(damage);
				} else if (name === '王五') {
					// 王五：视为对你使用一张杀
					await target.useCard({ name: 'sha' }, player, false);
				} else {
					// 其他角色：随机掉x体力
					await target.loseHp(x);
				}

				// 延迟一下再处理下一个角色
				await game.asyncDelay(1);
			}

			player.say("(Σ(⊙▽⊙a...)");
		},
		ai: {
			order: 5,
			result: {
				player: function (player) {
					// 评估收益：主要看场上敌人数量
					const enemies = game.filterPlayer(current => {
						return current !== player && get.attitude(player, current) < 0;
					});
					return enemies.length > 0 ? 1 : -1;
				}
			}
		}
	},

	// 哪吒&敖丙技能
	// 哪吒&敖丙技能
	// 混元（主动技，回合开始阶段限一次）
	wezy_hunyuan: {
		audio: "ext:搬山道士/audio/skill:5",
		trigger: {
			player: ["phaseBegin", "phaseEnd"]
		},
		filter: function (event, player) {
			if (player.maxHp <= 1) return false;
			return true;
		},
		content: async function (event, trigger, player) {
			player.say('本是混元一体，灵魔同源不分彼此！');
			const currentForm = player.storage.wezy_hunyuan_form || 'mowan';
			const newForm = currentForm === 'mowan' ? 'lingzhu' : 'mowan';
			const choices = ['失去1点体力', '失去1点体力上限'];
			const result = await player.chooseControl(choices).set('prompt', '选择一项效果').forResult();
			if (result.control === '失去1点体力') {
				await player.loseHp();
			} else {
				await player.loseMaxHp();
			}

			// 切换形态
			if (newForm === 'mowan') {
				// 切换到哪吒
				player.storage.wezy_hunyuan_form = 'mowan';
				player.node.name.textContent = '哪吒';
				player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/nezha.jpg');
				player.removeSkill('wezy_lingzhu');
				player.removeSkill('wezy_wanlongjia');
				player.addSkill('wezy_mowan');
				player.addSkill('wezy_nitian');
			} else {
				// 切换到敖丙
				player.storage.wezy_hunyuan_form = 'lingzhu';
				player.node.name.textContent = '敖丙';
				player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/aobing.jpg');
				player.removeSkill('wezy_mowan');
				player.removeSkill('wezy_nitian');
				player.addSkill('wezy_lingzhu');
				player.addSkill('wezy_wanlongjia');

			}
		},
		onremove: function (player) {
			delete player.storage.wezy_hunyuan_form;
		},
		init: function (player) {
			if (!player.storage.wezy_hunyuan_form) {
				player.storage.wezy_hunyuan_form = 'mowan';
			}
			// 初始为哪吒形态，移除敖丙技能
			player.removeSkill('wezy_lingzhu');
			player.removeSkill('wezy_wanlongjia');
			player.addSkill('wezy_mowan');
			player.addSkill('wezy_nitian');
			// 延迟设置名字和头像，确保 UI 已经准备好
			setTimeout(function () {
				player.node.name.textContent = '哪吒';
				player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/nezha.jpg');
			}, 1000);
		},
	},

	// 魔丸（锁定技）
	wezy_mowan: {
		audio: "ext:搬山道士/audio/skill:2",
		forced: true,
		trigger: {
			player: "useCard1",
		},
		filter: function (event, player) {
			return event.card && event.card.name === 'sha';
		},
		content: async function (event, trigger, player) {
			trigger.card.nature = 'fire';
			trigger.card.storage = trigger.card.storage || {};
			trigger.card.storage.wezy_mowan = true;
		},
		group: ['wezy_mowan_draw'],
		subSkill: {
			draw: {
				charlotte: true,
				trigger: {
					source: "damageEnd",
				},
				filter: function (event, player) {
					if (!event.card || !event.card.storage || !event.card.storage.wezy_mowan) return false;
					return true;
				},
				forced: true,
				content: async function (event, trigger, player) {
					await player.draw(1);
				},
			},
		},
	},

	// 逆天（主动技，出牌阶段限一次）
	wezy_nitian: {
		audio: "ext:搬山道士/audio/skill:1",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			const nonShaCards = player.getCards('h').filter(card => card.name !== 'sha');
			return nonShaCards.length > 0;
		},
		content: async function (event, trigger, player) {
			const nonShaCards = player.getCards('h').filter(card => card.name !== 'sha');
			if (nonShaCards.length > 0) {
				await player.discard(nonShaCards);
			}

			// 清除所有负面状态
			if (player.isLinked()) {
				player.link(false);
			}

			player.addTempSkill('wezy_nitian_effect', { player: 'phaseUseAfter' });
		},
		subSkill: {
			effect: {
				charlotte: true,
				mod: {
					targetInRange: function (card, player, target) {
						if (card.name === 'sha' && card.nature === 'fire') return true;
					},
					cardUsable: function (card, player, num) {
						if (card.name === 'sha' && card.nature === 'fire') return Infinity;
					},
				},
				trigger: {
					player: "useCardToBefore",
				},
				filter: function (event, player) {
					return event.card && event.card.name === 'sha' && event.card.nature === 'fire';
				},
				forced: true,
				content: async function (event, trigger, player) {
					if (!trigger.directHit) {
						trigger.directHit = [];
					}
					trigger.directHit.add(trigger.target);
				},
			},
		},
	},

	// 灵珠（锁定技）
	wezy_lingzhu: {
		audio: "ext:搬山道士/audio/skill:3",
		forced: true,
		trigger: {
			player: "damageBegin4",
		},
		filter: function (event, player) {
			if (!event.card || !event.card.name) return false;
			if (event.card.name === 'sha' && event.card.nature) return true;
			return false;
		},
		content: async function (event, trigger, player) {
			trigger.cancel();
			player.say('寒冰覆身，万火不侵。');
		},
		ai: {
			effect: {
				target: function (card, player, target, current) {
					// 如果目标有灵珠技能，属性杀对其效果降低
					if (target.hasSkill('wezy_lingzhu') && card.name === 'sha' && card.nature) {
						return [0, 0]; // 属性杀对灵珠无效，不建议使用
					}
				},
			},
		},
	},

	// 万龙甲（主动技）
	wezy_wanlongjia: {
		audio: "ext:搬山道士/audio/skill:4",
		trigger: {
			player: "damageBegin3",
		},
		filter: function (event, player) {
			return player.countCards('he') > 0;
		},
		check: function (event, player) {
			return event.num >= 1;
		},
		content: async function (event, trigger, player) {
			trigger.cancel();
			player.say('万龙甲在此，无人能伤你分毫！');
			const result = await player.chooseCard('he', true, '弃置一张牌防止伤害').forResult();
			if (!result.bool) return;
			await player.discard(result.cards);

		},
	},

	// 共劫（限定技，一局一次）
	wezy_gongjie: {
		audio: "ext:搬山道士/audio/skill:4",
		limited: true,
		skillAnimation: true,
		animationColor: 'water',
		trigger: {
			player: "dying",
		},
		filter: function (event, player) {
			return player.hp <= 0;
		},
		forced: true,
		content: async function (event, trigger, player) {
			player.say('若天道不公，我们便一起逆天！');
			await player.recover(player.maxHp);
			await player.draw(player.maxHp);
			player.awakenSkill('wezy_gongjie');

			// 切换到合体头像
			player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/nezha_aobing2.jpg');

			// 切换背景音乐
			const path = 'extension/搬山道士/audio/bm/gongjie.mp3';
			ui.backgroundMusic.src = path;
			ui.backgroundMusic.play();
			//ui.backgroundMusic.addEventListener('ended', function () {
			//	ui.backgroundMusic.src = path;
			//});

			// 移除所有技能（除了共劫）
			const allSkills = player.getSkills();
			for (let skill of allSkills) {
				if (skill !== 'wezy_gongjie') {
					player.removeSkill(skill);
				}
			}

			const players = game.filterPlayer();
			for (let p of players) {
				if (p === player) continue;
				const judge = await p.judge();
				if (judge.suit === 'spade' && judge.number >= 2 && judge.number <= 9) {
					await p.damage(3, 'thunder');
				}
			}
		},
	},

	// 刘醒・梁非凡技能（双面武将）
	// 对吼（转换技 - 形态切换核心）
	wezy_duihou: {
		enable: 'phaseUse',
		usable: 1,
		content: async function (event, trigger, player) {
			const currentForm = player.storage.wezy_duihou_form || 'xing';
			const newForm = currentForm === 'xing' ? 'fei' : 'xing';

			// 更新形态
			player.storage.wezy_duihou_form = newForm;
			player.storage.wezy_duihou_switched = true;

			// 切换技能组
			if (newForm === 'xing') {
				player.removeSkill('wezy_shiya');
				player.removeSkill('wezy_gezhi');
				player.addSkill('wezy_yinggang');
				player.addSkill('wezy_dingzhuang');
				player.node.name.textContent = '刘醒';
				player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/liuxing.jpg');
				game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'wezy_duihou2');
			} else {
				player.removeSkill('wezy_yinggang');
				player.removeSkill('wezy_dingzhuang');
				player.addSkill('wezy_shiya');
				player.addSkill('wezy_gezhi');
				player.node.name.textContent = '梁非凡';
				player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/liangfeifan.jpg');
				game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'wezy_duihou1');
			}

			// 基础摸1牌
			await player.draw(1);

			// 若本轮未受到伤害，额外摸1牌
			if (!player.storage.wezy_duihou_damaged) {
				await player.draw(1);
			}
		},
		ai: {
			order: 1,
			result: {
				player: function (player) {
					return 2;
				},
			},
		},
		// 子技能组：轮次重置、受伤追踪、觉醒检查
		group: ['wezy_duihou_reset', 'wezy_duihou_damage', 'wezy_duihou_check'],
		subSkill: {
			// 每轮开始重置追踪标记
			reset: {
				trigger: { global: 'roundStart' },
				forced: true,
				popup: false,
				charlotte: true,
				content: async function (event, trigger, player) {
					player.storage.wezy_duihou_damaged = false;
					player.storage.wezy_duihou_switched = false;
					player.storage.wezy_duihou_dealt = false;
				},
			},
			// 受伤时标记
			damage: {
				trigger: { player: 'damageEnd' },
				forced: true,
				popup: false,
				charlotte: true,
				content: async function (event, trigger, player) {
					player.storage.wezy_duihou_damaged = true;
				},
			},
			// 造成伤害时检查觉醒条件
			check: {
				trigger: { source: 'damageEnd' },
				forced: true,
				popup: false,
				charlotte: true,
				filter: function (event, player) {
					return !player.storage.wezy_yeshi_awakened;
				},
				content: async function (event, trigger, player) {
					player.storage.wezy_duihou_dealt = true;
					if (player.storage.wezy_duihou_switched && !player.storage.wezy_yeshi_awakened) {
						player.addSkill('wezy_yeshi');
					}
				},
			},
		},
		// 初始化：设置醒态为默认形态，移除非态技能
		init: function (player) {
			if (!player.storage.wezy_duihou_form) {
				player.storage.wezy_duihou_form = 'xing';
			}
			player.storage.wezy_duihou_damaged = false;
			player.storage.wezy_duihou_switched = false;
			player.storage.wezy_duihou_dealt = false;
			// 初始为醒态，移除非态技能
			player.removeSkill('wezy_shiya');
			player.removeSkill('wezy_gezhi');
			// 设置初始头像和名字
			setTimeout(function () {
				player.node.name.textContent = '刘醒';
				player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/liuxing.jpg');
			}, 500);
		},
		onremove: function (player) {
			delete player.storage.wezy_duihou_form;
			delete player.storage.wezy_duihou_damaged;
			delete player.storage.wezy_duihou_switched;
			delete player.storage.wezy_duihou_dealt;
		},
	},

	// 硬刚（醒态・刘醒 - 被动技）
	wezy_yinggang: {
		audio: 1,
		trigger: { target: 'useCardToBefore' },
		filter: function (event, player) {
			return event.card && event.card.name === 'sha' && event.player !== player;
		},
		check: function (event, player) {
			return player.countCards('he') > 0 && get.attitude(player, event.player) < 0;
		},
		content: async function (event, trigger, player) {
			const result = await player.chooseCard('he', true, '硬刚：弃置一张牌，令该【杀】无效并对使用者造成1点伤害').forResult();
			if (!result.bool) return;

			await player.discard(result.cards);
			trigger.cancel();

			// 对杀的使用者造成1点伤害
			if (trigger.player && trigger.player.isIn()) {
				await trigger.player.damage(1);
			}
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (card.name === 'sha' && target.countCards('he') > 0) {
						return [0.3, -1];
					}
				},
			},
		},
	},

	// 顶撞（醒态・刘醒 - 锁定技）
	wezy_dingzhuang: {
		audio: 2,
		mod: {
			// 对体力值大于自己的角色使用杀无距离限制
			targetInRange: function (card, player, target) {
				if (card.name === 'sha' && target.hp > player.hp) return true;
			},
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (card.name === 'sha' && target.hp > player.hp) {
						return [1, 0.5];
					}
				},
			},
		},
		// 杀命中后摸一张牌
		group: ['wezy_dingzhuang_draw'],
		subSkill: {
			draw: {
				trigger: { source: 'damageEnd' },
				forced: true,
				popup: false,
				charlotte: true,
				filter: function (event, player) {
					return event.card && event.card.name === 'sha';
				},
				content: async function (event, trigger, player) {
					const quotes = ['你凭什么这么对我！', '我唔服！'];
					player.say(quotes.randomGet());
					await player.draw(1);
				},
			},
		},
	},

	// 施压（非态・梁非凡 - 主动技）
	wezy_shiya: {
		audio: 2,
		enable: 'phaseUse',
		usable: 1,
		filterTarget: function (card, player, target) {
			return target !== player;
		},
		selectTarget: 1,
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			const quotes = ['这份工，你还想不想要？', '听我话，冇走鸡！'];
			player.say(quotes.randomGet());

			// 根据目标是否有牌动态设置选项
			const hasCards = target.countCards('he') > 0;
			const choices = hasCards ? ['交给你一张牌', '本回合不能使用【闪】'] : ['本回合不能使用【闪】'];
			const result = await target.chooseControl(choices)
				.set('prompt', '施压：请选择一项').forResult();

			if (result.control === '交给你一张牌') {
				await player.gainPlayerCard(target, 'he', true);
			} else {
				target.addTempSkill('wezy_shiya_noshan', { player: 'phaseEnd' });
				target.markSkill('wezy_shiya_noshan');
			}
		},
		ai: {
			order: 6,
			result: {
				target: function (player, target) {
					if (target.countCards('he') > 0) return -1;
					return -0.5;
				},
				player: function (player, target) {
					return 1;
				},
			},
		},
		subSkill: {
			noshan: {
				charlotte: true,
				mark: true,
				marktext: '压',
				intro: {
					content: '本回合不能使用或打出【闪】',
				},
				mod: {
					cardEnabled: function (card, player) {
						if (card.name === 'shan') return false;
					},
					cardRespondable: function (card, player) {
						if (card.name === 'shan') return false;
					},
				},
			},
		},
	},

	// 革职（非态・梁非凡 - 被动技）
	wezy_gezhi: {
		audio: 2,
		trigger: { player: 'damageBegin3' },
		filter: function (event, player) {
			return event.source && event.source.isIn() && player.countCards('he') >= 2;
		},
		check: function (event, player) {
			return event.num >= 1 && get.attitude(player, event.source) < 0;
		},
		content: async function (event, trigger, player) {
			const result = await player.chooseCard('he', 2, true, '革职：弃置两张牌，令伤害来源本回合技能失效').forResult();
			if (!result.bool) return;

			await player.discard(result.cards);

			// 令伤害来源本回合技能失效
			trigger.source.addTempSkill('wezy_gezhi_silent', { player: 'phaseEnd' });
			trigger.source.markSkill('wezy_gezhi_silent');
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (target.countCards('he') >= 2) {
						return [0.5, -1];
					}
				},
			},
		},
		subSkill: {
			silent: {
				charlotte: true,
				mark: true,
				marktext: '革',
				intro: {
					content: '本回合技能失效',
				},
				trigger: {
					player: 'useSkill',
				},
				forced: true,
				content: async function (event, trigger, player) {
					event.cancel();
				},
			},
		},
	},

	// 吔屎（觉醒技）
	wezy_yeshi: {
		audio: 2,
		skillAnimation: true,
		animationColor: 'fire',
		trigger: { player: 'phaseEnd' },
		forced: true,
		filter: function (event, player) {
			return player.storage.wezy_duihou_switched
				&& player.storage.wezy_duihou_dealt
				&& !player.storage.wezy_yeshi_awakened;
		},
		content: async function (event, trigger, player) {
			const quotes = ['你再讲一次？！', '吔屎啦梁非凡！'];
			player.say(quotes.randomGet());
			// 体力上限+1
			await player.gainMaxHp(1);
			player.awakenSkill('wezy_yeshi');
			player.storage.wezy_yeshi_awakened = true;
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (target.storage.wezy_duihou_switched && target.storage.wezy_duihou_dealt) {
						return [1, 2];
					}
				},
			},
		},
		subSkill: {
			buff: {
				charlotte: true,
				mark: true,
				marktext: '吼',
				intro: {
					content: '【杀】伤害+1，且【杀】不可被响应',
				},
				// 杀不可被响应（强制命中）
				trigger: { player: 'useCard1' },
				filter: function (event, player) {
					return event.card && event.card.name === 'sha';
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.directHit = trigger.directHit || [];
					for (const target of trigger.targets) {
						trigger.directHit.add(target);
					}
				},
				mod: {
					// 杀不可被救出
					cardSavable: function (card, player) {
						if (card.name === 'sha') return false;
					},
				},
			},
			damage: {
				charlotte: true,
				trigger: { source: 'damageBegin' },
				filter: function (event, player) {
					return event.card && event.card.name === 'sha';
				},
				forced: true,
				content: async function (event, trigger, player) {
					trigger.num++;
				},
			},
		},
		group: ['wezy_yeshi_damage', 'wezy_yeshi_buff'],
	},

	// 贾旭明技能
	// 巧辩
	jiaxuming_qiaobian: {
		audio: 2,
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
			const target = event.targets[0];
			const cardResult = await player.chooseCard('h', true, '选择一张手牌').forResult();
			if (!cardResult.bool) return;
			const card = cardResult.cards[0];
			const suit = get.suit(card);
			const suitNames = ['spade', 'heart', 'club', 'diamond'];
			const suitSymbols = ['♠', '♥', '♣', '♦'];
			const guessResult = await target.chooseControl(suitSymbols)
				.set('prompt', '据我所知，这里边儿有事儿啊！')
				.set("ai", function () {
					return suitSymbols.randomGet();
				}).forResult();
			target.popup(guessResult.control);
			target.say(guessResult.control);
			game.log(target, '猜测花色为', guessResult.control);
			if (guessResult.control === suitSymbols[suitNames.indexOf(suit)]) {
				await target.draw();
			} else {
				await target.damage(1, 'thunder');
			}
			await player.showCards(card);
		},
		ai: {
			order: 9,
			result: {
				target: function (player, target) {
					return -1;
				},
			},
		},
	},

	// 抖梗
	jiaxuming_dougeng: {
		audio: 2,
		trigger: {
			target: 'useCardToTargeted',
		},
		filter: function (event, player) {
			if (event.card.name === 'sha') return true;
			if (get.color(event.card) === 'black' && get.type(event.card) === 'trick') return true;
			return false;
		},
		check: function (event, player) {
			return get.attitude(player, event.player) < 0;
		},
		content: async function (event, trigger, player) {
			await player.draw();
			//trigger.getParent().all_excluded = true;
			//trigger.getParent().targets.length = 0;
			//trigger.getParent().targets = trigger.getParent().targets.filter(target => target !== player);
			trigger.getParent().targets.remove(player);

		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (card.name === 'sha' || (get.color(card) === 'black' && get.type(card) === 'trick'))
						return [1, 0.5];
				},
			},
		},
	},

	// 歪报（觉醒技）
	jiaxuming_waibao: {
		audio: 2,
		trigger: {
			player: 'damageEnd',
		},
		filter: function (event, player) {
			if (player.hasSkill('jiaxuming_xiabian')) return false;
			return player.hp <= 1;
		},
		forced: true,
		skillAnimation: true,
		animationColor: 'gray',
		content: async function (event, trigger, player) {
			await player.awakenSkill('jiaxuming_waibao');
			await player.gainMaxHp(1);
			await player.recover(1);
			await player.addSkills('jiaxuming_xiabian');
		},
		derivation: 'jiaxuming_xiabian',
	},

	// 瞎编（觉醒后获得）
	jiaxuming_xiabian: {
		audio: 2,
		enable: 'phaseUse',
		filter: function (event, player) {
			return player.countCards('h', card => {
				return get.type(card) !== 'basic';
			}) > 0;
		},
		filterCard: function (card, player) {
			return get.type(card) !== 'basic';
		},
		selectCard: 1,
		position: 'h',
		viewAs: {
			name: 'wuzhong',
		},
		prompt: '将一张非基本牌当【无中生有】使用',
		check: function (card) {
			return 7 - get.value(card);
		},
		ai: {
			order: 9,
			result: {
				player: function (player) {
					return 1;
				},
			},
		},
		group: ['jiaxuming_xiabian_discard'],
		subSkill: {
			discard: {
				trigger: {
					player: 'useCardAfter',
				},
				filter: function (event, player) {
					return event.card && event.card.name === 'wuzhong';
				},
				direct: true,
				content: async function (event, trigger, player) {
					const result = await player.chooseTarget('令一名角色弃置一张牌', function (card, player, target) {
						return target.countCards('he') > 0;
					}).forResult();
					if (result.bool) {
						const target = result.targets[0];
						const discardResult = await target.chooseCard('he', true, '弃置一张牌').forResult();
						if (discardResult.bool) {
							await target.discard(discardResult.cards);
						}
					}
				},
			},
		},
	},

	// 雪山救狐技能
	// 馈食
	wezy_kuishi: {
		enable: 'phaseUse',
		usable: 1,
		filterTarget: function (card, player, target) {
			return target !== player && target.countCards('he') > 0;
		},
		selectTarget: 1,
		content: async function (event, trigger, player) {
			const target = event.targets[0];
			target.say('给你一只酱板鸭,希望你能熬过冬天');
			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'wezy_kuishi');
			// 目标选择一张牌交给玩家
			const result = await target.chooseCard('he', true, '馈食：选择一张牌置于雪山救狐武将牌上').forResult();
			if (!result.bool) return;

			// 将牌置于武将牌上，视为"鸭"
			const card = result.cards[0];
			await target.give(card, player);
			// 使用addToExpansion将牌置于武将牌上
			await player.addToExpansion(card, player, 'giveAuto').gaintag.add("wezy_kuishi");
			player.markSkill('wezy_kuishi');
			// 记录馈食者
			player.storage.wezy_kuishi_target = target.playerid;
			// 切换目标武将图片为ai_saonian
			player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/wezy_xueshanjiuhu.jpg');
			target.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/ai_saonian.jpg');
		},
		ai: {
			order: 7,
			result: {
				target: function (player, target) {
					return -1;
				},
				player: function (player, target) {
					return 2;
				},
			},
		},
		marktext: '鸭',
		intro: {
			content: 'expansion',
			mark: function (dialog, content, player) {
				dialog.addText('鸭（雪山救狐的标记）');
				const cards = player.getExpansions('wezy_kuishi');
				if (cards && cards.length) {
					dialog.add(cards);
				}
			},
		},
		onremove: function (player, skill) {
			const cards = player.getExpansions(skill);
			if (cards && cards.length) {
				player.loseToDiscardpile(cards);
			}
		},
		// 回合结束后如果有鸭，添加登门技能；检测目标死亡
		group: ['wezy_kuishi_addDengmen', 'wezy_kuishi_checkDeath'],
		subSkill: {
			addDengmen: {
				trigger: { player: 'phaseEnd' },
				filter: function (event, player) {
					return player.getExpansions('wezy_kuishi').length > 0 && !player.hasSkill('wezy_dengmen');
				},
				forced: true,
				popup: false,
				content: async function (event, trigger, player) {
					player.addSkill('wezy_dengmen');
					// 获得1点护甲
					if (player.hujia <= 0) {
						await player.changeHujia(1);
					}
				},
			},
			// 检测馈食者死亡
			checkDeath: {
				trigger: { global: 'dieAfter' },
				filter: function (event, player) {
					return player.getExpansions('wezy_kuishi').length > 0 && player.storage.wezy_kuishi_target === event.player.playerid;
				},
				forced: true,
				popup: false,
				content: async function (event, trigger, player) {
					// 馈食者死亡，重置鸭
					await player.loseToDiscardpile(player.getExpansions('wezy_kuishi'));
					player.unmarkSkill('wezy_kuishi');
					player.setAvatar(player.name, player.name);
					// 如果有登门技能，移除并失去护甲
					if (player.hasSkill('wezy_dengmen')) {
						player.removeSkill('wezy_dengmen');
					}
					// 恢复死亡目标的原本头像（event.player就是刚死亡的目标）
					if (event.player && event.player.node && event.player.node.avatar) {
						event.player.setAvatar(event.player.name, event.player.name);
					}
					delete player.storage.wezy_kuishi_target;

				},
			},
		},
	},

	// 登门
	wezy_dengmen: {
		audio: 2,
		locked: true,
		frequent: true,
		trigger: { player: 'phaseBegin' },
		filter: function (event, player) {
			return player.getExpansions('wezy_kuishi').length > 0 && player.storage.wezy_kuishi_target;
		},
		content: async function (event, trigger, player) {
			// 通过ID获取目标玩家对象
			const targetId = player.storage.wezy_kuishi_target;
			const target = game.findPlayer(p => p.playerid === targetId);
			// 展示目标手牌
			await player.viewCards('鸭', target.getCards('h'));

			// ===== 诘问逻辑开始 =====
			player.say('你可曾在雪山上，救过一只狐狸？');
			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'wezy_dengmen');
			await game.delay(3); // 延迟3秒
			// 四个猜测选项
			const choices = [
				'你是那只狐狸',
				'你是那只酱板鸭',
				'你是雪山',
				'你是我刚刚劈的木柴'
			];

			// 随机决定正确答案（0-3）
			const correctAnswer = Math.floor(Math.random() * 4);

			const result = await target.chooseControl(choices)
				.set('prompt', '你可曾在雪山上，救过一只狐狸？')
				.set('ai', function () {
					// AI选择策略：完全随机，让AI也猜不透
					const choices = _status.event.controls;
					return choices.randomGet();
				})
				.forResult();

			const selectedIndex = choices.indexOf(result.control);
			const isCorrect = selectedIndex === correctAnswer;

			// 根据猜测切换玩家图片并执行效果
			const avatarMap = ['ai_huli', 'ai_jiangbanya', 'ai_xueshan', 'ai_muchai'];
			switch (selectedIndex) {
				case 0: // 你是那只狐狸
					game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_baihu');
					await game.delay(3); // 延迟3秒
					if (isCorrect) {
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[0] + '.jpg');
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_baihu2');
						if (target.hp < target.maxHp) {
							await target.recover(1);
						} else {
							await target.draw(3);
						}
					} else {
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[1] + '.jpg');
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_jiangbanya');
						await target.damage(2, 'fire');
						await player.draw(3);
					}
					break;

				case 1: // 你是那只酱板鸭
					game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_jiangbanya0');
					await game.delay(3); // 延迟3秒
					if (isCorrect) {
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[1] + '.jpg');
						// 获得玩家所有装备牌，自身护甲+1
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_jiangbanya');
						const equips = player.getCards('e');
						if (equips.length > 0) {
							await target.gain(equips, player, 'give');
						}
						await target.changeHujia(1);
					} else {
						// 弃置其2张手牌，并对其造成一点伤害
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[0] + '.jpg');
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_baihu2');
						if (target.countCards('he') > 1) {
							await target.discard(target.getCards('he').randomGets(Math.min(2, target.countCards('he'))));
						} else {
							await target.discard(target.getCards('he'));
						}
						await target.damage(1);
					}
					break;

				case 2: // 你是雪山
					game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_xueshan0');
					await game.delay(3); // 延迟3秒
					if (isCorrect) {
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[2] + '.jpg');
						player.say('我就是那座雪山！');
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_xueshan');
						player.turnOver();
						if (!player.isLinked()) {
							player.link();
						}
					} else {
						// 其弃置所有的基本牌
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[3] + '.jpg');
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_muchai');
						const basicCards = target.getCards('h', card => get.type(card) === 'basic');
						if (basicCards.length > 0) {
							await target.discard(basicCards);
						}
					}
					break;

				case 3: // 你是我刚刚劈的木柴
					game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_muchai0');
					await game.delay(3); // 延迟3秒
					if (isCorrect) {
						// 跳过所有阶段，直接进入弃牌阶段
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[3] + '.jpg');
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_muchai');
						player.say('你猜对了，但...');
						player.skipPhase('phaseJudge');
						player.skipPhase('phaseDraw');
						player.skipPhase('phaseUse');
					} else {
						// 回复1点体力，并立即获得一个额外的回合
						player.node.avatar.setBackgroundImage('extension/搬山道士/image/character/wezy/' + avatarMap[1] + '.jpg');
						game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'ai_jiangbanya');
						await player.recover(1);
						player.insertPhase();
						player.say('你猜错了！');
					}
					break;
			}

			// ===== 诘问逻辑结束 =====

			// 重置鸭标记
			const yaCards = player.getExpansions('wezy_kuishi');
			if (yaCards.length > 0) {
				await player.loseToDiscardpile(yaCards);
			}
			player.unmarkSkill('wezy_kuishi');
			delete player.storage.wezy_kuishi_target;

			// 失去1点护甲（移除登门效果）
			if (player.hujia > 0) {
				await player.changeHujia(-1);
			}

			// 移除登门技能
			player.removeSkill('wezy_dengmen');
			// 恢复目标原本头像
			if (target) {
				target.setAvatar(target.name, target.name);
			}
		},
	},

	// 重生
	wezy_chongsheng: {
		audio: 2,
		trigger: { player: 'dying' },
		filter: function (event, player) {
			return player.getExpansions('wezy_kuishi').length > 0;
		},
		content: async function (event, trigger, player) {
			// 弃置所有鸭
			const yaCards = player.getExpansions('wezy_kuishi');
			if (yaCards.length > 0) {
				await player.loseToDiscardpile(yaCards);
			}
			player.unmarkSkill('wezy_kuishi');
			// 记录目标ID用于恢复头像
			const targetId = player.storage.wezy_kuishi_target;
			if (targetId) {
				const target = game.findPlayer(p => p.playerid === targetId);
				if (target) {
					target.setAvatar(target.name, target.name);
				}
			}
			delete player.storage.wezy_kuishi_target;
			// 移除登门技能（如果有）
			if (player.hasSkill('wezy_dengmen')) {
				if (player.hujia > 0) {
					await player.changeHujia(-1);
				}
				player.removeSkill('wezy_dengmen');
			}
			// 回复体力到1点
			await player.recover(1 - player.hp);
			player.say('以鸭之名，重获新生！');
		},
	},

};

export default skill;
