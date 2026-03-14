import { lib, game, ui, get, ai, _status } from "./utils.js";

const config = {
	tip: {
		name: ui.joint`
			<hr aria-hidden="true">
			<div style="display: flex; justify-content: center">
				<span class="bold">逗B武将</span>
			</div>
			<br />
		`,
		clear: true,
	},
	// 在这里添加配置项
	// 示例配置：
	// wuxing: {
	// 	name: "五行生克",
	// 	init: false,
	// 	intro: "每名角色和部分卡牌在游戏开始时随机获得一个属性",
	// },

	// 电视剧/影视角色分组
	tv: {
		name: "影鬼",
		init: true,
		intro: "影视剧大鬼畜系列",
	},

	// 网络梗角色分组
	net: {
		name: "网鬼",
		init: true,
		intro: "网络流行梗大鬼畜系列",
	},

	// 另类角色分组
	other: {
		name: "其他鬼",
		init: true,
		intro: "其他类型的角色",
	},

	// 异形分组
	yxsj: {
		name: "异形世界",
		init: true,
		intro: "异形系列角色",
	},
	// 葫芦娃
	huluwa: {
		name: "葫芦娃",
		init: true,
		intro: "葫芦娃系列角色",
	},
	tip2: {
		name: ui.joint`
			<hr aria-hidden="true">
			<div style="display: flex; justify-content: center">
				<span class="bold">卡牌组</span>
			</div>
			<br />
		`,
		clear: true,
	},
	// 鬼畜
	dgch: {
		name: "专属神器",
		init: true,
		intro: "专属神器",
	},
	tip3: {
		name: ui.joint`
			<hr aria-hidden="true">
		`,
		clear: true,
	},
};

export default config;
