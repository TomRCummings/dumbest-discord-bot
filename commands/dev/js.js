const vm = require("vm");

let contextObject = { };

module.exports = {
    name: "js",
    description: "Arbitrary code execution on demand.",
    guildOnly: false,
    dmOnly: false,
    permissions: null,
    args: false,
    setContext(contextToSet) {
        contextObject = contextToSet;
        vm.createContext(contextObject);
    },
    passMsg(msg) {
        contextObject["newMsg"] = msg;
        vm.runInContext("this.preprocessmsg(this.newMsg)", contextObject);
        const replyVal = contextObject["newMsg"].replyVal;
        contextObject["newMsg"] = { };
        return replyVal;
    },
    execute(args, commandCaller, guildEnv, channelEnv) {
        const result = vm.runInContext(args, contextObject);
        if ((typeof result) == "number" || (typeof result) == "boolean") {
            return result.toString();
        } else if ((typeof result) == "string") {
            return result;
        } else if ((typeof result) == "object") {
            return JSON.stringify(result);
        } else if ((typeof result) == "function") {
            return "Function, which I can't stringify!";
        } else if ((typeof result) == "undefined") {
            return "Undefined, but something happened!";
        }
    },
};