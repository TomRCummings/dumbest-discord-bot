require("dotenv").config();

const fs = require("fs");
const { Client, Intents, Collection } = require("discord.js");

// Set up Discord client
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
const client = new Client({ intents: myIntents });
client.commands = new Collection();
client.cooldowns = new Collection();

// Take commands from in the command directory
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const Command = require(`./commands/${folder}/${file}`);
        client.commands.set(Command.name, Command);
    }
}

// Set up persistent global JSON object
let persistent = {};
const p = fs.readFileSync("persist.json");
if (p !== null) {
    persistent = JSON.parse(p);
} else {
    throw Error;
}

let id = 0;
let listenerArr = [];
persistent["on"] = function on(regex, func) {
    const l = { regex, func, id: ++id };
    listenerArr.push(l);
    return l.id;
};

persistent["off"] = function off(id) {
    let l = listenerArr.length;
    listenerArr = listenerArr.filter(l => l.id !== id);
    return listenerArr.length !== l ? "listener removed" : "no such listener";
};

persistent["listenerArr"] = match => listenerArr.filter(l => match.test(l.regex.source))
    .map(l => `${l.id}: ${l.regex}`).join(", ");

persistent["findFuncByID"] = idCheck => listenerArr.find(x => x.id === idCheck).func.toString();

persistent["onmsg"] = function onmsg(msg) {
    listenerArr.map(l => {
        let match = msg["content"].match(l.regex);
        if (match !== null) {
            l.func(msg, ...match.slice(1));
        }
    });
};

persistent["preprocessmsg"] = function preprocess(msg) {
    this.onmsg(msg);
};

// Set the context for VM
if (client.commands.has("js")) {
    client.commands.get("js").setContext(persistent);
}

// Log when bot is ready
client.once("ready", () => {
    console.log("Discord client is ready!");
});

// Parse with bot prefix message and try to execute command
client.on("messageCreate", message => {

    if (message.author.bot) {return;}

    const content = message.content;
    let commandName = "";

    if (content.trim()[0] == ".") {
        if (content.indexOf(" ") != -1) {
            commandName = content.slice(1, content.indexOf(" ") + 1).trim();
        } else {
            commandName = content.slice(1);
        }
        console.log(`commandName is ${commandName}`);
    }

    parseMessageAndExecute(client, commandName, content, message, message.author, message.guild, message.channel);
});

// Login to Discord client
client.login(process.env.TOKEN);

function parseMessageAndExecute(funClient, commandName, content, message, commandCaller, guildEnv, channelEnv) {

    if (content.trim()[0] === "." && funClient.commands.has(commandName)) {
        const trimmedContent = content.slice(content.indexOf(" ")).trim();
        let reply;

        if (commandName != "" && !funClient.commands.has(commandName)) {
            console.log(`No command with ${commandName} found.`);
            reply = `No command with ${commandName} found.`;
            message.reply(reply);
        }

        const command = funClient.commands.get(commandName);

        if (command.guildOnly && channelEnv.type === "dm") {
            reply = "I can't execute that command inside DMs!";
            message.reply(reply);
        }

        if (command.dmOnly && guildEnv != null) {
            reply = "I can only execute that command inside DMs!";
            message.reply(reply);
        }

        if (guildEnv !== null && command.permissions !== null) {
            const authorPerms = channelEnv.permissionsFor(commandCaller);
            if(!authorPerms || !authorPerms.has(command.permissions)) {
                reply = "You do not have the permissions to do this!";
                message.reply(reply);
            }
        }

        if (command.args && !trimmedContent.length) {
            reply = `You didn't provide any arguments, ${commandCaller}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`.${command.name} ${command.usage}\``;
            }

            return reply;
        }

        const { cooldowns } = client;

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
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
            reply = command.execute(trimmedContent, commandCaller, guildEnv, channelEnv);
            message.reply(reply);
        } catch (error) {
            console.error(error);
            reply = ("Oh no! I had an error trying to execute that command!");
            message.reply(reply);
        }
    } else {
        console.log(`Message: ${content}`);
        const strippedMessage = { };
        strippedMessage["content"] = message.cleanContent;
        console.log(strippedMessage["content"]);
        strippedMessage["author"] = message.author;
        strippedMessage["replyVal"] = [];
        strippedMessage["reply"] = function reply(text) {
            this.replyVal.push(text);
        };
        const replyValue = client.commands.get("js").passMsg(strippedMessage);
        console.log(`Reply: ${replyValue}`);
        replyValue.forEach(element => {
            if (typeof element == "string" && element !== "") {
                message.channel.send(element);
            } else if (typeof replyValue == "number") {
                message.channel.send(element.toString());
            }
        });
    }
}