const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
app.use('/', express.static('./public'));

app.set('port', port);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Modules
const gmailService = require("./mails/index.js");
const gmailServiceInst = new gmailService();

app.all('/', function(req, res, next) {
    console.log("----------- Start ---------------");
    req.next();
});

 app.get('/login', function(req, res) {
     gmailServiceInst.loginToGmail();
 });

 app.get('/messages', function(req, res) {
     gmailServiceInst.getAllSpamMessages( function(respinse) {
         res.json(respinse);
     });
 });

app.listen(port);
console.log("listening on port " + port);