import { lib, game, ui, get, ai, _status } from "../../main/utils.js";

/** @type { importCharacterConfig['skill'] } */
const skill = {
	// 黑衣人 - 锻炉
	duanlu: {
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		locked: true,
		forced: true,
		unique: true,
		content: function (event, trigger, player) {
			const list = ['qijinqichu', 'paoxiaozhendan', 'mengjiangzhilie', 'bawanghunzi', 'xingluanfangong', 'shibaocichou', 'piguashangzhen', 'kuaimatuxi', 'qizuozhicai', 'kuangcaishejian', 'weiyangmoji', 'tianxiaguixin', 'fuchouzhihuo', 'huchiyongli', 'manwangzaiqi', 'qianxungongbi', 'cuixinkemou', 'yanyiweizhong', 'jiangdongtiebi', 'shizhanyangwei'];
			player.gain(game.createCard(list.randomGet()));
			player.$draw();
			player.gainMaxHp();
			player.recover();
		},
	},
	// 黑衣人 - 改造
	gaizaoshengji: {
		enable: "phaseUse",
		position: "he",
		filter: function (event, player) {
			return (player.getStat('skill').gaizaoshengji || 0) < player.hp && player.countCards('he', { type: 'equip' }) > 0;
		},
		filterCard: function (card) {
			return get.type(card) == 'equip';
		},
		check: function (card) {
			if (_status.event.player.isDisabled(get.subtype(card))) return 5;
			return 3 - get.value(card);
		},
		content: function (event, trigger, player) {
			const list = ['qijinqichu', 'paoxiaozhendan', 'mengjiangzhilie', 'bawanghunzi', 'xingluanfangong', 'shibaocichou', 'piguashangzhen', 'kuaimatuxi', 'qizuozhicai', 'kuangcaishejian', 'weiyangmoji', 'tianxiaguixin', 'fuchouzhihuo', 'huchiyongli', 'manwangzaiqi', 'qianxungongbi', 'cuixinkemou', 'yanyiweizhong', 'jiangdongtiebi', 'shizhanyangwei'];
			player.gain(game.createCard(list.randomGet()));
			player.$draw();
		},
		discard: false,
		visible: true,
		loseTo: "discardPile",
		prompt: "将一张装备牌改造升级为一张宝具牌",
		delay: 0.5,
		prepare: function (cards, player) {
			player.$throw(cards, 1000);
			game.log(player, '将', cards, '改造升级');
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
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
			player.node.avatar.setBackgroundImage(lib.assetURL + '/image/character/other/zhuanyelvshi2.jpg');
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
	// 管理大师 - 时间管理
	shijianGL: {
		enable: "phaseUse",
		usable: 1,
		content: async function (event, trigger, player) {
			function getSfm() {
				var time = new Date();
				var h = time.getHours();

				var m = time.getMinutes();
				m = m < 10 ? '0' + m : m;
				var s = time.getSeconds();
				s = s < 10 ? '0' + s : s;
				return h + '时' + m + '分' + s + '秒';
			}
			var sfm = new Date();
			const xs = sfm.getHours();
			const fz = sfm.getMinutes();
			const ms = sfm.getSeconds();

			var num1 = Math.ceil(xs / 4);
			var num2 = Math.ceil(fz / 10);
			const num3 = Math.ceil(ms / 20);
			game.log('当前时间分秒数为' + getSfm());
			game.log('你将恢复' + num1 + '点体力' + '和摸' + num2 + '张牌' + '造成' + num3 + '点伤害');
			await player.recover(num1);
			await player.draw(num2);

			const result = await player.chooseTarget('请选择你要造成伤害的目标', 1, function (card, player, target) {
				return target != player;
			}, true).set('ai', function (target) {
				return -ai.get.attitude(_status.event.player, target);
			}).forResult();

			if (result.bool && result.targets.length > 0) {
				player.line(result.targets[0]);
				await result.targets[0].damage(player, num3);
			}
		},
		ai: {
			order: 9,
			result: {
				player: 1,
			},
			threaten: 1.55,
		},
	},

	// 大宝 - yldb_pojun
	yldb_pojun: {
		group: "yldb_pojun2",
		shaRelated: true,
		audio: "repojun",
		trigger: {
			player: "useCardToPlayered",
		},
		direct: true,
		filter: function (event, player) {
			return event.card.name == 'sha';
		},
		content: async function (event, trigger, player) {
			const result = await player.choosePlayerCard(trigger.target, [1, Math.min(trigger.target.countCards('he'))], get.prompt('repojun', trigger.target))
				.set('ai', function (button) {
					if (!_status.event.goon) return 0;
					var val = get.value(button.link);
					if (button.link == _status.event.target.getEquip(2)) return 2 * (val + 3);
					return val;
				})
				.set('goon', get.attitude(player, trigger.target) <= 0)
				.set('forceAuto', true)
				.forResult();

			if (result.bool) {
				var target = trigger.target;
				player.logSkill('repojun', trigger.target);
				await target.lose(result.cards, ui.special, 'toStorage');
				game.log(target, '失去了' + get.cnNumber(result.cards.length) + '张牌');
			}

			ui.backgroundMusic.pause();
			// 创建 GIF 元素
			event.gif = document.createElement('div');
			event.gif.className = 'yldb-background';
			event.gif.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 9999;
				background: url(extension/搬山道士/image/character/other/yldb_pojun.gif) no-repeat center center;
				background-size: cover;
			`;

			// 添加到页面
			const targetElement = ui.window || document.body;
			if (targetElement) {
				document.body.insertBefore(event.gif, targetElement);
			} else {
				document.body.appendChild(event.gif);
			}
			/* event.gif = ui.create.div('.yldb-background');
			event.gif.setBackgroundImage('extension/搬山道士/image/character/other/yldb_pojun.gif');
			document.body.insertBefore(event.gif, ui.window);
			*/

			game.playAudio('..', 'extension', '搬山道士', 'audio', 'skill', 'yldb_pojun');
			await new Promise(resolve => {
				game.delay(0, 15000);
				resolve();
			});

			event.gif.delete();
			ui.backgroundMusic.play();
		},
		ai: {
			"unequip_ai": true,
			"directHit_ai": true,
			skillTagFilter: function (player, tag, arg) {
				if (get.attitude(player, arg.target) > 0) return false;
				if (tag == 'directHit_ai') return arg.target.hp >= Math.max(1, arg.target.countCards('h') - 1);
				if (arg && arg.name != 'emm' && arg.target.getEquip(2)) return true;
				return false;
			},
		},
	},
	// 大宝 - yldb_pojun2
	yldb_pojun2: {
		audio: "repojun",
		trigger: {
			source: "damageBegin1",
		},
		forced: true,
		locked: false,
		logTarget: "player",
		filter: function (event, player) {
			var target = event.player;
			return event.getParent().name != 'emm';
		},
		content: function () {
			trigger.num++;
		},
	},
	// 大宝 - yldb_nglmy
	yldb_nglmy: {
		trigger: {
			player: "phaseBegin",
		},
		forced: true,
		content: function () {
			var name = ['guding', 'jiu', 'sha', 'tiesuo'];
			for (var cardName of name) {
				var card = get.cardPile(card => {
					if (cardName != 'sha') return card.name == cardName;
					return card.name == cardName && card.nature == 'fire';
				}, 'field');
				if (card) {
					player.gain(card, 'gain2', 'log');
				}
			}
		},
	},
	"毒枭": {
		audio: "rende",
		group: ["rende1"],
		enable: "phaseUse",
		filterCard: true,
		selectCard: [1, Infinity],
		discard: false,
		prepare: "give",
		filterTarget: function (card, player, target) {
			return player != target;
		},
		check: function (card) {
			if (ui.selected.cards.length > 1) return 0;
			if (ui.selected.cards.length && ui.selected.cards[0].name == 'du') return 0;
			if (!ui.selected.cards.length && card.name == 'du') return 20;
			var player = get.owner(card);
			if (player.hp == player.maxHp || player.storage.rende < 0 || player.countCards('h') <= 1) {
				if (ui.selected.cards.length) {
					return -1;
				}
				var players = game.filterPlayer();
				for (var i = 0; i < players.length; i++) {
					if (players[i].hasSkill('haoshi') &&
						!players[i].isTurnedOver() &&
						!players[i].hasJudge('lebu') &&
						get.attitude(player, players[i]) >= 3 &&
						get.attitude(players[i], player) >= 3) {
						return 11 - get.value(card);
					}
				}
				if (player.countCards('h') > player.hp) return 10 - get.value(card);
				if (player.countCards('h') > 2) return 6 - get.value(card);
				return -1;
			}
			return 10 - get.value(card);
		},
		content: function () {
			target.gain(cards, player);
			target.turnOver();
			if (typeof player.storage.rende != 'number') {
				player.storage.rende = 0;
			}
			if (player.storage.rende >= 0) {
				player.storage.rende += cards.length;
				if (player.storage.rende >= 2) {
					player.recover();
					target.loseMaxHp();
					target.loseHp();
					player.storage.rende = -1;
				}
			}
		},
		ai: {
			order: function (skill, player) {
				if (player.hp < player.maxHp && player.storage.rende < 2 && player.countCards('h') > 1) {
					return 10;
				}
				return 1;
			},
			result: {
				target: function (player, target) {
					if (target.hasSkillTag('nogain')) return 0;
					if (ui.selected.cards.length && ui.selected.cards[0].name == 'du') {
						if (target.hasSkillTag('nodu')) return 0;
						return -10;
					}
					if (target.hasJudge('lebu')) return 0;
					var nh = target.countCards('h');
					var np = player.countCards('h');
					if (player.hp == player.maxHp || player.storage.rende < 0 || player.countCards('h') <= 1) {
						if (nh >= np - 1 && np <= player.hp && !target.hasSkill('haoshi')) return 0;
					}
					return Math.max(1, 5 - nh);
				},
			},
			effect: {
				target: function (card, player, target) {
					if (player == target && get.type(card) == 'equip') {
						if (player.countCards('e', { subtype: get.subtype(card) })) {
							var players = game.filterPlayer();
							for (var i = 0; i < players.length; i++) {
								if (players[i] != player && get.attitude(player, players[i]) > 0) {
									return 0;
								}
							}
						}
					}
				},
			},
			threaten: 0.8,
		},
	},
	"枭雄": {
		audio: "jijiang12",
		trigger: {
			player: "damageEnd",
		},
		content: function () {
			player.insertPhase();
		},
		ai: {
			threaten: 1.2,
		},
	},
}


export default skill;