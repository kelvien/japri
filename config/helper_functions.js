var path = require("path");
var fs = require("fs-extra");
var nodemailer = require("nodemailer");
var spawn = require("child_process").spawn;

var userModel = require("../models/user.js");
var tagModel = require("../models/tag.js");

function Helper(config){

	var helper = this;
	
	// ENUM values
	helper.LightRank = {
		LIGHT: "Light",
		MODERATE: "Moderate",
		ALMOST_DARK: "Almost Dark",
		DARK: "Dark"
	}
	
	var notificationThreshold = {
		movement: 1000 * 60, // 1 Minute 
		unnecessaryPower: 1000 * 60 // 1 Minute
	}

	helper.AuthenticateTagPromise = AuthenticateTagPromise;
	helper.WriteToFilePromise = WriteToFilePromise;
	helper.EmptyFilePromise = EmptyFilePromise;
	
	helper.LightSensitivity = LightSensitivity;
	helper.FitBrightness = FitBrightness;
	helper.NeedsLight = NeedsLight;

	helper.SentRecentNotification = SentRecentNotification;

	helper.CreateGIFAndSendEmail = CreateGIFAndSendEmail;
	helper.SendEmail = SendEmail;

	function AuthenticateTagPromise(tag){
	var promise = new Promise(function(resolve, reject) {
	  	if(tag){
	  		tagModel.findOne({
	  			uid: tag.uid
	  		}, function(error, scannedTag){
	  			if (error){
	  				reject(false);
	  			}
	  			if(scannedTag){
	  				userModel.findOne({
	  					tag: scannedTag._id
	  				}, function(error, user) {
	  					if (error){
	  						reject(false);
	  					}
	  					if (user) {
	  						resolve(true);
	  					} else{
	  						reject(false);
	  					}
	  				});
	  			}
	  		});
	  	} else{
	  		reject(false);
	  	}
	  });
	  
	  return promise;
	}
	
	function WriteToFilePromise(data, filePath){
	var formatData;
	var promise = new Promise(function(resolve, reject) {
	try {
	  formatData = JSON.stringify(data);
	} catch (e) {
	  formatData = data;      
	}
	  	fs.writeFile(filePath, formatData, function(err) {
	  	    if(err) {
	  	    	reject(false);
	  	    }else{
	  	    	resolve(true);
	  	    }
	  	}); 
	  });
	  return promise;
	}
  
	function EmptyFilePromise(filePath){
	var promise = new Promise(function(resolve, reject) {
	    fs.writeFile(filePath, "", function(err) {
	        if(err) {
	        	reject(false);
	        }else{
	        	resolve(true);
	        }
	    }); 
	});
	return promise;
	}

	function LightSensitivity(light){
	  if(light < 2000){
	  	// Considered as not needing lighting
	    	return helper.LightRank.LIGHT;
	  } else if(light >= 2000 && light < 3500){
	    	// Considered as moderate, and still don't need light
	    	return helper.LightRank.MODERATE;
	  } else if(light >= 3500 && light < 5000){
	    	// Considered as almost dark
	    	return helper.LightRank.ALMOST_DARK;
	  } else{ // Above 5000 is considered as dark
	    	// Considered as dark
	    	return helper.LightRank.DARK;
	  }
	}
	
	/*Brightness scale: out of 100*/
	function FitBrightness(lightEnum){
		switch(lightEnum){
			case helper.LightRank.LIGHT:
				return 0;
			case helper.LightRank.MODERATE:
				return 0;
			case helper.LightRank.ALMOST_DARK:
				return 50;
			case helper.LightRank.DARK:
				return 80;
			default:
				return false;
		}
	}
	
	function NeedsLight(lightEnum){
		switch(lightEnum){
			case helper.LightRank.LIGHT:
				return false;
			case helper.LightRank.MODERATE:
				return true;
			case helper.LightRank.ALMOST_DARK:
				return true;
			case helper.LightRank.DARK:
				return true;
			default:
				return false;
		}
	}

	function SentRecentNotification(type, lastNotification){
		var threshold = (type == "pir-sensor") ? notificationThreshold.movement : notificationThreshold.unnecessaryPower;
		var now = new Date();

		if(lastNotification === false || now.getTime() - lastNotification.getTime() > threshold){
			return now;
		} else{
			return true;
		}
	}

	function CreateGIFAndSendEmail(email, liveStreamFolderPath, dimensionX, dimensionY){
		// Timeout to allow camera to capture the next 6 images (LiveStream captures interval is 500ms)
        // This is so that the attachment will contain the 5 images before motion is detected + 6 images during and
        // after the motion is detected. This gives a good context to show to user what is happening
        setTimeout(function(){
        	// Copy files in LiveStream path to the static one
        	var staticFolderPath = path.join(__dirname, "/../library/images/image_sequence");
        	// Clear static directory first
        	fs.emptyDir(staticFolderPath, function (err) {
        		if(!err){
        			// Copy all images from livestream to the static folder
        			fs.copy(liveStreamFolderPath, staticFolderPath, function (err) {
        				if(!err){
        					// Begin creating GIF
							var imageSequenceFolderPath = staticFolderPath + "/*.png";
							var resultDestination = staticFolderPath + "/whathappened.gif";
							// Options: Path, dimension-x, dimension-y, image sequence folder path, and destination path
							var options = [path.join(__dirname, "/../library/GIFGenerator/gif_generator.js"), dimensionX, dimensionY, imageSequenceFolderPath, resultDestination]
							var creatingGIF = spawn("node", options);
							creatingGIF.on("exit", function(code){
								if(code == 1){
									SendEmail("movement", email, false);
								} else{
									SendEmail("movement", email, {type: "gif", name: "whathappened.gif", path: resultDestination});
								}
							});
        				} else{
        					SendEmail("movement", email, false);		
        				}
					});
        		} else{
        			SendEmail("movement", email, false);
        		}
			})
	    }, 3000);
	}

	function SendEmail(type, email, attachment){
		var processedBody = (attachment === false) ? "Unable to retrieve image." : "Attached is series of images to show you what happened.";
		var processedAttachment = [];
		if(attachment.type == "folder"){
			var files = fs.readdirSync(attachment.path);
			for(var a = 0; a < files.length; a++){
				processedAttachment.push({filename: "image-"+(a+1)+".png", filePath: attachment.path + "/" + files[a]});
			}
		} else{
			processedAttachment.push({filename: attachment.name, filePath: attachment.path});
		}

		var transporter = nodemailer.createTransport("SMTP",{
		    service: "gmail",
		    auth: {
		        user: config.mailer_email,
		        pass: config.mailer_password
			}
		});

		switch(type){
			case "movement":
				var now = new Date();

				var mailOptions = {
				    from: "Japri <"+config.mailer_email+">", 
				    to: email,
				    subject: "Japri detected movement",  
				    html: "<p>We detected movement in front of home's door at <b>"+now+"</b></p>"+
				    	"<p>"+processedBody+"</p>",
				    attachments: processedAttachment
				};
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        console.log("Unable to send email (Movement detected) to "+email+". Error: "+error);
				    } else{
				    	console.log("Email (Movement detected) sent to " + email);
				    }
				});
				break;
			default:
				break;
		}
	}
	
  return helper;
}

module.exports = Helper;
