'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var subCategory = new Schema({
    name: {type:String,required:true},
    keywords: [{type:String}]
});

module.exports = subCategory;