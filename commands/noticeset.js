//スパゲッティコードだけど許して！
const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const {jsonkaku,jsonyomu} = require("../main")
try{
module.exports = {
	data: new SlashCommandBuilder()
		.setName('noticeset')
		.setDescription('誰かがvcに参加/退出した際に通知をするかどうかと、通知するチャンネルを設定します')
    .addBooleanOption(o=>
      o.setName("joinnotice")
      .setDescription("誰かがvcに参加した際に通知するかどうかを設定します\n初期値:false")
    )
    .addBooleanOption(o=>
      o.setName("leftnotice")
      .setDescription("誰かがvcに退出した際に通知するかどうかを設定します\n初期値:false")
    )
    .addChannelOption(option =>
		option.setName('channel')
			.setDescription('通知するチャンネルを選んでください')
			.addChannelTypes(ChannelType.GuildText)
    ),
	execute: async function(interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
      await interaction.reply("このコマンドは管理者のみ実行できます。");
      return;
    }
    const dat = jsonyomu("notice");
    if(!dat.some(o=>o.guildid===interaction.guildId.toString())){
      dat.push({guildid:interaction.guildId,joinnotice:false,leftnotice:false,channel:""});
    }
    let joinnoticesitaka=null;
    let leftnoticesitaka=null;
    let channelsitaka=null;
    let kousinmoji="";
    const joinnotice = interaction.options.getBoolean("joinnotice");
    if(joinnotice){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.joinnotice=true;
        }
      });
      joinnoticesitaka=true
    }else if(joinnotice===false){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.joinnotice=false;
        }
      });
      joinnoticesitaka=false
    }

    const leftnotice = interaction.options.getBoolean('leftnotice');
    if(leftnotice){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.leftnotice=true;
        }
      });
      leftnoticesitaka=true
    }else if(leftnotice===false){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.leftnotice=false;
        }
      });
      leftnoticesitaka=false;
    }

    const channel = interaction.options.getChannel('channel');
    if(channel){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.channel=channel.id;
        }
      });
      channelsitaka=channel.id;
    }else{
      
      channelsitaka="";
    }



    if (!(joinnoticesitaka===null)){
      kousinmoji=kousinmoji+`\n・参加を通知する:${joinnoticesitaka}`
    }
    if (!(leftnoticesitaka===null)){
      kousinmoji=kousinmoji+`\n・退出を通知する:${leftnoticesitaka}`
    }
    if (!(channelsitaka===null)){
        kousinmoji=kousinmoji+`\n・通知するチャンネル:${channelsitaka?channelsitaka:"未設定"}`
      }
    jsonkaku("notice",dat);
    if(kousinmoji.trim()===""){
      await interaction.reply("何も更新しませんでした。\n\n現在の設定:"+`\n・参加を通知する:${dat.find(i=>i.guildid===interaction.guildId).joinnotice}`+`\n・退出を通知する:${dat.find(i=>i.guildid===interaction.guildId).leftnotice}`+`\n・通知するチャンネル:${dat.find(i=>i.guildid===interaction.guildId).channel ? dat.find(i=>i.guildid===interaction.guildId).channel : "未設定"}`);
    }else{
      await interaction.reply("内容を更新しました:"+kousinmoji+"\n\n現在の設定:"+`\n・参加を通知する:${dat.find(i=>i.guildid===interaction.guildId).joinnotice}`+`\n・退出を通知する:${dat.find(i=>i.guildid===interaction.guildId).leftnotice}`+`\n・通知するチャンネル:${dat.find(i=>i.guildid===interaction.guildId).channel ? dat.find(i=>i.guildid===interaction.guildId).channel : "未設定"}`);
    }
    
    
	}
};
}catch(e){
  console.error(e);
}