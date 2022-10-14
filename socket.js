const express = require("express");
const app = express()
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
var dbo;
//calling the required mongodb module
const MongoClient = require('mongodb').MongoClient;
//server path
const url = "mongodb://localhost:27017/";


app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./index.html")
    );
});
app.get("/room1", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./room1.html")
    );
});

app.get("/room2", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./room2.html")
    );
});
const adminNamespace = io.of('/admin');

adminNamespace.on("connect", (socket) => {
    console.log('connect...');
    console.log(socket.id);
    console.log(socket.connected); // true

    let room;
    socket.on('join', (data) => {
        room = data.room;
        socket.join(room);
        console.log(`${room} is connected`);
        MongoClient.connect(url,(err,db)=>{
            if(err)throw err;
            dbo=db.db('mydb');
            dbo.collection("client").find({ room_name: room }, { projection: { _id: 0, client_id: 0 } }).toArray((err, result) => {
                if (err) throw err;
                // console.log(result);
                // console.log("client name is " + message.client_name);
                // console.log(room + ' says:' + message.client_msg);
               socket.emit('old message', result);      //message send 
                db.close();
            });
        })
    });

    //recieve message from server through emit 
    socket.on('new message', (message) => {
        MongoClient.connect(url, (err, db) => {
            if (err) throw err;
            dbo = db.db("mydb");    //create database
            console.log('database created successfully')
            var myobj = {
                client_id: socket.id,
                room_name: room,
                client_name: message.client_name,
                message: message.client_msg
            };
            dbo.collection("client").insertOne(myobj, (err, res) => {         //client is collectionn name
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
            adminNamespace.in(room).emit('chat message', message); 
        });
    });
});

server.listen(3000, () => {
    console.log('listening on 3000 port');
});
