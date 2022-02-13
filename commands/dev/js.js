const { VM } = require("vm2");

let vm;
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
        vm = new VM({
            timeout: 1000,
            allowAsync: false,
            sandbox: contextObject,
        });
    },
    passMsg(msg) {
        vm.sandbox["newMsg"] = msg;
        vm.run("this.preprocessmsg(this.newMsg)");
        const replyVal = vm.sandbox["newMsg"].replyVal;
        contextObject["newMsg"] = { };
        return replyVal;
    },
    execute(args, commandCaller, guildEnv, channelEnv) {
        console.log(args);
        const result = vm.run(args);
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