// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//   // No tabs or host permissions needed!
//   console.log('Turning ' + tab.url + ' red!');

//   gmailAPILoaded();
// });

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
      if(tab.url.includes("#spam")){
          gmailAPILoaded();
      }
  }
})

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

function gmailAPILoaded(){
    //do stuff here
    loadSpamMessages();
}

function loadSpamMessages(){
    var msgs = [], promises = [];
    var flag;
    getMessages(['SPAM']).then(function(data){
       flag = data.result.messages.length;
       data.result.messages.forEach(function(msg,indx){
          var pro = getMessageByID(msg.id).then(function(content){
              msgs.push(content);
              flag-=1;
          });
          promises.push(pro);
       });

       Promise.all(promises).then(function(res){
         sendMessagestoCategories(msgs);
       });
    });
}

function sendMessagestoCategories(msgs){
  $.ajax({
    type: "POST",
    url: "http://localhost:1337/spam/getAllCategories",
    data: {
      massages: generateRequestData(msgs)
    },
    success: function( data ) {
      drawResult(data)
    }
  });
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
                                                    newEl.innerHTML = 'loading';
                                                    newEl.setAttribute("id", "treemap");
                                                    document.getElementById(':4').insertBefore(newEl, document.getElementById(':2'));

                                                    var script = document.createElement("script");
                                                    script.text = `+templateHTml+ `;

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

function getMessages(labels){
  return gapi.client.gmail.users.messages.list({
		userId: 'me',
		labelIds: labels
	});
}

function getMessageByID(_id){
  return gapi.client.gmail.users.messages.get({
		userId: 'me',
		id: _id 
	}); 
}

var templateHTml = `
 $(function () {
            var data = [
            {
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
                label: 'Happy',
                value: 5,
                parent: 'Amotions',
                data: { description: "4 Emails", title: "Life-Style#Family" }
            },
            {
                label: 'Greeting',
                value: 5,
                parent: 'Amotions',
                data: { description: "5 Emails", title: "Commerce#Offers" }
            },
            {
                label: 'Pressure',
                value: 1,
                parent: 'Amotions',
                data: { description: "4 Emails5 Emails", title: "Commerce#Sells" }
            },
            {
                label: 'Success',
                value: 2,
                parent: 'Amotions',
                data: { description: "1 Emails", title: "Commerce#Hi-tech" }
            },
            {
                label: 'Family',
                value: 4,
                parent: 'Life-Style',
                data: { description: "4 Emails", title: "Life-Style#Family" }
            },
            {
                label: 'Offers',
                value: 5,
                parent: 'Commerce',
                data: { description: "5 Emails", title: "Commerce#Offers" }
            },
            {
                label: 'Sells',
                value: 4,
                parent: 'Commerce',
                data: { description: "4 Emails5 Emails", title: "Commerce#Sells" }
            },
            {
                label: 'Hi-tech',
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
                label: 'Discounts',
                value: 1,
                parent: 'Advertising',
                data: { description: "1 Emails", title: "Advertising#Discounts" }
            },
            {
                label: 'Personal',
                value: 4,
                parent: 'Financial',
                data: { description: "4 Emails", title: "Financial#Personal" }
            }
            
            ];
  
            

            $('#treemap').jqxTreeMap({
                width: 1047,
                height: 250,
                source: data,
                colorRange: 1
            });
        });
`;