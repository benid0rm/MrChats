const Discord = require('discord.js');
const { token, intentsArray } = require('./config.json');
const intents = new Discord.Intents(intentsArray);

const db = require('quick.db');



const client = new Discord.Client({ disableEveryone: true, intents });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! ${new Date().toISOString()}`);
});

client.on("messageCreate", async message => {
  try {
    updateMessageCount(message);
  } catch (err) {
    console.log(err);
  }

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  const prefix = ">";

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  console.log(`${message.author.username} ran the command ${command} in ${message.channel}`);

  if (command == "ping") {
    message.reply("Pong!");
  }

  if (command == "globalupdate") {
    // get all messages
    // update channel stats
    // update user stats
    // get daily stats
    // get user-user stats

    try {
      let channels = await message.guild.channels.fetch();

      channels.forEach(async channel => {
        if (channel.type === "GUILD_TEXT") {
          await fetchChannelMessageCount(channel);
          message.channel.send(`Stats updated for ${channel.name}!`);
        }
      });

      message.channel.send(`Stats updated for ${message.guild.name}!`);

    } catch (err) {
      console.log(err);
      message.reply("Something went wrong!");
    }
  }

  if (command == "help") {

  }
});

client.login(token);

// /**
//  * @param  {Discord.Message} message
//  */
// const updateMessageCount = async (message) => {
//   await db.add(`${message.author.id}.${message.channel.id}.messages`, 1);
// }

/**
 * @param  {Discord.Channel} channel
 */
const getMessagesForChannel = async (channel) => {
  let messages = await fetchAllChannelMessages(channel);

  // TODO: FIND BETTER HOME
  // messages.forEach(async message => {
  //   await updateMessageCount(message);
  // });

  return messages;
};

const fetchAllChannelMessages = async (channel) => {
  /**
   * @type {Discord.Collection<string, Discord.Message>}
   */
  let lastID;
  let messages = [];
  while (true) { // eslint-disable-line no-constant-condition
    /**
     * @type {Discord.Collection<string, Discord.Message>}
     */
    const fetchedMessages = await channel.messages.fetch({
      limit: 100,
      ...(lastID && { before: lastID }),
    });
    if (fetchedMessages.size === 0) {
      return messages;
    }
    messages = messages.concat(Array.from(fetchedMessages.values()));
    lastID = fetchedMessages.lastKey();
  };
};
