module.exports = {
    name: "ping",
    description: "Ping!",
    guildOnly: false,
    dmOnly: false,
    permissions: null,
    args: false,
    execute(args, commandCaller, guildEnv, channelEnv) {
        return "Pong.";
    },
};