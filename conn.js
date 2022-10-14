const mongoose = require("mongoose");
const dbo = 'mongodb+srv://root:root@cluster0.anxpl4q.mongodb.net/TestData?retryWrites=true&w=majority'
mongoose.connect(dbo).then(()=>{
    console.log("connection successfully");
}).catch((e)=>{
    console.log("no connection");
})
