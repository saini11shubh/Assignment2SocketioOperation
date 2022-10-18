const express = require('express')
const ejs = require('ejs');
const path = require("path");
var validator = require('validator');
const router = express.Router();
const bodyParser = require('body-parser')
const app = express()
const url = require('url');

const port = process.env.PORT || 6547;

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.json());  // recognize the incoming Request object as a JSON object
app.set('view engine', 'ejs');
const mongoose = require("./conn.js");
const { UserData } = require("./schema.js");
const { json } = require('body-parser');
const { read } = require('fs');
const { emit } = require('process');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'))
})




app.post('/save', async (req, res) => {
  // console.log(req.body);
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
  await datainfo.save();
  res.render('room.ejs', {
    user: user
  })
});

//Whenever someone connects this gets executed
let users = [];         //save all connected user in array
const adminNamespace = io.of('/admin');
adminNamespace.on("connect", (socket) => {
  let room;
  socket.on('join', (data) => {
    let result;
    let name = data.client_name;
    let email = data.client_email;
    room = data.room;
    let socketId = socket.id;

    socket.join(room);
    console.log(`${name} is connected ${email}=`);
    let userInfo;


    UserData.findOne({ email: email }, { password: 0, date: 0, _id: 0 }, (err, rst) => {
      if (err) throw err;
      result = rst;
      console.log(rst)
      userInfo = {
        user_data: result,
        socketId: socketId,
      }
      console.log('its working')
      console.log(userInfo.user_data.city);
      users.push(userInfo)
      adminNamespace.in(room).emit('userInfo', users);
    })
  });

  socket.on('forceDisconnect', function () {
    socket.disconnect();
  });
});

app.get('/view', (req, res) => {
  UserData.find({}, (err, result) => {
    if (err) throw err;
    res.render('index', {
      dataList: result
    })
  })
})


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