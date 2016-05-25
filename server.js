// MODULE VARIABLES
var fs = require("fs");
var path = require("path");
var https = require("https");
var express = require("express");
var body_parser = require("body-parser");

// SERVER SETTINGS + MIDDLEWARE CONFIG
var app = express();
app.use("/public", express.static(__dirname + "/public")); // Set default static files from / to /public; second argument is the directory where the static files are
app.use(body_parser.urlencoded({ extended: false })); // Parse urlencoded, and set value of body's key-value pairs to be in string/array (For API)
app.use(body_parser.json()); // Process coming requests' body to be in JSON (For API)
app.set("views", "public/views"); // Set default views directory views/ to public/views

// OTHER MODULES
var config = require(path.join(__dirname, "/config/config.js"));
var helper = require(path.join(__dirname, "/config/helper_functions.js"))(config);
var component = require(path.join(__dirname, "/config/component.js"))(config, helper);
var externalAPI = require(path.join(__dirname, "/config/external_api.js"))(config);

// INITIAL HARDWARE RUN
var init_hardware = require(path.join(__dirname, "/config/init_hardware.js"))(config, component, helper);

// API + APP ROUTES
require(path.join(__dirname, "/config/api_routes.js"))(app, config, component, helper, externalAPI);
require(path.join(__dirname, "/config/app_routes.js"))(app, config);

// SERVER PROTOCOL
var server;
if(config.secure){
	// HTTPS
	var ssl_files = {
		ca: fs.readFileSync(path.join(__dirname, "/ssl/ca.crt")), 
		key: fs.readFileSync(path.join(__dirname, "/ssl/server.key")), 
		cert: fs.readFileSync(path.join(__dirname, "/ssl/server.crt"))
	};
	server = https.createServer(ssl_files, app).listen(config.app_secure_port, function(){
	 	console.log("Japri is running on port: " + config.app_secure_port);	
	}); 
} else{
	// HTTP
	server = app.listen(config.app_port, function(){
		console.log("Japri is running on port: " + config.app_port);
	});
}

// SERVE SOCKET.IO 
var socketIo = require(path.join(__dirname, "/config/socketio.js"))(server, config, component, helper);

// HANDLE UNCAUGHT EXCEPTIONS
process.on("uncaughtException", function(err){
	console.log("Uncaught exception: ", err);
});
