const { SlashCommandBuilder } = require('discord.js');
const {joinVoiceChannel}= require("@discordjs/voice");
const {jsonkaku,jsonyomu} = require("../main");



module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('vcに接続して読み上げを開始します')
    ,
	execute: async function(interaction) {
    const guild = interaction.guild;
    let member = guild.members.cache.get(interaction.member.id) 
		          || await guild.members.fetch({ user: interaction.member.id, force: true });
    
        let memberVC = member.voice.channel;

        let jibun = guild.members.cache.get(interaction.client.user.id) 
		         || await guild.members.fetch({ user: interaction.client.user.id, force: true });

        let jibunvc=jibun.voice.channel;
        if (!memberVC) {
            await interaction.reply("接続先のVCが見つかりません。");
            return;
        }
        if(jibunvc){
          await interaction.reply("すでにどこかのVCに接続しています。");
            return;
        }
        if (!memberVC.joinable) {
            await interaction.reply("VCに接続できません。");
            return;
        }
        if (!memberVC.speakable) {
            await interaction.reply("VCで音声を再生する権限がありません。");
            return;
            
        }
        let connection = joinVoiceChannel({
          guildId: guild.id,
          channelId: memberVC.id,
          adapterCreator: guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: true,
        });
        const jsonkakutame=jsonyomu("nowyomi");
        jsonkakutame.push({guildid:guild.id,channelid:memberVC.id,yomikomichan:interaction.channelId,zenkaiuser:undefined})
        jsonkaku("nowyomi",jsonkakutame)
        await interaction.reply('VCに参加しました');
        return;
	},
};