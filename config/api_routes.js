var jwt = require("jsonwebtoken");
var os = require("os");
var userModel = require("../models/user.js");
var tagModel = require("../models/tag.js");

function api_routes(app, config, component, helper, external_api){
	var router = require("express").Router();

	// AUTHENTICATE USER
	router.route("/auth")
	.post(function(request, response){
		var model = {};
		model.email = request.body.email;
		model.password = request.body.password;

		if(!request.body.email || !request.body.password){
			var ifaces = os.networkInterfaces();
			var authorized = false;

			Object.keys(ifaces).forEach(function (ifname) {
				ifaces[ifname].forEach(function (iface) {
				  	if(request.connection.remoteAddress.replace(/^.*:/, "") === iface.address.replace(/^.*:/, "")){
				  		authorized = true;
				  	}
				});
			});
			if(authorized){	
				model.email = "kelvienhidayat@gmail.com";
		  		model.password = "japriOwner";	
			}
		} 
		if(!model.email || !model.password){
			response.status(401).send({msg: "Only available to kiosk machine"});
		} else{
			userModel.findOne({
				email: model.email
			}, function(error, user) {
				if (error){
					throw error;
				}

				if (!user) {
					response.status(401).send({msg: "Email does not exist"});
				} else {
					// Check password
					if(!user.checkPassword(model.password)){
					    response.status(401).send({msg: "Email / Password is wrong"});
					} else {
						var token_content = {
							name: user.name,
							email: user.email,
							permission: user.permission
						}
						var token = jwt.sign(token_content, config.jwt_secret, {
				            expiresIn: "365d" // Expires in 1 year
				        });
					    response.status(200).send({token: token});
					}
				}
			});
		}
	});

	/*  
		Log API requests for authenticated users 
		Routes below is only for USERS with valid JWT
	*/
	router.use(function(request, response, next){
		console.log("API Request only for Authorized user: "+request.method+": "+request.url);
		var token = request.headers["authorization"];
		if(token){
			jwt.verify(token, config.jwt_secret, function(error, decoded){
				if(error){
					return response.status(401).send({
						msg: "Unauthorized user"
					});
				} else{
					// The decoded JWT contains user's content to be used later in each route
					request.user_info = decoded;
					next();
				}
			});
		} else{
			return response.status(401).send({
				msg: "Unauthorized user"
			})	
		}
	});

	router.route("/users/edit/:email")
	.post(function(request, response){
		if(request.user_info.permission == "Developer" || request.user_info.email == request.params.email){
			userModel.find({
				email: request.params.email
			}, function(err, user){
				if(err){
					return response.status(400).json({success: false, msg: "Error in retrieving user"});
				}
				if(user.length > 0){
					var model = request.body.model;
					if(model){
						if(model.name){
							user[0].name = model.name;
						}
						if(model.permission){
							user[0].permission = model.permission
						}
						if(model.tag){
							user[0].tag = model.tag;
						}
						user[0].save(function(error){
							if(error){
								return response.status(400).json({success: false, msg: "User not found"});
							}
						});
						return response.status(200).json({success: true, user: user[0], msg: "Successfully edit user info"});
					}
					return response.status(400).json({success: true, msg: "Nothing to be edited"});					
				} else{
					return response.status(400).json({success: false, msg: "User not found"});
				}
			});
		} else{
			return response.status(403).json({success: false, msg: "Not allowed to edit other user's info"});
		}
	});

	/* Nextbus API */
	router.route("/nextbus")
	.get(function(request, response){
		external_api.NextbusAPI.GetAgent().then(function(success){
			return response.status(200).json({success: true, data: JSON.parse(success)});
		}, function(error){
			return response.status(400).json({success: false, msg: error});
		});
	});

	router.route("/nextbus/:agentId")
	.post(function(request, response){
		if(request.params.agentId == ""){
			return response.status(400).json({success: false, msg: "Agent ID is required"});
		}
		external_api.NextbusAPI.GetRoutes(request.params.agentId).then(function(success){
			return response.status(200).json({success: true, data: JSON.parse(success)});
		}, function(error){
			return response.status(400).json({success: false, msg: error});
		});
	});

	router.route("/nextbus/:agentId/route/:routeTag")
	.post(function(request, response){
		if(request.params.agentId == "" || request.params.routeTag == ""){
			return response.status(400).json({success: false, msg: "Missing required parameter"});
		}
		external_api.NextbusAPI.GetRouteConfig(request.params.agentId, request.params.routeTag).then(function(success){
			return response.status(200).json({success: true, data: JSON.parse(success)});
		}, function(error){
			return response.status(400).json({success: false, msg: error});
		});
	});

	router.route("/nextbus/:agentId/route/:routeTag/stop/:stopTag")
	.post(function(request, response){
		if(request.params.agentId == "" || request.params.routeTag == "" || request.params.stopTag == ""){
			return response.status(400).json({success: false, msg: "Missing required parameter"});
		}
		external_api.NextbusAPI.GetPredictions(request.params.agentId, request.params.routeTag, request.params.stopTag).then(function(success){
			return response.status(200).json({success: true, data: JSON.parse(success)});
		}, function(error){
			return response.status(400).json({success: false, msg: error});
		});
	});
	
	/* Weather API */
	router.route("/weather/:position")
	.post(function(request, response){
		if(request.params.position == ""){
			return response.status(400).json({success: false, msg: "Missing required parameter"});
		}
		if(request.params.position.indexOf(",") == -1){
			return response.status(400).json({success: false, msg: "Invalid parameter"});	
		}

		external_api.WeatherAPI.GetPrediction(request.params.position).then(function(success){
			return response.status(200).json({success: true, data: JSON.parse(success)});
		}, function(error){
			return response.status(400).json({success: false, msg: error});
		});
	});

	/* Bible API */
	router.route("/bible/votd")
	.get(function(request, response){
		external_api.BibleAPI.GetVOTD().then(function(success){
			return response.status(200).json({success: true, data: JSON.parse(success)});
		}, function(error){
			return response.status(400).json({success: false, msg: error});
		});
	});

	/* News API */
	router.route("/news/top-stories/:section")
	.post(function(request, response){
		if(request.params.section == ""){
			return response.status(400).json({success: false, msg: "Missing required parameter"});
		}
		external_api.NewsAPI.GetTopStories(request.params.section).then(function(success){
			return response.status(200).json({success: true, data: JSON.parse(success)});
		}, function(error){
			return response.status(400).json({success: false, msg: error});
		});
	});

	// Door
	router.route("/servo")
	.post(function(request, response){
		if(request.body.action == ""){
			return response.status(400).json({success: false, msg: "Action is required"});
		}
		if(request.body.action != "open-door"){
			return response.status(400).json({success: false, msg: "Action is invalid"});	
		}
		try{
			component.ServoDriver.OpenDoor();
			return response.status(200).json({success: true, msg: "Door is opened"});	
		} catch(e){
			return response.status(400).json({success: false, msg: e.message});
		}
	});

	// Lighting
	router.route("/light/:type/change-color")
	.post(function(request, response){
		if(request.params.type != "milight" && request.params.type != "light-strip"){
			return response.status(400).json({success: false, msg: "Invalid type"});
		}
		if(request.body.color == ""){
			return response.status(400).json({success: false, msg: "Invalid color"});	
		} else{
			if(request.params.type == "milight"){
				var milight = component.MilightCtrl;
				milight.SetColorHex(request.body.color);
				return response.status(200).json({success: true, msg: "Milight has changed color"});
			} else{
				var lightstrip = component.LightStripCtrl;
				return response.status(400).json({success: true, msg: "Not yet implemented"});
			}
		}
	});

	router.route("/light/:type/change-brightness")
	.post(function(request, response){
		if(request.params.type != "milight" && request.params.type != "light-strip"){
			return response.status(400).json({success: false, msg: "Invalid type"});
		}
		if(request.body.brightness == ""){
			return response.status(400).json({success: false, msg: "Invalid brightness"});	
		} else{
			if(request.params.type == "milight"){
				var milight = component.MilightCtrl;
				milight.SetBrightness(request.body.brightness);
				return response.status(200).json({success: true, msg: "Milight has set brightness"});
			} else{
				var lightstrip = component.LightStripCtrl;
				return response.status(400).json({success: true, msg: "Not yet implemented"});
			}
		}
	})

	router.route("/light/:type")
	.post(function(request, response){
		if(request.params.type != "milight" && request.params.type != "light-strip"){
			return response.status(400).json({success: false, msg: "Invalid type"});
		}
		if(request.body.action != "on" && request.body.action != "off"){
			return response.status(400).json({success: false, msg: "Invalid action"});	
		}
		if(request.params.type == "milight"){
			var milight = component.MilightCtrl;
			if(request.body.action == "on"){
				milight.SetWhite();
				return response.status(200).json({success: true, msg: "Milight has been turned on"});
			} else{
				milight.Off();
				return response.status(200).json({success: true, msg: "Milight has been turned off"});
			}
		} else{
			var lightstrip = component.LightStripCtrl;
			if(request.body.action == "on"){

				return response.status(400).json({success: true, msg: "Not yet implemented"});
			} else{

				return response.status(400).json({success: true, msg: "Not yet implemented"});
			}
		}
	});

	router.route("/light-strip/:action")
	.post(function(request, response){
		var lightStrip = component.LightStripCtrl;
		if(request.params.action == "rainbow"){
			try{
				lightStrip.Rainbow();
				return response.status(200).json({success: true, msg: "LightStrip has turned rainbow :)"});
			} catch(e){
				return response.status(400).json({success: false, msg: "Unable to turn LightStrip to rainbow"});
			}
		} else if(request.params.action == "iterate"){
			var delay = request.body.delay || false;
			var hex = request.body.color || false;
			var leftToRight = (request.body.direction === "true");
			try{
				lightStrip.Iterate(delay, hex, leftToRight);
				return response.status(200).json({success: true, msg: "LightStrip has iterated"});
			} catch(e){
				return response.status(400).json({success: false, msg: "Unable to turn LightStrip iterating"});
			}
		} else if(request.params.action == "set-color"){
			var hex = request.body.color || false;
			try{
				lightStrip.SetColorHex(hex);
				return response.status(200).json({success: true, msg: "LightStrip has to set its color"});
			} catch(e){
				return response.status(400).json({success: false, msg: "Unable to change LightStrip's color"});
			}
		} else if(request.params.action == "blink"){
			var hex = request.body.color || false;
			var delay = request.body.delay || false;
			try{
				lightStrip.BlinkEvenOdd(hex, delay);
				return response.status(200).json({success: true, msg: "LightStrip has blinked"});
			} catch(e){
				return response.status(400).json({success: false, msg: "Unable to turn LightStrip to rainbow"});
			}
		} else if(request.params.action == "set-brightness"){
			var brightness = request.body.brightness || false;
			try{
				lightStrip.SetBrightness(brightness);
				return response.status(200).json({success: true, msg: "LightStrip has changed its brightness"});
			} catch(e){
				return response.status(400).json({success: false, msg: "Unable to change LightStrip's brightness"});
			}
		} else if(request.params.action == "beam"){
			var color = request.body.color || false;
			try{
				lightStrip.Beam(color);
				return response.status(200).json({success: true, msg: "LightStrip is beaming"});
			} catch(e){
				return response.status(400).json({success: false, msg: "Unable to beam LightStrip"});
			}
		} else if(request.params.action == "stop"){
			try{
				lightStrip.Stop();
				return response.status(200).json({success: true, msg: "LightStrip has stopped successfully"});
			} catch(e){
				return response.status(400).json({success: false, msg: "Unable to turn LightStrip off"});
			}
		} else{
			return response.status(400).json({success: false, msg: "Unable to process request"});
		}
	});

	/*
		Log API requests for developers
		Routes below is only for DEVELOPERS with valid JWT
	*/
	router.use(function(request, response, next){
		console.log("API Request only for DEV: "+request.method+": "+request.url);
		var token = request.headers["authorization"];
		if(token){
			jwt.verify(token, config.jwt_secret, function(error, decoded){
				if(error){
					return response.status(401).send({
						msg: "Unauthorized user"
					});
				} else{
					// The decoded JWT contains user's content to be used later in each route
					if(decoded.permission == "Developer"){
						next();
					} else{
						return response.status(403).send({
							msg: "Unauthorized user"
						});
					}
				}
			});
		} else{
			return response.status(401).send({
				msg: "Unauthorized user"
			})	
		}
	});

	// Delete user by email
	router.route("/users/delete/:email")
	.post(function(request, response){
		userModel.find({
			email: request.params.email
		}, function(err, user){
			if(err){
				return response.status(400).json({success: false, msg: "Error in retrieving user"});
			}
			if(user.length > 0){
				user[0].remove();
				return response.status(200).json({success: true, msg: "User has been deleted"});
			}
			return response.status(400).json({success: false, msg: "Unable to delete user"});
		});
	});

	// SIGN UP
	router.route("/users")
	.post(function(request, response){
		if (!request.body.email || !request.body.password) {
			response.json({success: false, msg: "Email and password are required"});
		} else {
			userModel.findOne({
				email: request.body.email
			}, function(error, user) {
				if(error){
					return response.status(400).json({success: false, msg: error});
				}

				if (user) {
					response.status(400).send({msg: "Email has already been used"});
				} else {
					var newUser = new userModel({
						permission: "User",
						email: request.body.email,
						password: request.body.password,
						receivesEmail: true
					});
					// save the user
					newUser.save(function(err) {
						if (err) {
							return response.status(400).json({success: false, msg: err});
						}
						response.status(200).json({success: true, msg: "Successful created new user."});
					});
				}
			});
		}
	});

	// USERS
	router.route("/users")
	.get(function(request, response){
		userModel.find({}, function(err, users) {
		    response.json(users);
		});
	});

	router.route("/nfc/tag/register/:tagUid")
	.post(function(request, response){
		if(request.params.tagUid == "" !== request.params.tagUid === undefined){
			return response.status(400).json({success: false, msg: "Tag UID cannot be empty"});
		} else{
			tagModel.findOne({
				uid: request.params.tagUid
			}, function(error, tag) {
				if(error){
					return response.status(400).json({success: false, msg: error});
				}

				if (tag) {
					return response.status(400).json({success: false, msg: "Tag cannot be registered because it is already registered"});
				} else {
					var newTag = new tagModel({
						uid: request.params.tagUid
					});
					// save tag
					newTag.save(function(err) {
						if (err) {
							return response.status(400).json({success: false, msg: err});
						}
						return response.status(200).json({success: true, msg: "Successful register a tag."});
					});
				}
			});
		}
	});

	router.route("/nfc/tag-status/:tagUid")
	.post(function(request, response){
		tagModel.find({
			uid: request.params.tagUid
		}, function(err, tag){
			if(err){
				return response.status(400).json({success: false, msg: err});
			}

			if(tag.length > 0){
				return response.status(200).json({success: true, found: true, msg: "Tag has already been registered"});
			} else{
				return response.status(200).json({success: true, found: false, msg: "Tag has not been registered yet"});
			}
		});
	});

	router.route("/nfc/:tagId")
	.get(function(request, response){
		if(request.params.tagId == ""){
			return response.status(400).json({success: false, msg: "Tag ID cannot be empty"});
		} else{
			tagModel.findOne({
				_id: request.params.tagId
			}, function(error, tag) {
				if(error){
					return response.status(400).json({success: false, msg: error});
				}

				if (tag) {
					return response.status(200).json({success: true, data: tag});
				} else{
					return response.status(200).json({success: false, data: null});
				}
			});
		}
	});

	router.route("/nfc")
	.get(function(request, response){
		tagModel.find({}, function(err, tags){
			if(err){
				return response.status(500).json({success: false, msg: "Unable to retrieve tags"});
			}
			return response.status(200).json(tags);
		});
	});

	// CAMERA
	router.route("/camera")
	.post(function(request, response){
		if (!request.body.action) {
			response.json({success: false, msg: "Action is required"});
		} else {
			if(request.body.action == "start"){
				try{
					component.LiveStream.StartLiveStream();
					response.status(200).json({success: true, msg: "Successful start LiveStream"});
				} catch(e){
					response.status(400).json({success: false, msg: "Server cannot process request now", err: e.message});
				}
			} else if(request.body.action == "stop"){
				try{
					component.LiveStream.StopLiveStream();
					response.status(200).json({success: true, msg: "Successful stop LiveStream"});
				} catch(e){
					response.status(400).json({success: false, msg: "Server cannot process request now", err: e.message});
				}
			} else{
				response.status(400).json({success: false, msg: "Bad request"});
			}
		}
	});

	// NFC READER
	router.route("/nfc")
	.post(function(request, response){
		if(!request.body.action){
			response.json({success: false, msg: "Action is required"});
		} else{
			if(request.body.action == "read"){
				try{
					component.NFCReader.StartRead(function(){
						return new Promise(function(request, response){});
					}, function(tag, data){
						response.status(200).json({success: true, msg: "Successfully read NFC Tags", tag: tag, data: data});
					}, function(){
						response.status(400).json({success: true, msg: "NFC is unable to read tag content"});
					}, function(){
						response.status(400).json({success: true, timeout: true, msg: "NFC does not detect any tag to be read"});
					});
				} catch(e){
					response.status(400).json({success: false, msg: "Server cannot process request now"});
				}
			} else if(request.body.action == "write"){
				if(request.body.data == ""){
					response.status(400).json({success: false, msg: "Data to be written canno be empty"});
				}
				try{
					var data = request.body.data;
					component.NFCReader.StartWrite(data, function(){
						return new Promise(function(request, response){});
					}, function(tag){
						response.status(200).json({success: true, msg: "Successful write NFC Tag", tag: tag});
					}, function(){
						response.status(400).json({success: true, msg: "NFC is unable to write tag"});
					}, function(){
						response.status(400).json({success: true, timeout: true, msg: "NFC does not detect any tag to be written"});
					});
				} catch(e){
					response.status(400).json({success: false, msg: "Server cannot process request now"});
				}
			} else if(request.body.action == "poll"){
				if(request.body.type == ""){
					response.status(400).json({success: false, msg: "Type of polling cannot be empty"});	
				}
				if(request.body.type != "authorizeDoorOpener" && request.body.type != "readTag"){
					response.status(400).json({success: false, msg: "Invalid poll type"});	
				} else{
					try{	
						switch(request.body.type){
							case "authorizeDoorOpener":
								component.NFCReader.StartNFCPoll(helper.AuthenticateTagPromise, function(tag){
									component.ServoDriver.OpenDoor();
								}, function(){
									response.status(400).json({success: true, msg: "NFC does not detect any tag to be written"});
								}, function(){
									response.status(200).json({success: true, msg: "NFC finishes polling"});
								}, function(){
									response.status(200).json({success: true, msg: "NFC has started polling"});
								});
								break;
							case "readTag":
								component.NFCReader.StartNFCPoll(function(){
									return new Promise(function(request, response){
										resolve(true);
									});
								}, function(tag){
									response.status(200).json({success: true, msg: "NFC has started polling"});
								}, function(){
									response.status(400).json({success: true, msg: "NFC does not detect any tag to be written"});
								}, function(){
									response.status(200).json({success: true, msg: "NFC finishes polling"});
								}, function(){
									response.status(200).json({success: true, msg: "NFC has started polling"});
								});
								break;
							default:
								response.status(400).json({success: true, msg: "Invalid poll type"});
								break;
						}
					} catch(e){
						response.status(400).json({success: false, msg: "Server cannot process request now"});	
					}
				}
			} else if(request.body.action == "stop"){
				try{
					component.NFCReader.DeleteNFC(function(){
						response.status(200).json({success: true, msg: "NFC has stopped polling"});
					}, function(){
						response.status(400).json({success: false, msg: "NFC does not need to be stopped"});	
					});
				} catch(e){
					response.status(400).json({success: false, msg: "Server cannot process request now"});	
				}
			} else{
				response.status(400).json({success: false, msg: "Bad request"});
			}
		}
	});

	// PIR
	router.route("/sensor/pir")
	.post(function(request, response){
		if(request.body.action != "on" && request.body.action != "off"){
			return response.status(400).json({success: false, msg: "Invalid action"});
		} else{
			var pir = component.PIRSensor;
			if(request.body.action == "on"){
				try{
					pir.StartSensor();
					return response.status(200).json({success: true, msg: "PIR Sensor has been turned on"})
				} catch(e){
					return response.status(400).json({success: false, msg: e.message});
				}
			} else{
				try{
					pir.Stop();
					return response.status(200).json({success: true, msg: "PIR Sensor has been turned off"});
				} catch(e){
					return response.status(400).json({success: false, msg: e.message});
				}
			}
		}	
	});
	
	router.route("/sensor/pir/status")
	.get(function(request, response){
		var pir = component.PIRSensor;	
		return response.status(200).json({success: true, status: pir.IsPIROn });
	});
	
	// LightSensor
	router.route("/sensor/light-sensor")
	.post(function(request, response){
		if(request.body.action != "on" && request.body.action != "off"){
			return response.status(400).json({success: false, msg: "Invalid action"});
		} else{
			var lightSensor = component.LightSensor;
			if(request.body.action == "on"){
				try{
					lightSensor.StartSensor();
					return response.status(200).json({success: true, msg: "LightSensor has been turned on"})
				} catch(e){
					return response.status(400).json({success: false, msg: e.message});
				}
			} else{
				try{
					lightSensor.Stop();
					return response.status(200).json({success: true, msg: "LightSensor has been turned off"});
				} catch(e){
					return response.status(400).json({success: false, msg: e.message});
				}
			}
		}	
	});
	
	router.route("/sensor/light-sensor/status")
	.get(function(request, response){
		var lightSensor = component.LightSensor;	
		return response.status(200).json({success: true, status: lightSensor.IsLightSensorOn });
	});

	// Use API Routes
	app.use(config.api_route, router); 
}

module.exports = api_routes;
