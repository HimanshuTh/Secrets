//jshint esversion:6
//below code line dotenv is environmental variable stores api keys and stuff and hides them. always include it at top. It contains our secret code.
//https://www.npmjs.com/package/dotenv
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//https://www.npmjs.com/package/mongoose-encryption
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost/userDB', {useNewUrlParser: true, useUnifiedTopology: true });

//previously used to create js obj for schema. now using mongoose.schema so that mongoose-schema npm package works
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// this plugin encrypts only password field. if u don't include encryptedFields part then even the username will be
// encrypted
// always add the const secret n the plugin before creating mongoose model
//it encrypts at .save() and decrypts at .find()
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("User",userSchema);

app.get("/",function(req, res){
  res.render("home");
});

app.get("/register",function(req, res){
  res.render("register");
});

app.get("/login",function(req, res){
  res.render("login");
});

app.post("/register",function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.render("secrets");
    }
  });

});

app.post("/login",function(req, res){
  const username = req.body.username
  const password = req.body.password

  User.findOne({email: username},function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        }else{
          res.send("Login Failed :(");
        }
      }
    }
  });

});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
