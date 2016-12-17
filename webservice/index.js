
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;
app.use('/', express.static('./public'));

app.set('port', port);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

//Modules
const gmailService = require("./gmailService/index.js");
const gmailServiceInst = new gmailService();


app.all('/', function(req, res, next) {
    console.log("login");
    req.next();
});

// app.get('/isLogin', function(req, res) {
//     res.json(userSession);
// });
//
// /*
//  Registration URL's
//  */
// app.post('/login', function(req, res) {
//     var userName = req.body.username;
//     var pass = req.body.password;
//     registration.login(userName, pass, function(response) {
//         console.log("res : " + response);
//         if(response.status == 'success'){
//             userSession.userName = response.user;
//             userSession.isLogedIn = true;
//             userSession.isAdmin = response.isAdmin;
//         }
//         res.json(response);
//     });
// });


app.listen(port);
console.log("listening on port " + port);