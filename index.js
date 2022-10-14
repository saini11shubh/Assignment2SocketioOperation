              const express = require('express')
              const ejs = require('ejs');
              const path = require("path");
              var validator = require('validator');
              const router = express.Router();
              const bodyParser = require('body-parser')
              const app = express()
              const port = process.env.PORT || 8080;

              var server = require('http').createServer(app);
              var io = require('socket.io')(server);

              app.use(express.json());  // recognize the incoming Request object as a JSON object
              app.set('view engine', 'ejs');
              const mongoose = require("./conn.js");
              const { UserData, OnlineUser } = require("./schema.js");
              const { json } = require('body-parser');
              const { read } = require('fs');
              const { emit } = require('process');
              app.use(bodyParser.urlencoded({ extended: true }));

              app.get('/', (req, res) => {
                res.sendFile(path.join(__dirname, 'form.html'))
              })


              //Whenever someone connects this gets executed
              io.on('connection', function (socket) {
                console.log('A user connected');
              });

              app.post('/save', async (req, res) => {
                console.log(req.body);
                if (!validator.isAlpha(req.body.first_name)) {
                  return res.status(400).json({ response: 'Invalid first name' });
                }
                if (!validator.isAlpha(req.body.last_name)) {
                  return res.status(400).json({ response: 'Invalid last name' });
                }

                if (!validateMobileno(req.body.phone_no)) {
                  //throw new Error('Invalid mobile number!');
                  return res.status(400).json({ response: 'Invalid mobile no' });
                }

                if (!validator.isEmail(req.body.email)) {
                  return res.status(400).json({ response: 'Invalid Email' });
                }

                if (!validator.isAlpha(req.body.city)) {
                  return res.status(400).json({ response: 'Enter valid city' });
                }

                if (!validator.isAlpha(req.body.state)) {
                  return res.status(400).json({ response: 'Enter valid state' });
                }
                if (!validator.isAlpha(req.body.country)) {
                  return res.status(400).json({ response: 'Enter valid country' });
                }

                if (!validateUsername(req.body.login_id)) {
                  return res.status(400).json({ response: 'Invalid username' });
                }
                if (!validator.isStrongPassword(req.body.password, { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
                  return res.status(400).json({ response: 'Invalid password' });
                }
                const user = {
                  name: req.body.first_name,
                  email: req.body.email
                }
                let datainfo = new UserData(req.body);
                // console.log("DATA IS" + datainfo);
                //await datainfo.save();
                res.render('room.ejs', {
                  user: user
                })
              });



              const getVisitors = () => {
                let clients = io.sockets.connected;
                let sockets = Object.values(clients);
                let users = sockets.map(s => s.user);
                return users;
              };

              async function showOnlineUser(){
                let result = await OnlineUser.find();
                console.log(result);
             //   return result
              }



              const emitVisitors = () => {
                io.emit("visitors", getVisitors());
              }

               async function saveOnlineUser(userInfo){
                console.log("its worked")
                let datainfo = new OnlineUser(userInfo);
                console.log("DATA IS" + datainfo);
                await datainfo.save();

              }
              const adminNamespace = io.of('/admin');
              adminNamespace.on("connect", (socket) => {
                // console.log('connect...');
                // console.log(socket.id);
                // console.log(socket.connected); // true
                // var total=io.engine.clientsCount;
                console.log("A user connected");
                let room;

                socket.on("new_visitor", user => {
                  console.log("new_visitor", user);
                  let name = user.client_name;
                  let email = user.client_email;
                  let socketId = socket.id;
                  console.log(`${name} is connected ${email}=`);
                  let userInfo = {
                    name: name,
                    emailId: email,
                    socketId: socketId,
                  }
                  saveOnlineUser(userInfo);

                  const result=showOnlineUser();

               //   adminNamespace.in(room).emit('userInfo', );

                  //socket.user = user;
                });

                socket.on('join', (data) => {
                  room = data.room;
                  socket.join(room);
                  console.log(`${room} is connected`);
                  socket.emit('sendId')
                });

                // console.log(total);
                // socket.on('data', (data) => {
                //   let name = data.client_name;
                //   let email = data.client_email;
                //   let socketId = socket.id;
                //  console.log(`${name} is connected ${email}=`);
                //  console.log(socket.id)
                //   let userInfo = {
                //     name: name,
                //     email: email,
                //     socketId: socketId,
                //   }

                //  // adminNamespace.in(room).emit('userInfo', userInfo);
                // })
              });

              app.get('/view', (req, res) => {
                UserData.find({}, (err, result) => {
                  if (err) throw err;
                  res.render('index', {
                    dataList: result
                  })
                })
              })

              // app.get('/showdata',(req,res)=>{
              //   console.log("retrieve data from mongodb is here from email")
              // })

              // Validates a username
              function validateUsername(username) {
                return !validator.isEmpty(username) && validator.isAlphanumeric(username) && validator.isLength(username, { min: 6, max: 32 });
              }

              //validates a mobile no
              function validateMobileno(mobileno) {
                return !validator.isEmpty(mobileno) && validator.isMobilePhone(mobileno, 'any') && validator.isLength(mobileno, { min: 6, max: 14 });
              }
              server.listen(port, () => {
                console.log(`Example app listening on port ${port}`)
              })