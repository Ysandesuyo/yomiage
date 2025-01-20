const { SlashCommandBuilder } = require('discord.js');
const {getVoiceConnection}= require("@discordjs/voice");
const {jsonkaku,jsonyomu,setSharedVariable} = require("../main");


module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('vcから切断して読み上げを終了します'),
	execute: async function(interaction) {
    const guild = interaction.guild;
    let member = await guild.members.cache.get(interaction.member.id) 
    || await guild.members.fetch({ user: interaction.member.id, force: true });

        let jibun = await guild.members.cache.get(interaction.client.user.id) 
		         || await guild.members.fetch({ user: interaction.client.user.id, force: true });

        
        let memberVC = member.voice.channel;
        let jibunvc=jibun.voice.channel;
        if(!jibunvc){
          await interaction.reply("そもそも接続していません。");
            return;
        }
        const jsonkesutame = jsonyomu("nowyomi");
        const jsonkesutame2 = jsonkesutame.filter(o=>o.channelid!==member.voice.channelId)
        jsonkaku("nowyomi",jsonkesutame2)

          const connection = getVoiceConnection(interaction.guild.id)
          // ボイスチャネルから切断
          setSharedVariable(interaction.guild.id)
          connection.destroy();

          
        
        await interaction.reply('VCから退出しました');
	},
};