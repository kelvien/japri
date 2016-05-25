var mongoose = require("mongoose");

var japri_config = require("../japri_config.json");
var userModel = require("../models/user.js");
var tagModel = require("../models/tag.js");

// Make sure app's config file has both username and password
// Because mongoDB access control allows anonymous login
// By making sure mongoDB username and password to be required
// We will have an authenticated user to access our database
if(japri_config.db_username == "" || japri_config.db_password == ""){
	console.log("DB Username/Password cannot be empty");
	process.exit(1);
}

// Basic Settings
var app_port = japri_config.app_port;
var db_port = japri_config.db_port;
var db_url = "mongodb://localhost:" + db_port + "/japri";
var db_config = {
	user: japri_config.db_username,
	pass: japri_config.db_password
};
var api_route = "/api";

module.exports = {
	"secure": japri_config.secure,
	"app_port": app_port,
	"app_secure_port": japri_config.app_secure_port,
	"db_port": db_port,
	"db_url": db_url,
	"db_config": db_config,
	"api_route": api_route,
	"jwt_secret": japri_config.jwt_secret,

	"weatherAPIKey": japri_config.weatherAPIKey,
    "nytTopStoriesAPIKey": japri_config.nytTopStoriesAPIKey,

    "mailer_email": japri_config.mailer_email,
    "mailer_password": japri_config.mailer_password,

	"initLiveStream": japri_config.initLiveStream,
	"initNFCReader": japri_config.initNFCReader,
	"initPIRSensor": japri_config.initPIRSensor,
	"initLightSensor": japri_config.initLightSensor,
	"initMilight": japri_config.initMilight,
	"initLightStrip": japri_config.initLightStrip,
	"automate": japri_config.automate,

	"milightIPAddress": japri_config.milightIPAddress
}

// Database Connection
mongoose.connect(db_url, db_config, function(err){
	if(err){
		console.log("Unable to connect to database");
		console.log("DB Error message: "+err.message);
		process.exit(1);	
	}
});

// Database watch connection
mongoose.connection.on("connected", function(){
	console.log("Connected to database");
});

mongoose.connection.on("error", function(err){
	console.log("Unable to connect to database");
	process.exit(1);
});

mongoose.connection.on("disconnected", function(){
	console.log("Database is not connected. Exiting web server.");
	process.exit(1);
});

// Database proper closing upon keyboard interruption
process.on("SIGINT", function() {
  mongoose.connection.close(function () {
    console.log("Mongoose is disconnected on app termination");
    process.exit(1);
  });
});
