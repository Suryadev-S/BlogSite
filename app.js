const path = require('path');
const routes = require("./routes/routes");
const db = require('./databaseConn/connection');
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session");
const express = require("express");
const app = express();

const MongoDBStore = mongodbStore(session);

const sessionStore = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    databaseName: "blog",
    collection: "sessions"
})

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:false}));
app.use(session({
    secret: "super secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}))
app.use((req,res,next)=>{
    const user = req.session.user;
    if(!user){
        return next();
    }
    res.locals.user = user;
    next();
})
app.use(routes);

app.set("view engine","ejs");

db.initDb().then(()=>{
    app.listen(3000 || process.env.PORT,()=>{
        console.log("port and database connected");
})
})