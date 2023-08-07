const {MongoClient} = require("mongodb");
let database;

async function initDb(){
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    database = client.db("blog");
}

function getDb(){
    try{
        if(!database){
            throw "failed to get database"
        }
    }
    catch(error){
        console.log(error);
    }
    return database;
}

module.exports = {
    initDb: initDb,
    getDb: getDb
}