//スパゲッティコードだけど許して！
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {jsonkaku,jsonyomu} = require("../main")
try{
module.exports = {
	data: new SlashCommandBuilder()
		.setName('readset')
		.setDescription('サーバーに対する設定をします(これ以外も別コマンドで作成予定)')
    .addBooleanOption(o=>
      o.setName("readname")
      .setDescription("名前を読み上げるかどうかを設定します\n初期値:false")
    )
    .addBooleanOption(o=>
      o.setName("readjoinleft")
      .setDescription("参加/退出を読み上げるかどうかを設定します\n初期値:false")
    ),
	execute: async function(interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
      await interaction.reply("このコマンドは管理者のみ実行できます。");
      return;
    }
    const dat = jsonyomu("server");
    if(!dat.some(o=>o.guildid===interaction.guildId.toString())){
      dat.push({guildid:interaction.guildId,readname:false,readjoinleft:false});
    }
    let readnamesitaka=null;
    let readjoinleftsitaka=null;
    let kousinmoji="";
    const readname = interaction.options.getBoolean('readname');
    if(readname){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.readname=true;
        }
      });
      readnamesitaka=true
    }else if(readname===false){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.readname=false;
        }
      });
      readnamesitaka=false
    }

    const readjoinleft = interaction.options.getBoolean('readjoinleft');
    if(readjoinleft){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.readjoinleft=true;
        }
      });
      readjoinleftsitaka=true
    }else if(readjoinleft===false){
      dat.forEach(item=>{
        if(item.guildid===interaction.guildId){
          item.readjoinleft=false;
        }
      });
      readjoinleftsitaka=false;
    }


    if (!(readnamesitaka===null)){
      kousinmoji=kousinmoji+`\n・名前を読み上げる:${readnamesitaka}`
    }
    if (!(readjoinleftsitaka===null)){
      kousinmoji=kousinmoji+`\n・参加/退出を読み上げる:${readjoinleftsitaka}`
    }
    jsonkaku("server",dat);
    if(kousinmoji.trim()===""){
      await interaction.reply("何も更新しませんでした。\n\n現在の設定:"+`\n・名前を読み上げる:${dat.find(i=>i.guildid===interaction.guildId).readname}`+`\n・参加/退出を読み上げる:${dat.find(i=>i.guildid===interaction.guildId).readjoinleft}`)
    }else{
      await interaction.reply("内容を更新しました:"+kousinmoji+"\n\n現在の設定:"+`\n・名前を読み上げる:${dat.find(i=>i.guildid===interaction.guildId).readname}`+`\n・参加/退出を読み上げる:${dat.find(i=>i.guildid===interaction.guildId).readjoinleft}`);
    }
    
    
	}
};
}catch(e){
  console.error(e);
}