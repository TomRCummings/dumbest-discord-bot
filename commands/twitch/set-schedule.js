// Command to set a streaming schedule for the user who calls the command; only manual entry for now.
module.exports = {
    name: "set-schedule",
    description: "Set your streaming schedule! Enter it manually for now (hopefully Twitch will add a schedule endpoint to their API in the future).",
    guildOnly: false,
    dmOnly: true,
    args: true,
    execute(message, args) {
        if (args[0] === "manual") {
            console.log("entering schedule manually");
        }
    },
};