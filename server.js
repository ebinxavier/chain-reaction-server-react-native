const admin = require("firebase-admin");
const express = require('express');
const bodyParser = require('body-parser');

const { init } = require("./utils");
const room = require('./routes/room');
const message = require('./routes/message');

init();
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const port = process.env.PORT || 4000;
app.listen(port,()=>{console.log("Listening to 4000...!")})

app.use('/room',room);
app.use('/message',message);

