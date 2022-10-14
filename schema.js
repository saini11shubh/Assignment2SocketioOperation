            const mongoose = require("mongoose");
            var validator = require('validator');
            const UserSchema = new mongoose.Schema({
              first_name: {
                type: String,
              },
              last_name: {
                type: String,
              },
              phone_no: {
                type: Number,
              },
              email: {
                type: String,
               // unique: true,
                required: true
              },
              street: {
                type: String,
                required: true,
              },
              city: {
                type: String,
                required: true,
              },
              state: {
                type: String,
                required: true,
              },
              country: {
                type: String,
                required: true,
              },
              login_id: {
                type: String,
                required: true,
              },
              password: {
                type: String,
                required: true,
              },
              date: {         // print date in india standard time 
                type: String,
                default: Date
              }
            })

            const OnlineUserSchema = new mongoose.Schema({
              name: {
                type: String,
              },
              emailId: {
                type: String,
                // unique: true,
               // required: true
              },
              socketId:{
                type: String,
              }
            })

            const UserData = new mongoose.model("UserData", UserSchema);  //collection 
            const OnlineUser = new mongoose.model("OnlineUser", OnlineUserSchema);  //collection 


            module.exports = {UserData, OnlineUser};  