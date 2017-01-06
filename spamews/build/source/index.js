var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var port = process.env.PORT || 1337;
var mongoose = require('mongoose');
var consts = require('./assets/consts.js');

var app = express();
var db = mongoose.connect(consts.MLAB_KEY);
var conn = mongoose.connection;

app.use('/assets', express.static(__dirname + '/public'));

app.use(function (req, res, next) {

    // allowed websites to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

conn.on('error', function (err) {
    console.log('connection error - ' + err);
});

conn.once('open', function () {
    console.log('connected to mongo!');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./routes')(app);

app.listen(port);
console.log("connected to port " + port);