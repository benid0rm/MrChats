const Discord = require('discord.js');
const { token, intentsArray, prefix } = require('./config.json');
const intents = new Discord.Intents(intentsArray);

const client = new Discord.Client({ disableEveryone: true, intents });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! ${new Date().toISOString()}`);
});

client.on("messageCreate", async message => {

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log(`${message.author.username} ran the command ${command} in ${message.channel}`);

  if (command == "ping") {
    pingCommand(message);
  }

  if (command == "globalupdate") {
    globalUpdateCommand(message);
  }
});

client.login(token);

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

const fetchAllGuildMessages = async (message, channels) => {
  let messages = [];

  channels.forEach(async channel => {
    if (channel.type === "GUILD_TEXT") {
      let fetchedMessages = await fetchAllChannelMessages(channel);
      messages = messages.concat(Array.from(fetchedMessages.values()));
      message.channel.send(`Stats updated for ${channel.name} - ${fetchedMessages.length} messages!`);
    }
  });
}

// Commands

const pingCommand = async (message) => {
  message.reply("Pong!");
};

const globalUpdateCommand = async (message) => {
  let channels = await message.guild.channels.fetch();

  await fetchAllGuildMessages(message, channels).then(messages => {
    message.channel.send(`Stats updated for ${message.guild.name} - ${messages.length} total messages!`);
  });
};