module.exports = {
    name: "ping",
    description: "Ping!",
    execute(client, commandName, args, commandCaller, guildEnv, channelEnv) {
        return "Pong.";
    },
};