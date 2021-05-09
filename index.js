require("dotenv").config();

const fs = require("fs");
const Discord = require("discord.js");
const { MongoClient } = require("mongodb");

/*
// Set up Express webserver
const express = require("express");
const app = express();
const port = 3000;
*/

// Set up Discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

// Set up mongoDB client
const dbClient = new MongoClient(`mongodb+srv://${process.env.dbUsername}:${process.env.dbPassword}@${process.env.clusterURL}/users?retryWrites=true&w=majority`);

// Take commands from in the command directory
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const Command = require(`./commands/${folder}/${file}`);
        client.commands.set(Command.name, Command);
    }
}

// Log when bot is ready
client.once("ready", () => {
    console.log("Discord client is ready!");
});

// Log when db is ready
dbClient.connect().then(() => console.log("DB client is ready!")).catch(err => console.error(err));

// Parse with bot prefix message and try to execute command
client.on("message", message => {

    if (!message.content.startsWith(process.env.prefix) || message.author.bot) {return;}

    const args = message.content.slice(process.env.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) {return;}

    const command = client.commands.get(commandName);

    if (command.guildOnly && message.channel.type === "dm") {
        return message.reply("I can't execute that command inside DMs!");
    }

    if (command.dmOnly && message.guild != null) {
        return message.reply("I can only execute that command inside DMs!");
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${process.env.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || process.env.defaultCooldown) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("Oh no! I had an error trying to execute that command!");
    }
});

// Login to Discord client
client.login(process.env.TOKEN);

/*
// Webserver listens on ${port} for connections
app.listen(port, () => {
    console.log("Server running on port 3000");
});

// Parsing middleware
app.use(express.urlencoded({ extended: false }));

// Log requests at ${port}
app.use((req, res, next) => {
    console.log(req.params);
    console.log(req.body);
    next();
});
*/