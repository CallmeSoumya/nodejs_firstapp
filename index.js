// //Creating Server
// import http from "http";
// import { generateLovePercent } from "./features.js";
// import fs from "fs";
// import { log } from "console";




// const server = http.createServer((req, res) => {
//   if (req.url === "/about") {
//     res.end(`<h1>Love is ${generateLovePercent() } </h1>`);
//   } else if (req.url === "/") {
//     fs.readFile("./index.html",(err,home)=> {
//       res.end(home);
//       // console.log("File Read");
//     });
//   } else if (req.url === "/contact") {
//     res.end("<h1>Contact Page</h1>");
//   } else {
//     res.end("<h1>Page Not Found</h1>");
//   }
// });

// server.listen(5000, () => {
//   console.log("Server is Working");
// });












//Server crreating in expres
//app == server




import express  from "express";
import path  from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017",{
  dbName:"backend",
})
.then(()=>console.log("DataBase Connected"))
.catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
});

const User = mongoose.model("user",userSchema)





const app = express();
const users=[];

//Using Middleware

app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//setting up viewEngine

app.set("view engine", "ejs");

//making middleware
const isAuthenticated = async(req,res,next)=>{
  
 const { token } = req.cookies;

 if(token){
  const decoded = jwt.verify(token, "asdfghjkl");
  req.user = await User.findById(decoded._id);

  
  next();
 }else{
  res.redirect("/login");
 }
}
app.get("/",isAuthenticated,(req,res)=>{
  // for mongodb
  // res.render("index",{name:"Singh"});
  
  res.render("logout",{name: req.user.name});
  
});
app.get("/register",(req,res)=>{
    res.render("register");
  
});
app.get("/login",(req,res)=>{
  res.render("login");
});
  

app.post("/login", async(req,res)=>{
  const { email,password } = req.body;
let user = await User.findOne({ email });
if(!user) return res.redirect("/register");
const isMatch = await bcrypt.compare(password,user.password);
if (!isMatch) return res.render("login",{email, message : "Incorrect Password" });
const token = jwt.sign({_id:user._id},"asdfghjkl")

  res.cookie("token",token,{
  httpOnly:true,
  expires:new Date(Date.now()+60*1000)
  });
  res.redirect("/")
});

app.post("/register",async (req,res)=>{

  const {name,email,password} = req.body;
  let user = await User.findOne({ email });
  if(user){
    return res.redirect("/login");
  }
  const hashpassword = await bcrypt.hash(password,10);
   user = await User.create({
    name,
    email,
    password:hashpassword,
  });
  const token = jwt.sign({_id:user._id},"asdfghjkl")

  res.cookie("token",token,{
  httpOnly:true,
  expires:new Date(Date.now()+60*1000)
  });
  res.redirect("/")
});


app.get("/logout",(req,res)=>{
  res.cookie("token",null,{
  httpOnly:true,
  expires:new Date(Date.now())
  });
  res.redirect("/")
});





































































// app.get("/success",(req,res)=>{
//   //dynamic
//   res.render("success",{name:"Souuuuu"});
  
// });

// //trying to add dummy data
// app.get("/add",async (req,res)=>{
// await Message.create({
//   name:"Soumya",
//   email:"sc@gmail.com"
// });
//   res.send("Nice");
// });
 

// app.get("/users",(req,res)=>{
//   res.json({
//     users,
//   });
// });
// app.post("/contact",async(req,res)=>{
// console.log(req.body);
// // users.push({username:req.body.name,email:req.body.email});
// const {name , email} = req.body;
// await Message.create({ name,email});
// // await Message.create({ name:req.body.name,email:req.body.email })

// // res.render("success");
// res.redirect("/success")
// });


app.listen(5000,() => {
  console.log("Server is Working");
})