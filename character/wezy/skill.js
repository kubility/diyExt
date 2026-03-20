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
					yes: () => {
						player.useCard({ name: 'juedou' }, target, false);
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
						await player.useCard({ name: 'wuzhong' }, player, false);
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
							const result = await player.chooseCard('选择弃置目标一张装备牌', target.getCards('e'), true).forResult();
							if (result.bool) {
								await target.discard(result.cards);
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
						const result = await player.chooseCard('使用【杀】需额外弃置1张手牌', 'h', true).forResult();
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
			await player.viewCards("友商是鲨臂", target.getCards('h'));
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
			player.node.avatar.setBackgroundImage(lib.assetURL + '/image/character/wezy/zhuanyelvshi2.jpg');
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

};

export default skill;
