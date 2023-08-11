const {MongoClient} = require("mongodb");

let mongodbUrl = "mongodb://127.0.0.1:27017/";

if(process.env.MONGODB_URL){
    mongodbUrl = process.env.MONGODB_URL;
}

let database;

async function initDb(){
    const client = await MongoClient.connect(mongodbUrl);
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