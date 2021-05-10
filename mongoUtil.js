const { MongoClient } = require("mongodb");

let _db;

module.exports = {
    connectToServer: function(callback) {
        const dbClient = new MongoClient(`mongodb+srv://${process.env.dbUsername}:${process.env.dbPassword}@${process.env.clusterURL}/users?retryWrites=true&w=majority`, { useUnifiedTopology: true, useNewUrlParser: true });
        dbClient.connect(function(err, client) {
            console.log("MongoDB client is ready!");
            _db = client.db("discord-bot");
            return callback(err);
        });
    },
    getDb: function() {
        return _db;
    },
};