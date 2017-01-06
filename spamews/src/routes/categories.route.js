'use strict';
var bodyParser          = require('body-parser');
var jsonParser          = bodyParser.json();
var urlencodedParser    = bodyParser.urlencoded({ extended: false });
var utils               = require('../assets/utils.js');
var fs                  = require('fs');
var path                = require('path');

var CategoriesController     = require('../controllers/categories.ctrl.js');
var CategoriesApi            = new CategoriesController();

module.exports = function(app){

    app.post('/spam/getAllCategories', function(req, res){
        if (!req.body && !req.body.massages) return res.sendStatus(404);
        CategoriesApi.orderByCategories(req.body.massages, function(err, data){
            if(err) return res.sendStatus(404); 
            res.send(data);
            res.end();
        });
    });
};