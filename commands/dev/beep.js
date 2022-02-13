module.exports = {
    name: "beep",
    description: "Beep!",
    guildOnly: false,
    dmOnly: false,
    permissions: null,
    args: false,
    execute(args, commandCaller, guildEnv, channelEnv) {
        return "Boop.";
    },
};