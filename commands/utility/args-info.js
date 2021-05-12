module.exports = {
    name: "args-info",
    description: "Information about the arguments provided.",
    guildOnly: false,
    dmOnly: false,
    args: true,
    execute(client, commandName, args, commandCaller, guildEnv, channelEnv) {
        if (args[0] === "foo") {
            return "bar";
        }

        return `Arguments: ${args}\nArguments length: ${args.length}`;
    },
};