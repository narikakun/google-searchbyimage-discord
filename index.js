const photoSearch = require("./photoSearch");

const { Client, Intents, Permissions } = require("discord.js");
const client = new Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILDS]
});
require("dotenv").config();

client.login(process.env.TOKEN);

client.once("ready", () => console.log(`"${client.user.tag}"で接続しました。画像に指定のリアクションをつけると、検索します。`));

client.on("messageCreate", async message => {
   try {
       if (message.author.bot) return;
       if (!message.attachments.first()) return;
       if (!message.channel.members.get(client.user.id).permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return;
       await message.react("924086490965868585").then(async e => {
           try {
               if (!message.channel.members.get(client.user.id).permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return;
               setTimeout(async () => {
                   try {
                       await e.remove();
                   } catch (err) {
                       console.error(err);
                   }
               }, 10000)
           } catch (err) {
               console.error(err);
           }
       });
   } catch (err) {
       console.error(err);
   }
});

client.on("messageReactionAdd", async (reaction, user) => {
    try {
        if (user.bot) return;
        if (reaction.emoji.id !== "924086490965868585") return;
        if (!reaction.message) return;
        if (!reaction.message.attachments.first()) return;
        let replyMsg = await reaction.message.reply({embeds: [
                {
                    author: {
                        name: "検索中...",
                        icon_url: "https://cdn.discordapp.com/emojis/924092649080766474.gif"
                    },
                    description: `現在検索しています...しばらくお待ちください...`,
                    footer: {
                        name: user.tag,
                        icon_url: user.displayAvatarURL()
                    }
                }
            ]
        })
        let getResult = await photoSearch(reaction.message.attachments.first().url).catch(console.error);
        if (!getResult) {
            await replyMsg.edit({embeds: [
                    {
                        author: {
                            name: "エラー",
                            icon_url: "https://cdn.discordapp.com/emojis/881363355745521684.png"
                        },
                        description: "正常に検索が完了しませんでした...",
                        color: "#FF4173",
                        footer: {
                            name: user.tag,
                            icon_url: user.displayAvatarURL()
                        }
                    }
            ]});
            return;
        }
        let resultString = "";
        for (const resultKey in getResult.results) {
            resultString += `\n- [${getResult.results[resultKey].title}](${getResult.results[resultKey].url})`;
        }
        await replyMsg.edit({embeds: [
                {
                    title: getResult.keyword,
                    description: `${getResult.results.length + 1}件見つかりました。${resultString}`,
                    footer: {
                        name: user.tag,
                        icon_url: user.displayAvatarURL()
                    },
                    thumbnail: {
                        url: getResult.image
                    }
                }
            ]
        })
    } catch (err) {
        console.error(err);
    }
})