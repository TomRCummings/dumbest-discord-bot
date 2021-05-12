require("dotenv").config();

const fs = require("fs");
const Discord = require("discord.js");
const mongoUtil = require("./mongoUtil");

mongoUtil.connectToServer(function(err, mongoClient) {
    if (err) {
        console.error(err);
        return;
    }
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

    // Parse with bot prefix message and try to execute command
    client.on("message", message => {

        if (!message.content.startsWith(process.env.prefix) || message.author.bot) {return;}

        const args = message.content.slice(process.env.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        return message.reply(parseCommandAndExecute(client, commandName, args, message.author, message.guild, message.channel));
    });

    client.ws.on("INTERACTION_CREATE", async interaction => {
        console.log("Interaction created.");

        const commandName = interaction.data.name;
        const args = new Discord.Collection();

        if (typeof interaction.options !== "undefined") {
            for (const interactionOption of interaction.options) {
                args.set(interactionOption.name, interactionOption.value);
            }
        }

        let interactionAuthor;
        if (typeof interaction.member !== "undefined") {
            interactionAuthor = interaction.member.user;
        } else {
            interactionAuthor = interaction.user;
        }

        let interactionGuild;
        if (typeof interaction.user !== "undefined") {
            interactionGuild = null;
        } else {
            interactionGuild = await client.guilds.fetch(interaction.guild_id);
        }

        const interactionChannel = await client.channels.fetch(interaction.channel_id);
        const replyContent = parseCommandAndExecute(client, commandName, args, interactionAuthor, interactionGuild, interactionChannel);
        console.log(replyContent);
        client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
            type: 4,
            data: {
                content: replyContent,
            },
        } });

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
});

function parseCommandAndExecute(client, commandName, args, commandCaller, guildEnv, channelEnv) {
    let reply;

    if (!client.commands.has(commandName)) {return;}

    const command = client.commands.get(commandName);

    if (command.guildOnly && channelEnv.type === "dm") {
        reply = "I can't execute that command inside DMs!";
        return reply;
    }

    if (command.dmOnly && guildEnv != null) {
        reply = "I can only execute that command inside DMs!";
        return reply;
    }

    if (guildEnv != null && command.permissions) {
        const authorPerms = channelEnv.permissionsFor(commandCaller);
        if(!authorPerms || !authorPerms.has(command.permissions)) {
            reply = "You do not have the permissions to do this!";
            return reply;
        }
    }

    if (command.args && !args.length) {
        reply = `You didn't provide any arguments, ${commandCaller}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${process.env.prefix}${command.name} ${command.usage}\``;
        }

        return reply;
    }

    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || process.env.defaultCooldown) * 1000;

    if (timestamps.has(commandCaller.id)) {
        const expirationTime = timestamps.get(commandCaller.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            reply = `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`;
            return reply;
        }
    }

    timestamps.set(commandCaller.id, now);
    setTimeout(() => timestamps.delete(commandCaller.id), cooldownAmount);

    try {
        reply = command.execute(client, commandName, args, commandCaller, guildEnv, channelEnv);
    } catch (error) {
        console.error(error);
        reply = ("Oh no! I had an error trying to execute that command!");
    }

    return reply;
}