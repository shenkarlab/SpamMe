'use strict';
var mongoose        = require('mongoose');
var fs              = require('fs');

var Category        = require('../models/category.js');

class Categories{
    constructor(){}

    orderByCategories(emails,callback){
        console.log('>>orderByCategories');
        var result,
            catEmails = [],
            foundCat = [], snipCat =[],
            count = 0, 
            tmpSubCat;

        Category.find({},function(err,categories){
            if(err) {
                console.log(err);
                return callback(err, null);
            }
            emails.forEach(function(email, emailIndex){
                snipCat = [];
                categories.forEach(function(cat,catIndex){
                    if(foundCat[catIndex])
                        tmpSubCat = foundCat[catIndex].subCategories;
                    else 
                        tmpSubCat = [];

                    
                    cat.subCategories.forEach(function(sub, subIndex){
                        count=0;
                        sub.keywords.forEach(function(kw){
                            if(email.content.toLowerCase().indexOf(kw) != -1){
                                count+=1;
                            }
                        });
                        if(count>3){
                            var finFn = function(subCatFind) { 
                                return subCatFind.name === sub.name;
                            };
                            var foundPlaceInList = tmpSubCat.findIndex(finFn);
                            if(foundPlaceInList != -1){
                                tmpSubCat[foundPlaceInList].emailsCount += 1;
                            } else {
                                tmpSubCat.push({
                                    emailsCount: 1,
                                    name: sub.name
                                });
                            }
                            snipCat.push(cat.name+"#"+sub.name);
                        }
                    });
                    if(emailIndex === 0){
                        foundCat.push({
                            name: cat.name,
                            subCategories: tmpSubCat
                        });
                    } else {
                        foundCat[catIndex].subCategories = tmpSubCat;
                    }
                });
                catEmails.push({
                    id: email.id,
                    tags: snipCat
                });
            },this);

            result = { 
                emails: catEmails,
                categoriesRate: foundCat
            };
            callback(null,result);
            console.log('<<orderByCategories');
        });
    }
}

module.exports = Categories;