// hey.jsのmodule.exportsを呼び出します。
const { EdgeTTS } = require("node-edge-tts");

// tslint:disable-next-line:no-var-requires
const {generate} = require('cjp')

const path = require("path");
const fs=require("fs");
const dir = path.join(__dirname,"commands");
const files= fs.readdirSync(dir)
const tts = new EdgeTTS({
  voice: 'ja-JP-NanamiNeural',
  lang: 'ja-JP'
});
// discord.jsライブラリの中から必要な設定を呼び出し、変数に保存します
const { Client, Events, GatewayIntentBits, Partials, WebhookClient, ChannelType,   } = require('discord.js');
const { getVoiceConnection, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");

// 設定ファイルからトークン情報を呼び出し、変数に保存します
const {token}=require("./env.json")
// クライアントインスタンスと呼ばれるオブジェクトを作成します
//guildvoicestatesを忘れないようにしよう
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
	],
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember,
	],
});

// クライアントオブジェクトが準備OKとなったとき一度だけ実行されます
client.once(Events.ClientReady, c => {
	console.log(`準備OKです! ${c.user.tag}がログインします。`);
  setInterval(()=>{
    client.user.setPresence({"status":"online","activities":[{"name":`${client.voice.adapters.size}個のVCで稼働中！`}]})
  },3000)
});


const guildStates = new Map();

// 各サーバーの初期化
function initializeGuildState(guildId) {
    if (!guildStates.has(guildId)) {
        guildStates.set(guildId, {
            player: undefined,
            queue: [],
            playfile: undefined
        });
    }
}


function play(guildid,filename){
  const state = guildStates.get(guildid);
    if (!state) return;

    state.queue.push(filename);
  

  if (state.player === undefined) {
    // playerの生成
    state.player = createAudioPlayer();
    state.player.on(AudioPlayerStatus.Idle, () => {
        // idle移行時前回再生したファイルの削除
        if (state.playfile !== undefined) {
            fs.unlink(state.playfile, (err) => {
                if (err) console.log(err);
            });
        }
        // idle移行時にキューから取得して再生
        if (state.queue.length > 0) {
            state.playfile = state.queue.shift();
            state.player.play(createAudioResource(state.playfile));
        }
    });
    getVoiceConnection(guildid).subscribe(state.player);
  }
  // idle時の再生用
  if (AudioPlayerStatus.Idle === state.player.state.status && state.queue.length > 0) {
      state.playfile = state.queue.shift();
      state.player.play(createAudioResource(state.playfile));
  }
}

client.on("voiceStateUpdate",async(oldstate,newstate)=>{
  try{
  const oldChannel = oldstate.channel;
  const newChannel = newstate.channel;

  if (newChannel && newChannel.id !== oldChannel?.id) {


    if(jsonyomu("notice").some(o=>o.guildid===newstate.guild.id.toString())){
      if(jsonyomu("notice").find(i=>i.guildid===newstate.guild.id.toString()).joinnotice){
        const user=newstate.member;
        if(user.user.bot){
          return;
        }
        if(jsonyomu("notice").find(i=>i.guildid===newstate.guild.id.toString()).channel===""){
          return;
        }
        const channel = client.channels.cache.get(jsonyomu("notice").find(i=>i.guildid===newstate.guild.id.toString()).channel);
        await channel.send(`# vc参加\n**${user.user.displayName}**さんが <#${newstate.channelId}> に参加しました`);
      }
    }


    const connection = getVoiceConnection(newChannel.guild.id);
    if (connection && connection.joinConfig.channelId === newChannel.id) {
      if(jsonyomu("server").some(o=>o.guildid===newstate.guild.id.toString())){
        if(jsonyomu("server").find(i=>i.guildid===newstate.guild.id.toString()).readjoinleft){
          const patha = `./soundcache/${newstate.guild.id}_${Date.now()}.wav`
          const user=newstate.member;
          let yomi;
          if(user.user.id===client.user.id){
            yomi = "読み上げを開始します！"
          }else{
            yomi = user.user.bot ? `ボットの${user.user.displayName}が参加しました` : `${user.user.displayName}さんが参加しました`;
          }
          initializeGuildState(newstate.guild.id);
          await tts.ttsPromise(yomi,patha);
          play(newstate.guild.id,patha);
        }
      }
    }
  }
  try{
  if (oldstate.member.id === client.user.id && oldstate.channel && !newstate.channel) {
    fs.readdir("./soundcache/", (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err}`);
        return;
      }
      // ギルドIDを含むファイルを探す
      const matchingFiles = files.filter(file => file.includes(oldstate.guild.id));
  
      matchingFiles.forEach(file => {
        const filePath = path.join("./soundcache/", file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file}: ${err}`);
          } else {
          }
        });
      });
    });
  }

  }catch(e){
    console.error(e)
  }

  

  // ユーザーがボイスチャンネルから退出した場合のみ処理
  if (oldChannel && oldChannel.id !== newChannel?.id) {

    if(jsonyomu("notice").some(o=>o.guildid===newstate.guild.id.toString())){
      if(jsonyomu("notice").find(i=>i.guildid===newstate.guild.id.toString()).leftnotice){
        const user=oldstate.member;
        if(user.user.bot){
          return;
        }
        if(jsonyomu("notice").find(i=>i.guildid===newstate.guild.id.toString()).channel===""){
          return;
        }
        const channel = client.channels.cache.get(jsonyomu("notice").find(i=>i.guildid===newstate.guild.id.toString()).channel);
        await channel.send(`# vc退出\n**${user.user.displayName}**さんが <#${oldstate.channelId}> から退出しました`);
      }
    }



    const botId = client.user.id;
    const connection = getVoiceConnection(oldChannel.guild.id);
    // BotがそのVCに接続している場合
    if (connection && connection.joinConfig.channelId === oldChannel.id) {
      // チャンネルにいるメンバーを確認
      const members = oldChannel.members;
      const nonBotMembers = members.filter(member => !member.user.bot);
      const otherBots = members.filter(member => member.user.bot && member.id !== botId);

      // Bot以外のメンバーがいない場合
      
      if (nonBotMembers.size === 0 && otherBots.size === 0) {
        const jsonkesutame = jsonyomu("nowyomi");
        const jsonkesutame2 = jsonkesutame.filter(o=>o.channelid!==oldChannel.id)
        jsonkaku("nowyomi",jsonkesutame2)
        const state = guildStates.get(oldstate.guild.id);
        state.player=undefined;
        connection.destroy(); // BotがVCから切断
      }



      
      if(jsonyomu("server").some(o=>o.guildid===oldstate.guild.id.toString())){
        if(jsonyomu("server").find(i=>i.guildid===oldstate.guild.id.toString()).readjoinleft){
          const patha = `./soundcache/${oldstate.guild.id}_${Date.now()}.wav`
          const user=oldstate.member;
          const yomi = user.user.bot ? `ボットの${user.user.displayName}が退出しました` : `${user.user.displayName}さんが退出しました`;
          initializeGuildState(oldstate.guild.id);
          await tts.ttsPromise(yomi,patha);
          play(oldstate.guild.id,patha);
        }
      }
    }
    //抜けたら抜ける？
    //読み上げる？
    //botがどこにも参加していなくて、ユーザーが入退室しても反応しないようになってる？      
  }
}catch(e){
  console.error(e);
}
})

function ikaryaku(str,nagasa) {
  if (str.length > nagasa) {
    return str.slice(0, nagasa) + '以下略';
  }
  return str;
}


// 変数の値を変更する関数
function setSharedVariable(guildid) {
  const state = guildStates.get(guildid);
  state.player=undefined;
}


client.on(Events.MessageCreate,async(msg)=>{
  if(msg.channel.type===ChannelType.DM||msg.channel.type===ChannelType.GroupDM){
    return;
  }
  let bool=false;
  // if((await msg.member.fetch()).roles.cache.size=0)return;　いるかな？わからん
  for (const role of (await msg.member.fetch()).roles.cache){
    if ((role[1].name.includes("怪レい")||role[1].name.includes("怪しい"))&&role[1].name.includes("日本語")){
      bool=true;
      break;
    }else{
      bool=false;
    }
  }
  if(!bool)return;
  msg.reply({"content":generate(msg.content),"allowedMentions":{"repliedUser":false}});
});

client.on(Events.MessageCreate,async (msg)=>{
  if(msg.channel.type===ChannelType.DM||msg.channel.type===ChannelType.GroupDM){
    return;
  }
  if (msg.author.bot)return;

  const jsondata=jsonyomu("nowyomi");
  
  const jsodatanaka=jsondata.some(obj=>obj.yomikomichan===msg.channelId.toString());
  if(!jsodatanaka){
    return;
  }
  const connection = getVoiceConnection(msg.guildId);
  if(!connection){
    return;
  }

  if(msg.content.charAt(0)===".")return;

  let yomimoji = msg.content.replace(/https:\/\/.*/, "、リンク省略").replace(/</, "、").replace(/>/, "、");
  yomimoji = yomimoji.replace(/@(\d+)/g, (match, number) => {
    // 配列内から対応するオブジェクトを検索
    const replacement = msg.guild.members.cache.find(item => item.id === number);
    // 対応する名前があればそれに置換、なければ元の文字列を返す
    return replacement ? replacement.displayName+"さんへのメンション、" : match;
  });
  yomimoji=ikaryaku(yomimoji,100).toString();
  if(jsonyomu("server").some(o=>o.guildid===msg.guildId.toString())){
    const aaaaaa = jsonyomu("nowyomi").find(i=>i.guildid===msg.guildId.toString());
    if(jsonyomu("server").find(i=>i.guildid===msg.guildId.toString()).readname&&(aaaaaa.zenkaiuser===undefined||aaaaaa.zenkaiuser.toString()!==msg.author.id.toString())){
      
      yomimoji = msg.author.displayName.toString() + "、、" + yomimoji.toString();
      aaaaaa.zenkaiuser=msg.author.id.toString();
      const data = jsonyomu("nowyomi");
      // idが32のオブジェクトを探して更新
      const target = data.find(obj => obj.guildid === msg.guildId.toString());
      if (target) {
          target.zenkaiuser = msg.author.id.toString();
      }
      jsonkaku("nowyomi",data)
    }
  }
  initializeGuildState(msg.guildId);
  const patha = `./soundcache/${msg.guild.id}_${Date.now()}.wav`
  try{
    await tts.ttsPromise(yomimoji,patha);
  }catch(e){
    await tts.ttsPromise("音声生成にエラーが発生しました",patha);
    await msg.reply({
      content: 'このメッセージで音声生成にエラーが発生しました', // 返信メッセージ
      allowedMentions: { repliedUser: false }, // メンションを無効化
    });

  }
  play(msg.guildId,patha)
  
});


function off(){
  const directoryPath="./soundcache"
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = fs.lstatSync(filePath);
      if (stat.isDirectory()) {
      clearDirectorySync(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }
  jsonkaku("nowyomi",[])
  client.destroy();
  process.exit(0);
}

process.on("exit",()=>{
  off();
});

process.on("SIGINT",()=>{
  off();
});

process.on("uncaughtException",(e)=>{
  console.log(e.name+"\n\n",e.message+"\n"+e.stack)
  off();
});

//スラッシュコマンドに応答するには、interactionCreateのイベントリスナーを使う必要があります
client.on(Events.InteractionCreate, async interaction => {
    // スラッシュ以外のコマンドの場合は対象外なので早期リターンさせて終了します
    // コマンドにスラッシュが使われているかどうかはisChatInputCommand()で判断しています
    if (!interaction.isChatInputCommand()) return;
    if(interaction.channel.type===ChannelType.DM||interaction.channel.type===ChannelType.GroupDM){
      interaction.reply("DMでのコマンドはサポートしておりません")
      return;
    }
    for (const com of files){    
    // heyコマンドに対する処理
    const module= require(path.join(dir,com));
      if (interaction.commandName === module.data.name) {
        try {
            await module.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
      }
    }
  
});


function jsonyomu(filename){
  const filePath=path.join(__dirname,`/data/${filename}.json`);
  return JSON.parse(fs.readFileSync(filePath,'utf8'));
}

function jsonkaku(filename,data){
  const filePath=path.join(__dirname,`/data/${filename}.json`);
  const nakadata = JSON.stringify(data,null,2);
  fs.writeFileSync(filePath,nakadata,'utf8');
}

module.exports={
  jsonyomu,
  jsonkaku,
  setSharedVariable
}

// ログインします
client.login(token);