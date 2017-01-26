var FILTER_ENABLE = false,
    LABELS =[],
    ALLMSGS = [],
    OBJ_COLORS={};

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
      if(tab.url.includes("mail.google.com")){
          if(tab.url.includes("#spam")){
              chrome.tabs.executeScript({
                  code: `$('#catTitle').remove();`
              });

              loadSpamMessages();

          } else {
              chrome.tabs.executeScript({
                  code: `$('#treemap').remove();$('#catTitle').remove();`
              });
              if(tab.url.includes("#search")){
                  var splited = tab.url.split('%3A');
                  if(findLabelId(splited[splited.length-1]) != -1){
                      console.log("hereeeeeeeee");
                      chrome.tabs.executeScript({
                          code: `
                                    var catTitle = document.createElement("div");
                                    var closeBtn = document.createElement("a");
                                    closeBtn.setAttribute("href", "https://mail.google.com/mail/u/0/#spam");
                                    closeBtn.innerHTML = "X";
                                    catTitle.setAttribute("class", "catTitle");
                                    catTitle.setAttribute("id", "catTitle");
                                    catTitle.style.background = "`+OBJ_COLORS[splited[splited.length-1]]+`";
                                    catTitle.style.textAlign = "left";
                                    catTitle.innerHTML = "`+splited[splited.length-1]+`";
                                    catTitle.append(closeBtn);
                                    document.getElementById(':4').insertBefore(catTitle, document.getElementById(':2'));
                    
                            `
                      });
                  }
              }
          }
      }

  }
});

//oauth2 auth
chrome.identity.getAuthToken(
	{'interactive': true},
	function(){
	  //load Google's javascript client libraries
		window.gapi_onload = authorize;
		loadScript('https://apis.google.com/js/client.js');
	}
);

function loadScript(url){
  var request = new XMLHttpRequest();

	request.onreadystatechange = function(){
		if(request.readyState !== 4) {
			return;
		}

		if(request.status !== 200){
			return;
		}

    eval(request.responseText);
	};

	request.open('GET', url);
	request.send();
}

function authorize(){
  gapi.auth.authorize(
		{
			client_id: '560629873798-26fjh4c0pfeham2v1it7kci42qfi98vk.apps.googleusercontent.com',
			immediate: true,
			scope: 'https://www.googleapis.com/auth/gmail.modify'
		},
		function(){
		  gapi.client.load('gmail', 'v1');
		}
	);
}

function loadSpamMessages(){
    var promises = [];
    var flag;
    getMessages(['SPAM']).then(function(data){
       flag = data.result.messages.length;
       data.result.messages.forEach(function(msg,indx){
          var pro = getMessageByID(msg.id).then(function(content){
              ALLMSGS.push(content);
              flag-=1;
          });
          promises.push(pro);
       });

        promises.push(getLabels().then(function(res){
            LABELS = res.result.labels;
        }));

       Promise.all(promises).then(function(res){
         sendMessagestoCategories(ALLMSGS);
       });
    });
}

function sendMessagestoCategories(msgs){
  $.ajax({
    type: "POST",
    url: "https://protected-bastion-14333.herokuapp.com/spam/getAllCategories",
  // url: "http://localhost:1337/spam/getAllCategories",
    data: {
      massages: generateRequestData(msgs)
    },
    success: function( data ) {
        drawResult(data.categoriesRate);
        addLabelsToAllMsgs(data.emails);
    }
  });
}

function addLabelsToAllMsgs(emailsWithLabels){
    var proms = [];

    emailsWithLabels.forEach(function (email) {
        if(email.tags.length > 0) {
            proms.push(updateLabels(email.tags));
        }
    });

    Promise.all(proms).then(function(){
        proms = [];
        var c = emailsWithLabels.len;
        emailsWithLabels.forEach(function (email) {
            if(email.tags.length > 0) {
                newTags = [];
                email.tags.forEach(function (t) {
                    var r = findLabelId(t);
                    if(r!=-1)newTags.push(r);
                });
                var p = new Promise(function(resolve,reject) {
                    addLabelToThread(findThreadId(email.id), newTags, function(resolte){
                        resolve();
                    });
                });
                proms.push(p);
            }
        });
        Promise.all(proms).then(function(){
            FILTER_ENABLE = true;
        });
    });
}

function findThreadId(msgId){
    var ans = -1;

    ALLMSGS.forEach(function (msg) {
        if(msg.result.id === msgId){
            ans = msg.result.threadId;
        }
    });

    return ans;
}

function findLabelId(name){
    var ans = -1;
    LABELS.forEach(function (l) {
        if(l!=undefined && l.name === name ){
            ans = l.id;
        }
    });

    return ans;
}

function updateLabels(lbls){
    return new Promise(
        function(resolve,reject){
            var props = [];
            lbls.forEach(function(lbl){
                var p = new Promise(function(reso,reje){
                    console.log("updateL2");
                    if(findLabelId(lbl) === -1 ){
                        createLabel(lbl,function(res){
                            if(res) LABELS.push(res.result);
                            reso();
                        });
                    } else {
                        reso();
                    }
                });
                props.push(p);
            });

            Promise.all(props).then(resolve);
        }
    );
}

function generateRequestData(data){
    var result = [];
    data.forEach(function(el){
        result.push({
            id: el.result.id,
            content: el.result.snippet,
            subject: el.result.payload.headers[23]
        });
    });
    return result;
}

function createTreemapFromRespone(data) {
    var result = [];
    var colors = ["#629AF1", "#1BB15A", "#F9C21A", "#D74A39", "#8038CC"];
    
    //convert the response data for treemap
    data.forEach(function(el, index){
        if(el.subCategories.length != 0) {
            result.push({
                label: el.name,
                value: null,
                color: colors[index]
            });

            el.subCategories.forEach(function(sub){
                OBJ_COLORS[sub.name] = colors[index];
                result.push({
                    label: sub.name,
                    value: sub.emailsCount,
                    parent: el.name,
                    data: { description: sub.emailsCount + " Emails", title: el.name + "#" + sub.name }
                });
            });   
        }
    });
    
    
    //We should use jquery code for build the graph.
    return `
         $(function () {
            $(document).ready(function() {
                $('#treemap').jqxTreeMap({
                        width: 1047,
                        height: 250,
                        source: ` + JSON.stringify(result) + `,
                        colorRange: 1,
                        renderCallbacks: {
                            '*': function (sectorHtmlElement, sectorData) {
                                sectorHtmlElement.on('click',function(){
                                    
                                    window.location.replace('https://mail.google.com/mail/u/0/#search/in%3Aspam+label%3A'+ $(this).find('span').text());
                                    $('#treemap').remove();
                                    
                                    
                                });
                                sectorHtmlElement.hover(function(){
                                    if($(this).attr('class').indexOf('jqx-treemap-rectangle-parent') != -1) return;
                                    $(this).css('background-image','url('+chrome.extension.getURL('treemap/images/'+$(this).find('span').text() + '.gif')+')');
                                    $(this).css('background-size','cover');
                                }, function(){
 $(this).css('background-image','');
});
                            }
                        }
                    });
                $('.jqx-treemap-label').css('position','');
                $('.jqx-treemap-rectangle .jqx-treemap-label').css('position','relative').css('left','0px');
                $('.jqx-treemap-rectangle-hover').each(function(index,obj){
                    $(this).css('background-color', '#F00');
                });
            });
        });`;

}

function drawResult(results){
    chrome.tabs.executeScript(null, { file: "treemap/jqx.base.css" } , function() {
            chrome.tabs.executeScript(null, { file: "jquery-3.1.1.min.js"}, function(){
                  chrome.tabs.executeScript(null, { file: "treemap/jqxcore.js"}, function(){
                      chrome.tabs.executeScript(null, { file: "treemap/jqxcore.js"}, function(){
                          chrome.tabs.executeScript(null, { file: "treemap/jqxtooltip.js"}, function(){
                              chrome.tabs.executeScript(null, { file: "treemap/jqxtreemap.js"}, function(){
                                  chrome.tabs.executeScript(null, { file: "treemap/demos.js"}, function(){
                                      chrome.tabs.executeScript({
                                        code: `
                                                    var newEl = document.createElement("div");
                                                    newEl.setAttribute("id", "treemap");
                                                    document.getElementById(':4').insertBefore(newEl, document.getElementById(':2'));

                                                    var script = document.createElement("script");
                                                    script.text = `+ createTreemapFromRespone(results) + `;

                                                    document.body.appendChild(script);
                                                `
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
}

function getMessages(lbls){
  return gapi.client.gmail.users.messages.list({
		userId: 'me',
		labelIds: lbls
	});
}

function getLabels(){
  return gapi.client.gmail.users.labels.list({
      'userId': 'me'
  });
}

function createLabel(newLabelName, callback) {
    var request = gapi.client.gmail.users.labels.create({
        userId : 'me',
        labelListVisibility   : 'labelShow',
        messageListVisibility : 'show',
        name : newLabelName
    });

    request.execute(function (err, result) {
        callback( result );
    });
}

function addLabelToMessage(messageId, labelsToAdd, callback) {
    var request = gapi.client.gmail.users.messages.modify({
        'userId': 'me',
        'id': messageId,
        'addLabelIds': labelsToAdd,
        'removeLabelIds': []
    });

    request.execute(function (err, res) {
        if (!err) {
            callback(res);
        } else {
            callback(err);
        }
    });


}

function addLabelToThread(threadId, labelsToAdd, callback) {
    var request = gapi.client.gmail.users.threads.modify({
        'userId': 'me',
        'id': threadId,
        'addLabelIds': labelsToAdd,
        'removeLabelIds': []
    });

    request.execute(function (err, res) {
        if (!err) {
            callback(res);
        } else {
            callback(err);
        }
    });


}

function getMessageByID(_id){
  return gapi.client.gmail.users.messages.get({
		userId: 'me',
		id: _id 
	});
}

function returnMockJson(){
    
           return `[ {
                label: 'Amotions',
                value: null,
                color: '#629AF1'
            },
            {
                label: 'Life-Style',
                value: null,
                color: '#1BB15A'
            },
            {
                label: 'Commerce',
                value: null,
                color: '#F9C21A'
            },
            {
                label: 'Financial',
                value: null,
                color: '#D74A39'
            },
            {
                label: 'Advertising',
                value: null,
                color: '#8038CC'
            },
            {
                label: 'happy',
                value: 5,
                parent: 'Amotions',
                data: { description: "4 Emails", title: "Life-Style#Family" }
            },
            {
                label: 'greeting',
                value: 5,
                parent: 'Amotions',
                data: { description: "5 Emails", title: "Commerce#Offers" }
            },
            {
                label: 'pressure',
                value: 1,
                parent: 'Amotions',
                data: { description: "4 Emails5 Emails", title: "Commerce#Sells" }
            },
            {
                label: 'success',
                value: 2,
                parent: 'Amotions',
                data: { description: "1 Emails", title: "Commerce#Hi-tech" }
            },
            {
                label: 'family',
                value: 4,
                parent: 'Life-Style',
                data: { description: "4 Emails", title: "Life-Style#Family" }
            },
            {
                label: 'offers',
                value: 5,
                parent: 'Commerce',
                data: { description: "5 Emails", title: "Commerce#Offers" }
            },
            {
                label: 'sells',
                value: 4,
                parent: 'Commerce',
                data: { description: "4 Emails5 Emails", title: "Commerce#Sells" }
            },
            {
                label: 'hi-tech',
                value: 1,
                parent: 'Commerce',
                data: { description: "1 Emails", title: "Commerce#Hi-tech" }
            },
            {
                label: 'buy',
                value: 1,
                parent: 'Commerce',
                data: { description: "1 Emails", title: "Commerce#Buy" }
            },
            {
                label: 'marketing',
                value: 5,
                parent: 'Advertising',
                data: { description: "5 Emails", title: "Advertising#Marketing" }
            },
            {
                label: 'discounts',
                value: 1,
                parent: 'Advertising',
                data: { description: "1 Emails", title: "Advertising#Discounts" }
            },
            {
                label: 'personal',
                value: 4,
                parent: 'Financial',
                data: { description: "4 Emails", title: "Financial#Personal" }
            }
            
            ]`;
}