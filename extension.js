import { lib, game, ui, get, ai, _status } from "./main/utils.js";
import { precontent } from "./main/precontent.js";
import { content } from './main/content.js';
import config from "./main/config.js";

// 读取扩展信息
const extensionInfo = await lib.init.promises.json(`${lib.assetURL}extension/搬山道士/info.json`);

let extensionPackage = {
	name: "搬山道士",
	config,
	help: {},
	package: {},
	precontent,
	content,
	files: { character: [], card: [], skill: [], audio: [] },
};

// 复制扩展信息中的内容到 package
Object.keys(extensionInfo)
	.filter(key => key !== "name")
	.forEach(key => {
		extensionPackage.package[key] = extensionInfo[key];
	});

export let type = "extension";
export default extensionPackage;
