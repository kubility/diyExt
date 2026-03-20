/** @type { importCharacterConfig['character'] } */
const character = {

	// 刘海柱
	wezy_liuhuizhu: {
		sex: "male",
		group: "qun",
		hp: 4,
		skills: ["wezy_xiayi", "wezy_xiuche", "wezy_dantiao"],
	},


};
for (let i in character) {
	character[i].img = "extension/搬山道士/image/character/wezy/" + i + ".jpg";
}
export default character;
