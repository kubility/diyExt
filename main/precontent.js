import { lib, game, ui, get, ai, _status } from "./utils.js";

/**
 * 扩展预加载内容
 * @param { object } config 扩展配置
 * @param { object } pack 扩展包内容
 */
export async function precontent(config, pack) {
	/**
	 * 同时加载多个扩展包
	 * @param { string } packName 分组名称
	 * @param { string } displayName 显示名称
	 * @param { string[] } types 类型数组
	 * @returns { Promise<boolean> }
	 */
	async function loadPack(packName, displayName, types) {
		try {
			let extensions = [];
			for (let type of types) {
				extensions.push(import(`../${type}/${packName}/index.js`));
			}
			await Promise.all(extensions);
			for (let type of types) {
				lib.translate[`${packName}_${type}_config`] = displayName;
			}
			return true;
		} catch (err) {
			console.error(`加载扩展包"${packName}"失败：`, err);
			return false;
		}
	}

	// 加载电视剧/影视角色分组
	if (lib.config.extension_搬山道士_tv) {
		await loadPack("tv", "影鬼", ["character"]);
		console.log("影视角色分组加载完成");
	}

	// 加载网络梗角色分组
	if (lib.config.extension_搬山道士_net) {
		await loadPack("net", "网鬼", ["character"]);
		console.log("网络梗角色分组加载完成");
	}

	// 加载另类角色分组
	if (lib.config.extension_搬山道士_other) {
		await loadPack("other", "其他鬼畜", ["character"]);
		console.log("另类角色分组加载完成");
	}

	// 加载异形分组
	if (lib.config.extension_搬山道士_yxsj) {
		await loadPack("yxsj", "异形世界", ["character"]);
		console.log("异形分组加载完成");
	}
	// 加载葫芦娃分组
	if (lib.config.extension_搬山道士_huluwa) {
		// 添加葫芦娃势力
		lib.group.push('huluwa'); // 添加势力
		lib.translate.huluwa = '葫'; // 势力翻译
		lib.translate.huluwaColor = "#FFFF00"; // 文字颜色（疑似失效）
		lib.groupnature.huluwa = 'metal'; // 描边颜色
		await loadPack("huluwa", "葫芦兄弟", ["character"]);
		console.log("葫芦兄弟分组加载完成");
	}

	// 加载万恶之源分组
	if (lib.config.extension_搬山道士_wezy) {
		// 添加妖势力
		lib.group.push('yao');
		lib.translate.yao = '妖';
		lib.translate.yaoColor = '#FF00FF';
		lib.groupnature.yao = 'thunder';
		await loadPack("wezy", "万恶之源", ["character"]);
		console.log("万恶之源分组加载完成");
	}

	//================格叽格叽格叽格叽====================
	//加载卡牌
	if (lib.config.extension_搬山道士_dgch) {
		await loadPack("dgch", "专属神器", ["card"]);
		console.log("专属神器卡牌分组加载完成");
	}


}
