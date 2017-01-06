'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Sub = require('./subCategory.js');

var category = new Schema({
    name: {type:String,required:true},
    subCategories: [Sub]
}, {collection : 'categories'});

module.exports = mongoose.model('Category', category);;