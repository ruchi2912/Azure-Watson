'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var path    = require("path");
var fs     = require('fs');
var request     = require('request');
var app = express();
app.set('title','TCS GE Demo');
app.set('view engine','ejs');
//app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

//Bootstrap application settings
//app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

//Create the service wrapper
var conversation = new Conversation({
	// If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
	// After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
	username: '7eacaf15-bcc0-4cf4-a72e-99c2aaeaf653',
	password: '1D3dKkLNJApk ',
	url: 'https://gateway.watsonplatform.net/conversation/api',
	version_date: '2016-10-21',
	version: 'v1'
});

app.listen(appEnv.port, '0.0.0.0', function() {
	console.log("server starting on " + appEnv.url);
});

app.get('/login',function(req,res){
	console.log('In root get');
	res.render('login.ejs');
});

app.get('/chat',function(req,res){
	console.log('In chat post');
	res.sendFile(path.join(__dirname+'/chat.html'));
});

app.get('/admin',function(req,res){
	console.log('In chat post');
	res.sendFile(path.join(__dirname+'/admin.html'));
});

//Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
	var workspace = '39608afa-d3fc-4632-92bd-75fd8cd5635f';
	if (!workspace) {
		return res.json({
			'output': {
				'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
			}
		});
	}
	var payload = {
			workspace_id: workspace,
			context: req.body.context || {},
			input: req.body.input || {}
	};

	// Send the input to the conversation service
	conversation.message(payload, function(err, data) {
		if (err) {
			return res.status(err.code || 500).json(err);
		}
		//return res.json(updateMessage(payload, data));
		
		updateMessage(data,function(post){
			return 	res.json(post) ;   	
		});
	});
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage( response1 ,cb){
	var pname = response1.context.ProductCode ; // Product name
	var u = response1.context.Username ;//name of user who is chating
	var pstatus= 'Purchased' ; //response1.context.status ; //status like Purchased or Enquired
	response1.context.order = response1.context.order + 1 ;
	var pnum=    '1234' ;//response1.context.order; //Product number
	var v1 =response1.context.v1 ;
	var v10 =response1.context.v10 ;

	console.log(v1);

	if (v1 == "order"){
		request({
			url:  'https://noderednn123.mybluemix.net/dbinsert?user=' + u + '&abc=' + pstatus + '&order=' + pnum + '&prod=' + pname,
			method: 'GET'
		}, 
		function(error, response, body) {
			if (!error && response.statusCode == 200)
			{
				var abc = JSON.parse(body);			    
				var x = abc.txt ; 
				console.log(x) ;
				response1.output.text = x;


			}		
		}); 

		request({
			url:  'https://noderednn123.mybluemix.net/order',
			method: 'GET'
		}, 
		function(error, response, body) {
			if (!error && response.statusCode == 200)
			{
				var abc = JSON.parse(body);			    
				var x = abc.txt ; 
				console.log(x) ;
				//	response1.output.text = x;
				cb (response1) ;

			}

			else
			{
				response1.output.text = "Error accessing bluemix service";
				cb (response1) ;
			}
		}); 




		response1.context.v1 ='';
	}


	if (v10 =="ch")
	{
		request({
			url:  'https://noderednn123.mybluemix.net/dbselect?user=' + u ,
			method: 'GET'
		}, 
		function(error, response, body) {
			if (!error && response.statusCode == 200)
			{
				var abc = JSON.parse(body);			    
				var x = abc.txt ; 
				console.log(x) ;
				response1.output.text = x;
				cb (response1) ;


			}	

			else
			{
				response1.output.text = "Error accessing bluemix service";
				cb (response1) ;
			}	
		}); 

		response1.context.v10 ='';
	}


	else
	{
		cb (response1) ;

	}
}

module.exports = app;
