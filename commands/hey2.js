// SlashCommandBuilder という部品を discord.js からインポートしています。
// これにより、スラッシュコマンドを簡単に構築できます。
const { SlashCommandBuilder } = require('discord.js');

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
	data: new SlashCommandBuilder()
		.setName('hey2')
		.setDescription('あいさつに反応してbotが返事します2'),
	execute: async function(interaction) {
		await interaction.reply('Hell。');
	},
};