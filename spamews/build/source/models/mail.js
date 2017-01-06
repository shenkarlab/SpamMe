'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mail = new Schema({
    id: { type: String, required: true, unique: true, index: true },
    subject: { type: String },
    content: { type: String }
}, { collection: 'Mails' });

module.exports = mail;