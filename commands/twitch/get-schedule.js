// Command to get stream schedule for a user who has registered it
module.exports = {
    name: "get-schedule",
    description: "Get a user's streaming schedule (if they've registered it with me)!",
    guildOnly: false,
    dmOnly: false,
    args: true,
    execute(message, args) {
        console.log("retreiving stream schedule for this user");
    },
};