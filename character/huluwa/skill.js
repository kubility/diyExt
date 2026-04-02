import { lib, game, ui, get, ai, _status } from "../../main/utils.js";

/** @type { importCharacterConfig['skill'] } */
const skill = {
    // 大娃技能
    hlw_libashanhe: {
        audio: 2,
        enable: 'phaseUse',
        usable: 1,
        filter: function (event, player) {
            return true;
        },
        filterTarget: function (card, player, target) {
            return target !== player;
        },
        content: async function (event, trigger, player) {
            const target = event.targets[0];
            let damageNum = 1;
            // 若该角色手牌数大于等于你的体力值，则此伤害+1
            if (target.countCards('h') >= player.hp) {
                damageNum = 2;
            }
            await target.damage(damageNum);
        },
        ai: {
            order: 8,
            result: {
                target: function (player, target) {
                    if (target.group !== player.group) return 0.9;
                    return 0.1;
                },
                player: 1.0
            }
        }
    },
    hlw_jurentai: {
        audio: 2,
        trigger: { player: 'damageBegin' },
        content: async function (event, trigger, player) {
            // 从牌堆顶获取3张牌（不直接加入手牌）
            const cards = get.cards(3);
            if (!cards || cards.length === 0) return;
            // 展示牌
            await player.showCards(cards);
            // 获得其中的基本牌
            const basicCards = [];
            const otherCards = [];
            for (const card of cards) {
                if (get.type(card) === 'basic') {
                    basicCards.push(card);
                } else {
                    otherCards.push(card);
                }
            }
            // 将基本牌加入手牌
            if (basicCards.length > 0) {
                await player.gain(basicCards, 'gainAuto');
            }
            // 将非基本牌弃置
            if (otherCards.length > 0) {
                await player.discard(otherCards);
            }
        },
        ai: {
            order: 9,
            result: {
                player: 1.0
            }
        }
    },
    // 二娃技能
    hlw_qianliyan: {
        audio: 2,
        trigger: { player: 'phaseBegin' },
        content: async function (event, trigger, player) {
            // 查看牌堆顶的3张牌
            const cards = get.cards(3, true);
            if (cards.length === 0) return;

            // 展示牌
            await player.showCards(cards);

            // 选择一张作为先机牌
            const result = await player.chooseCardButton(cards, 1, '选择一张牌作为先机牌', true).forResult();
            if (!result.bool) {
                // 如果取消选择，将所有牌放回牌堆顶
                await game.cardsGotoPile(cards, "insert");
                return;
            }

            const xj = result.links[0];
            const otherCards = [];
            for (let i = 0; i < cards.length; i++) {
                if (cards[i] !== xj) {
                    otherCards.push(cards[i]);
                }
            }
            // 记住先机牌的花色
            player.storage.xianjipai = xj;
            await game.cardsGotoPile(otherCards);
            game.log(player, '选择了' + get.translation(xj) + '作为先机牌');
        },
        group: ['hlw_qianliyan_clean', 'hlw_qianliyan_draw'],
        subSkill: {
            clean: {
                trigger: { player: 'phaseEnd' },
                silent: true,
                content: function (event, trigger, player) {
                    if (player.storage.xianjipai) {
                        delete player.storage.xianjipai;
                    }
                }
            },
            draw: {
                trigger: { player: 'useCard' },
                filter: function (event, player) {
                    return player.storage.xianjipai && get.suit(event.card) === get.suit(player.storage.xianjipai);
                },
                forced: true,
                content: async function (event, trigger, player) {
                    await player.draw(1);
                    game.log(player, '使用与先机牌同花色的牌，摸了一张牌');
                }
            }
        },
        ai: {
            order: 9,
            result: {
                player: 2.0
            }
        }
    },
    hlw_shunfenger: {
        audio: 2,
        trigger: { global: 'phaseBegin' },
        filter: function (event, player) {
            return event.player !== player && event.player.countCards('h') > 0;
        },
        content: async function (event, trigger, player) {
            const target = trigger.player;
            // 查看目标的所有手牌
            const targetCards = target.getCards('h');
            // 展示目标的所有手牌
            await player.showCards(targetCards, get.translation(player) + '查看了' + get.translation(target) + '的所有手牌');
            // 检查是否有南蛮入侵或万箭齐发
            const specialCards = [];
            for (let i = 0; i < targetCards.length; i++) {
                const card = targetCards[i];
                if (card.name === 'nanman' || card.name === 'wanjian') specialCards.push(card);
            }
            // 如果有南蛮入侵或万箭齐发，获取其中一张的效果
            if (specialCards.length > 0) {
                // 选择一张特殊牌
                const cardResult = await player.chooseCard(specialCards, true, '选择一张牌获取其效果').forResult();
                if (cardResult.bool) {
                    const selectedCard = cardResult.cards[0];
                    // 从目标手里获得这张牌
                    await player.gain(target, selectedCard); // 第三个参数表示是否记录日志
                    // 使用该牌的效果
                    game.log(player, '获取了' + get.translation(selectedCard) + '的效果');
                    await player.useCard(selectedCard);
                }
            }
        },
        ai: {
            order: 8,
            result: {
                player: function (player, event) {
                    const target = event.player;
                    if (target !== player) {
                        const hasSpecialCard = target.getCards('h').some(card => card.name === 'nanman' || card.name === 'wanjian');
                        return hasSpecialCard ? 1.5 : 1.0;
                    }
                    return 0;
                }
            }
        }
    },
    // 三娃技能
    hlw_gangjintiegu: {
        audio: 2,
        lock: true,
        trigger: { player: 'damageBegin' },
        filter: function (event, player) {
            // 检查是否有牌造成伤害
            if (!event.card) return false;
            var cardName = event.card.name;

            // 检查是否为杀或决斗
            if (cardName == 'sha' || cardName == 'juedou') {
                // 对于杀，只处理普通杀（无属性）
                if (cardName == 'sha') {
                    // 普通杀：没有伤害类型或伤害类型为 normal
                    return !event.nature;
                }
                // 决斗：总是触发
                return true;
            }

            return false;
        },
        content: function (event, trigger, player) {
            trigger.num--;
        },
        ai: {
            order: 8,
            result: {
                player: 1.0
            }
        }
    },
    hlw_jinzhongzhao: {
        audio: 2,
        trigger: { player: 'damageBegin' },
        filter: function (event, player) {
            // 检查是否有牌造成伤害
            if (!event.card) return false;
            var cardName = event.card.name;
            // 过滤掉普通杀和决斗
            if (cardName == 'sha') {
                // 普通杀：伤害类型为 normal
                if (!event.nature) {
                    return false; // 普通杀不触发
                }
            } else if (cardName == 'juedou') {
                return false; // 决斗不触发
            }
            return true; // 其他伤害触发
        },
        content: async function (event, trigger, player) {
            if (player.countCards('he') > 0) {
                const result = await player.chooseToDiscard('he', '是否弃置一张装备牌使用伤害-1？').forResult();
                if (result.bool) {
                    trigger.num--;
                }
            }
            // 全场挂闪电
            game.players.forEach(function (target) {
                if (!target.hasJudge('shandian')) {
                    var shandian = game.createCard('shandian', 'spade', 1);
                    target.addJudge(shandian);
                }
            });
        },
        ai: {
            order: 9,
            result: {
                player: 1.0
            }
        }
    },
    // 四娃技能
    hlw_liehuo: {
        audio: 2,
        enable: 'phaseUse',
        filter: function (event, player) {
            // 检查是否有红色牌且本阶段未成功使用过
            return player.countCards('h', function (card) {
                return get.color(card) === 'red';
            }) > 0 && !player.storage.liehuo_used;
        },
        content: async function (event, trigger, player) {
            // 先选择目标
            const targetResult = await player.chooseTarget('选择一名目标造成火焰伤害', function (card, player, target) {
                return target !== player;
            }).forResult();

            if (!targetResult.bool) return;

            const target = targetResult.targets[0];
            // 再选择一张红色牌弃置
            const cardResult = await player.chooseCard('h', { color: 'red' }, '请选择一张红色牌').forResult();
            if (!cardResult.bool) return;
            const selectedCard = cardResult.cards;

            // 弃置红色牌
            await player.discard(selectedCard);

            // 造成1点火焰伤害
            await target.damage(1, 'fire');
            // 标记技能已成功使用
            player.storage.liehuo_used = true;
        },
        group: ['hlw_liehuo_clear'],
        subSkill: {
            clear: {
                trigger: { player: 'phaseEnd' },
                forced: true,
                content: function (event, trigger, player) {
                    // 回合结束时清理标记
                    delete player.storage.liehuo_used;
                }
            }
        },
        ai: {
            order: 8,
            result: {
                target: function (player, target) {
                    if (target.group !== player.group) return 0.9;
                    return 0.1;
                },
                player: 1.0
            }
        }
    },
    hlw_fenshao: {
        audio: 2,
        trigger: { player: 'shaDamage' },
        filter: function (event, player) {
            return event.card && get.color(event.card) === 'red';
        },
        content: async function (event, trigger, player) {
            const target = event.target;
            if (!target || !target.isAlive()) return;
            // 直接使用 chooseCard 检查并选择装备牌
            const result = await target.chooseCard('he', true, function (card) {
                return get.type(card) === 'equip';
            }, '选择一张装备牌弃置').set('ai', function (card) {
                return -get.value(card);
            }).forResult();

            if (result.bool && result.cards.length > 0) {
                // 有装备：弃置选择的装备牌
                await target.discard(result.cards);
            } else {
                // 无装备：弃置全部手牌
                const handCards = target.getCards('h');
                if (handCards.length > 0) {
                    await target.discard(handCards);
                }
            }
        },
        ai: {
            order: 8,
            result: {
                player: 1.0
            }
        }
    },

    // 五娃技能
    hlw_ganlu: {
        audio: 2,
        enable: 'phaseUse',
        filter: function (event, player) {
            // 检查是否有黑色牌且本阶段未成功使用过
            return player.countCards('he', function (card) {
                return get.color(card) === 'black';
            }) > 0 && !player.storage.ganlu_used;
        },
        content: async function (event, trigger, player) {
            // 先选择目标（体力不满的角色）
            const targetResult = await player.chooseTarget('选择一名角色回复1点体力', function (card, player, target) {
                return target.hp < target.maxHp && target.isAlive();;
            }).forResult();

            if (!targetResult.bool || targetResult.targets.length === 0) return;

            const target = targetResult.targets[0];

            // 再选择一张黑色牌弃置
            const cardResult = await player.chooseCard('h', true, { color: 'black' }, '选择一张黑色牌弃置').forResult();

            if (!cardResult.bool || cardResult.cards.length === 0) return;

            // 弃置黑色牌
            await player.discard(cardResult.cards);
            // 回复1点体力
            await target.recover(1);
            // 标记技能已成功使用
            player.storage.ganlu_used = true;
        },
        group: ['hlw_ganlu_clear'],
        subSkill: {
            clear: {
                trigger: { player: 'phaseEnd' },
                forced: true,
                content: function (event, trigger, player) {
                    delete player.storage.ganlu_used;
                }
            }
        },
        ai: {
            order: 8,
            result: {
                target: function (player, target) {
                    if (target.hp < target.maxHp && target.group === player.group) return 0.9;
                    if (target.hp < target.maxHp) return 0.5;
                    return 0;
                },
                player: 1.0
            }
        }
    },
    hlw_shuidun: {
        audio: 2,
        trigger: { player: 'damageBegin' },
        content: async function (event, trigger, player) {
            const result = await player.chooseBool('是否展示牌堆顶的一张牌？').forResultBool();
            if (!result) return;

            // 获取牌堆顶的一张牌
            const card = get.cardPile2(true);
            if (!card) {
                game.log(player, '牌堆已空，无法展示牌');
                return;
            }

            // 展示牌
            // await player.showCards([card]);
            // 检查牌的颜色
            if (get.color(card) === 'black') {
                trigger.num--;
                game.log(player, '展示了黑色牌，减少1点伤害');
            } else {
                game.log(player, '展示了非黑色牌，伤害不变');
            }

            // 将牌丢入弃牌堆
            //game.cardsDiscard(card);
            card.discard();
            game.log(player, '将展示的牌放入弃牌堆');
        },
        ai: {
            order: 9,
            result: {
                player: 1.0
            }
        }
    },

    // 六娃技能
    hlw_yinshen: {
        audio: 2,
        trigger: { player: 'phaseEnd' },
        filter: function (event, player) {
            // 检查是否有装备（手牌和装备栏）
            return player.countCards('h', card => get.type(card) === 'equip') > 0 || player.countCards('e') > 0;
        },
        content: async function (event, trigger, player) {

            const allEquips = player.getCards('he', card => get.type(card) === 'equip');
            // 弃置所有装备
            if (allEquips.length > 0) {
                await player.discard(allEquips);
            }
            // 添加临时技能，持续到下一个回合开始
            player.addTempSkill('hlw_yinshen_effect', { player: 'phaseBegin' });
        },
        ai: {
            order: 8,
            result: {
                player: 1.0
            }
        }
    },
    hlw_yinshen_effect: {
        mark: true,
        marktext: '隐',
        charlotte: true,
        intro: {
            content: '不能成为杀和决斗的目标'
        },
        trigger: {
            target: 'useCardToBefore'
        },
        filter: function (event, player) {
            return event.card.name === 'sha' || event.card.name === 'juedou';
        },
        forced: true,
        content: async function (event, trigger, player) {
            trigger.cancel();
        }
    },
    // 七娃技能
    hlw_shouyao: {
        audio: 2,
        enable: 'phaseUse',
        filter: function (event, player) {
            return event.player != player && !player.storage.shouyao_used;
        },
        content: async function (event, trigger, player) {
            // 选择目标
            const result = await player.chooseTarget('选择一名目标角色', function (card, player, target) {
                return target !== player;
            }).forResult();
            if (!result.bool) return;
            const target = result.targets[0];

            // 如果目标没有两张牌，直接造成伤害
            if (target.countCards('h') < 2) {
                await target.damage('fire');
                player.storage.shouyao_used = true;
                return;
            }
            // 选择一项
            let choiceResult = await target.chooseControl('弃置2张牌', '受到1点火属性伤害')
                .set('prompt', '选择一项：1.弃置2张牌;2.受到1点火属性伤害')
                .forResult();
            if (choiceResult.control === '弃置2张牌') {
                await target.chooseToDiscard(2, true, 'h');
            } else {
                await target.damage('fire');
            }
            // 标记技能已成功使用
            player.storage.shouyao_used = true;
        },
        group: ['hlw_shouyao_clear'],
        subSkill: {
            clear: {
                trigger: { player: 'phaseEnd' },
                forced: true,
                content: function (event, trigger, player) {
                    delete player.storage.shouyao_used;
                }
            }
        },
        ai: {
            order: 7,
            result: {
                target: function (player, target) {
                    if (target.group !== player.group) return 0.9;
                    return 0.1;
                },
                player: 1.0
            }
        }
    },
    hlw_baohulu: {
        audio: 2,
        enable: 'phaseUse',
        filter: function (event, player) {
            // 检查手牌中是否有至少3张不同类型的牌
            const cards = player.getCards('h');
            const types = [];
            for (const card of cards) {
                const cardType = get.type(card, false);
                if (!types.includes(cardType)) {
                    types.push(cardType);
                }
            }
            return types.length >= 3 && !player.storage.baohulu_used;
        },
        content: async function (event, trigger, player) {
            // 弃置3张不同类型的牌
            const discardResult = await player.chooseCard('h', 3, '选择弃置3张不同类型的牌')
                .set('complexCard', true)
                .set('filterOk', function () {
                    const selected = ui.selected.cards;
                    if (selected.length !== 3) return false;

                    const types = [];
                    for (let i = 0; i < selected.length; i++) {
                        const cardType = get.type(selected[i], false);
                        if (types.includes(cardType)) {
                            return false;
                        }
                        types.push(cardType);
                    }
                    return true;
                })
                .forResult();
            if (!discardResult.bool) return;
            await player.discard(discardResult.cards);
            // 连横除自己外的所有角色
            const others = game.filterPlayer(current => current !== player && !current.isLinked());
            for (const target of others) {
                player.line(target, 'green');
                target.link();
            }

            // 让一名角色翻面
            const targetResult = await player.chooseTarget('选择一名角色翻面', true).forResult();
            if (!targetResult.bool) return;

            const target = targetResult.targets[0];
            await target.turnOver();

            // 标记技能已成功使用
            player.storage.baohulu_used = true;
        },
        group: ['hlw_baohulu_clear'],
        subSkill: {
            clear: {
                trigger: { player: 'phaseEnd' },
                forced: true,
                content: function (event, trigger, player) {
                    delete player.storage.baohulu_used;
                }
            }
        },
        ai: {
            order: 8,
            result: {
                player: 1.0
            }
        }
    },
    // ==================== 金刚葫芦妹技能 ====================

    hlw_xiongmeitongxin: {
        audio: 2,
        trigger: { global: 'damageBegin' },
        filter: function (event, player) {
            return game.hasPlayer(function (p) {
                return p.group === 'huluwa' &&
                    (p === event.source || p === event.player);
            });
        },
        content: async function (event, trigger, player) {
            // 直接判断伤害来源和目标
            const isHuluwaSource = event.source && event.source.group === 'huluwa';
            const isHuluwaTarget = event.player && event.player.group === 'huluwa';

            if (!isHuluwaSource && !isHuluwaTarget) return;
            // 优先处理伤害来源是葫芦娃的情况
            if (isHuluwaSource) {
                const prompt = event.source === player ?
                    '是否弃置一张牌让自己的伤害+1？' :
                    '是否弃置一张牌让' + get.translation(event.source) + '的伤害+1？';

                const result = await player.chooseToDiscard('h', prompt).forResult();
                if (result.bool) {
                    trigger.num++;
                    player.chat('哥哥们，加油！');
                }
            } else {
                const prompt = event.player === player ?
                    '是否弃置一张牌让自己受到的伤害-1？' :
                    '是否弃置一张牌让' + get.translation(event.player) + '受到的伤害-1？';

                const result = await player.chooseToDiscard('h', prompt).forResult();
                if (result.bool) {
                    trigger.num--;
                    player.chat('我来保护你！');
                }
            }
        },
        ai: {
            order: 7,
            result: {
                player: 1.0
            }
        }
    },

    hlw_qicaihulu: {
        audio: 2,
        trigger: { player: 'phaseUseBegin' },
        filter: function (event, player) {
            return player.countCards('h') >= 2;
        },
        content: async function (event, trigger, player) {
            const result = await player.chooseCard('h', 2, '弃置两张牌发动【七彩葫芦】').forResult();
            if (!result.bool) return;
            await player.discard(result.cards);
            const effects = [
                '大娃之力', '二娃之力', '三娃之力',
                '四娃之力', '五娃之力', '六娃之力', '七娃之力'
            ];
            const randomIndex = Math.floor(Math.random() * effects.length);
            const effect = effects[randomIndex];
            game.log(player, '触发了', effect);

            switch (randomIndex) {
                case 0: // 大娃之力
                    const targets0 = await player.chooseTarget('对一名角色造成2点伤害', true).forResult();
                    if (targets0.bool) await targets0.targets[0].damage(2);
                    break;
                case 1: // 二娃之力
                    await player.draw(3);
                    // 查看一名角色的手牌
                    const viewTarget = await player.chooseTarget('选择一名角色查看其手牌', true).forResult();
                    if (viewTarget.bool) {
                        const target = viewTarget.targets[0];
                        await player.showCards(target.getCards('h'));
                    }
                    break;
                case 2: // 三娃之力
                    await player.changeHujia(2);
                    break;
                case 3: // 四娃之力
                    const targets3 = await player.chooseTarget('对至多两名角色造成火焰伤害', 2, true).forResult();
                    if (targets3.bool) {
                        for (const target of targets3.targets) {
                            await target.damage(1, 'fire');
                        }
                    }
                    break;
                case 4: // 五娃之力
                    const targets4 = await player.chooseTarget('令至多两名角色回复体力(如果体力满,则抽一张牌)', 2, true).forResult();
                    if (targets4.bool) {
                        for (const target of targets4.targets) {
                            if (target.hp < target.maxHp) { // 检查体力是否不满
                                await target.recover();
                            } else {
                                await target.draw();
                            }

                        }
                    }
                    break;
                case 5: // 六娃之力
                    // 本回合不能成为其他角色使用牌的目标
                    player.addTempSkill('hlw_yinshen_effect', { player: 'phaseBegin' });
                    break;
                case 6: // 七娃之力
                    const targets6 = await player.chooseTarget('获得一名角色一张牌并令其翻面', true).forResult();
                    if (targets6.bool) {
                        const target = targets6.targets[0];
                        // 获得一张牌
                        await player.gainPlayerCard(target, 'he', true);
                        // 令其翻面
                        await target.turnOver();
                    }
                    break;
            }
        },
        ai: {
            order: 8,
            result: {
                player: 1.0
            }
        }
    },

    // ==================== 葫芦小金刚技能 ====================
    hlw_qixinguiyi: {
        audio: 2,
        trigger: { player: 'phaseBegin' },
        forced: true,
        content: async function (event, trigger, player) {
            if (player.maxHp < 7) {
                player.maxHp++;
                player.update();
                game.log(player, '的最大体力值+1');
                await player.draw();
            }

            const skills = [
                'hlw_libashanhe',      // 大娃：力拔山河 (索引 0)
                'hlw_qianliyan',         // 二娃：洞察 (索引 1)
                'hlw_gangjintiegu',    // 三娃：钢铁骨 (索引 2)
                'hlw_liehuo',          // 四娃：烈火 (索引 3)
                'hlw_ganlu',           // 五娃：甘露 (索引 4)
                'hlw_yinshen',         // 六娃：隐身 (索引 5)
                'hlw_shouyao'          // 七娃：收妖 (索引 6)
            ];
            for (let i = 0; i < player.maxHp; i++) {
                if (!player.hasSkill(skills[i])) {
                    player.addSkill(skills[i]);
                    game.log(player, '获得了' + get.translation(skills[i]) + '技能');
                }
            }
        },
        ai: { order: 10 }
    },

    hlw_huluzhenhun: {
        audio: 2,
        trigger: { player: 'phaseBegin' },
        filter: function (event, player) {
            return player.maxHp >= 7;
        },
        unique: true,
        forced: true,
        skillAnimation: true,
        animationColor: 'orange',
        content: async function (event, trigger, player) {
            player.chat('七心归一，葫芦镇魂！');
            // 对除了自己以外所有人造成伤害
            const others = game.filterPlayer(function (p) {
                return p !== player;
            });
            for (const other of others) {
                await other.damage(2, 'unreal', 'nohujia');
            }
            player.addSkill('hlw_wudishenqu');
            player.awakenSkill('hlw_huluzhenhun');
            player.insertPhase();
        },
        ai: { order: 10 }
    },

    hlw_wudishenqu: {
        audio: 2,
        trigger: { player: 'damageBegin' },
        lock: true,
        forced: true,
        filter: function (event, player) {
            return event.num > 1;
        },
        content: async function (event, trigger, player) {
            trigger.num--;
            player.chat('铜头铁臂，刀枪不入！内耗不算!');
        },
        mod: {
            maxHandcard: function (player) {
                return Math.floor(player.hp / 2);
            }
        },
        group: ['hlw_wudishenqu_cost'],
        subSkill: {
            cost: {
                trigger: { player: 'phaseEnd' },
                forced: true,
                content: async function (event, trigger, player) {
                    // 每回合消耗：选择减少1点体力上限或1点体力
                    const choice = await player.chooseControl('减少1点体力上限', '减少1点体力')
                        .set('prompt', '无敌神躯需要消耗：选择一项')
                        .forResult();

                    if (choice.control === '减少1点体力上限') {
                        if (player.maxHp > 1) {
                            player.maxHp--;
                            player.update();
                            game.log(player, '的体力上限减少了1点');
                        } else {
                            // 体力上限已到最低，改为减少体力
                            await player.damage();
                            game.log(player, '体力上限已到最低，改为减少1点体力');
                        }
                    } else {
                        await player.damage();
                        game.log(player, '减少了1点体力');
                    }
                }
            }
        },
        ai: {
            order: 10
        }
    },

    // ==================== 老爷子技能 ====================
    hlw_feifu: {
        audio: "ext:搬山道士/audio/skill:1",
        trigger: { global: "phaseBegin" },
        filter: function (event, player) {
            return event.player != player;
        },
        content: async function (event, trigger, player) {
            const target = trigger.player;
            const selectedAxe = ['fire', 'ice', 'thunder', 'poison', 'kami', 'stab'][Math.floor(Math.random() * 6)];
            const natureNames = {
                'fire': '火', 'ice': '冰', 'thunder': '雷',
                'poison': '毒', 'kami': '神', 'stab': '刺'
            };

            player.logSkill('hlw_feifu', target);
            player.chat('吃我一记' + natureNames[selectedAxe] + '斧！');

            const suits = ['club', 'heart', 'diamond', 'spade'];
            const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
            const card = game.createCard('sha',
                suits[Math.floor(Math.random() * suits.length)],
                ranks[Math.floor(Math.random() * ranks.length)],
                selectedAxe
            );
            await player.useCard(card, target, false);
        },
        ai: {
            order: 8,
            result: {
                player: function (player, event) {
                    return event.player !== player ? 1 : 0;
                }
            }
        }
    },
    hlw_laoDangYiZhuang: {
        audio: 2,
        trigger: { player: 'judgeEnd' },
        filter: function (event, player) {
            return event.result && event.result.card;
        },
        content: async function (event, trigger, player) {
            const card = trigger.result.card;
            await player.gain(card, 'gain2');

            if (player.isDamaged()) {
                const result = await player.chooseBool('是否回复1点体力？').forResultBool();
                if (result) {
                    await player.recover();
                }
            }
        },
        ai: {
            order: 8,
            result: {
                player: 1.0
            }
        }
    },
};

export default skill;
