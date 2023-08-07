const express = require("express");
const db = require("../databaseConn/connection");
const marked = require("marked");
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { ObjectId } = require("mongodb");
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const router = express.Router()

const markedOptions = {
    mangle: false,
    headerIds: false,
    headerPrefix: "",
  };

router.get("/",async (req,res)=>{
    const allBlogs = await db.getDb().collection("blogs").find().toArray();
    res.render("home",{allBlogs: allBlogs});
})

router.get("/login",(req,res)=>{
    res.render("login");
})

router.get("/signup",(req,res)=>{
    res.render("signup");
})

router.post("/signup",async (req,res)=>{
    const signupDetails = req.body;
    const existingUser = await db.getDb().collection("users").findOne({username: signupDetails.username});
    if(existingUser){
        console.log("a user exists already with that username");
        return res.redirect("/signup");
    }
    await db.getDb().collection("users").insertOne(signupDetails); //{username: signupDet.username, password: signupDet.password}
    res.redirect("/login");
})

router.post("/login",async (req,res)=>{
    const loginDetails = req.body;
    const existingUser = await db.getDb().collection("users").findOne({username: loginDetails.username});
    if(!existingUser){
        console.log("no such user exists in database");
        return res.redirect("/signup");
    }
    if(existingUser.password!=loginDetails.password){
        console.log("password doesn't match");
        return res.redirect("/login");
    }
    req.session.user = {
        id: existingUser._id,
        username: existingUser.username,
        password: existingUser.password
    }
    req.session.save(()=>{
        return res.redirect("/");
    })
})

router.get("/create-blog",(req,res)=>{
    res.render("createBlog",{toEdit: null});
})

router.post("/create-blog",async (req,res)=>{
    const {title,desc,content} = req.body;
    const sanitizedTitle = DOMPurify.sanitize(title);
    const sanitizedDesc = DOMPurify.sanitize(desc);
    const sanitizedContent = DOMPurify.sanitize(content);
    const author = res.locals.user.username;
    await db.getDb().collection("blogs").insertOne({
        title: sanitizedTitle,
        desc: sanitizedDesc,
        content: sanitizedContent.trim(),
        author: author
    })
    res.redirect("/");
})

router.get("/selected",async (req,res)=>{
    const blogId = req.query.id;
    const blog = await db.getDb().collection("blogs").findOne({_id: new ObjectId(blogId)});
    res.render("selected",{
        title: blog.title,
        author: blog.author,
        content: marked.parse(blog.content,markedOptions)
    });
}) 

router.get("/profile",async (req,res)=>{
    const user = res.locals.user;
    const allUserBlogs = await db.getDb()
    .collection("blogs")
    .find({author: user.username})
    .toArray();
    res.render("profile",{user: user,allBlogs: allUserBlogs});
})

router.get("/edit",async (req,res)=>{
    const blogId = req.query.id;
    const toEdit = await db.getDb().collection("blogs").findOne({_id: new ObjectId(blogId)}); 
    res.render("createBlog",{toEdit: toEdit});
})

router.post("/edit",async (req,res)=>{
    const {title,desc,content,id} = req.body;
    const sanitizedTitle = DOMPurify.sanitize(title);
    const sanitizedDesc = DOMPurify.sanitize(desc);
    const sanitizedContent = DOMPurify.sanitize(content);
    const author = res.locals.user.username;
    await db.getDb().collection("blogs").updateOne({_id: new ObjectId(id)},
    {$set:{
        title: sanitizedTitle,
        desc: sanitizedDesc,
        content: sanitizedContent.trim(),
        author: author
    }})
    res.redirect("/");
}) 

router.post("/delete",async (req,res)=>{
    const blogId = req.query.id;
    await db.getDb().collection("blogs").deleteOne({_id: new ObjectId(blogId)});
    res.redirect("/profile");
})

router.post("/logout",(req,res)=>{
    req.session.user = null;
    res.redirect("/");
})

module.exports = router;