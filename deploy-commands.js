// discord.js v14では、下記のようにRESTとRoutesはdiscord.jsパッケージから直接インポートできます
const { REST, Routes } = require('discord.js');

// hey.jsのmodule.exportsを呼び出します。
const path = require("path");
const fs=require("fs");
const dir = path.join(__dirname,"commands");
const files= fs.readdirSync(dir)

// 環境変数としてapplicationId, guildId, tokenの3つが必要です
const {token,appid} = require("./env.json");

// 登録コマンドを呼び出してリスト形式で登録
let commands = [];
for (const dsds of files){
  const module= require(path.join(dir,dsds));
  commands.push(module.data.toJSON())
}

// DiscordのAPIには現在最新のversion10を指定
const rest = new REST({ version: '10' }).setToken(token);

// Discordサーバーにコマンドを登録
(async () => {
    try {
        await rest.put(
			Routes.applicationCommands(appid),
			{ body: commands },
		);
        console.log('サーバー固有のコマンドが登録されました！');
    } catch (error) {
        console.error('コマンドの登録中にエラーが発生しました:', error);
    }
})();