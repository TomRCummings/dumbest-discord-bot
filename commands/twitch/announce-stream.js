// Register a Twitch channel to be announced in a channel whenever the channel goes live
module.exports = {
    name: "announce-stream",
    description: "Register a Twitch channel to be announced in a channel whenever the channel goes live.",
    guildOnly: false,
    dmOnly: true,
    args: true,
    permissions: "MANAGE_MESSAGES",
    execute(message, args) {
        console.log("register twitch channel");
    },
};