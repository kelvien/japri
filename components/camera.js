var spawn = require("child_process").spawn;
var path = require("path");
var fs = require("fs");

module.exports = Camera;

// Default settings
var default_dimensionX = 768;
var default_dimensionY = 576;
var default_camera_file_name = "/image";
var default_camera_file_format = ".png";

var default_camera_file_folder_path = path.join(__dirname, "/../library/images/livestream");
var default_camera_sequence_file_path = path.join(default_camera_file_folder_path, "/whathappened.gif");

var default_camera_args = [ 
			"-e", "png", // Encoding type: .png
			"-t", 10, // Pause time before taking picture
			"-w", default_dimensionX, // Width
			"-h", default_dimensionY, // Height
			"-q", 10, // Quality
			"-br", 70, // Brightness
			"-co", 70, // Contrast
			"-n", // Show no preview
			"--exposure", "sports"] // Exposure type: Sports (Minimize blurry image on moving objects)

var image_sequence_folder = path.join(__dirname, "/../library/images/livestream/*.png");

var total_num_of_sequences = 11; // Exclusive
var number_of_images = 0;

function Camera(config, helper){
	var camera = this;

	camera.FileFolderPath = default_camera_file_folder_path;
	camera.FilePath;

	// Variables
	camera.isCameraOn = false;
	camera.IsLiveStreamOn = false;
	camera.time;

	// LiveStream Interval Object
	camera.LiveStreamIntervalObj;

	// Raspistill process Object
	camera.process;

	// Basic Functions
	camera.Start = Start;
	camera.Stop = Stop;
	camera.Restart = Restart;

	// LiveStream
	camera.StartLiveStream = StartLiveStream;
	camera.RunLiveStream = RunLiveStream;
	camera.StopLiveStream = StopLiveStream;

	Init();

	function Init(){
		// Remove all pictures
		var files = fs.readdirSync(default_camera_file_folder_path); 
	      	if (files.length > 0){
	      		for (var i = 0; i < files.length; i++) {
	          		var filePath = default_camera_file_folder_path + '/' + files[i];
				if (fs.statSync(filePath).isFile()){
					fs.unlinkSync(filePath);	
				}
	      		}
	      	}
	}

	function Start(exit, error, stdout, stderr, config){
		exit = exit || function(){};
		error = error || function(){};
		stdout = stdout || function(){};
		stderr = stderr || function(){};
		
		try{
			if(!camera.process){
				camera.isCameraOn = true;
				
				config = config || default_camera_args;
				
				camera.process = spawn("raspistill", config);
				// on finishing command
				camera.process.on("exit", function(){
					exit();
				});
				// error
				camera.process.on("error", function(){
					error();
					//camera.Stop();
				});
				// stdout message
				camera.process.stdout.on("data", function(data){
					stdout(data);
				});
				// stderr message
				camera.process.stderr.on("data", function(data){
					stderr(data);
					//camera.Stop();
				});
			}
		} catch(e){
			throw e.message;
		}
	}

	function Stop(){
		if(camera.process){
			camera.process.kill();
			delete camera.process;
			camera.isCameraOn = false;
		} else{
			throw "Raspistill is not stopped because it is not running.";
		}
	}

	function Restart(config){
		try{
			if(camera.process){
				Stop();	
			}
			Start(config);
		} catch(e){
			throw e.message;
		}
	}

	// LiveStream Functionalities
	function StartLiveStream(interval){
		interval = interval || 1000;
		if(!camera.LiveStreamIntervalObj){
			try{
				camera.LiveStreamIntervalObj = setInterval(RunLiveStream, interval);
			} catch(e){
				throw e.message;
			}
		} else{
			throw "Error: LiveStream instance has already been started";
		}
	}

	function RunLiveStream(){
		try{
			var imagePath = GetImagePath();
			var config = default_camera_args.slice(0);
			config.push("-o", imagePath);
			
			camera.Start(function(exit){
				// Additional check if the remaining spawn is still running when we stop the component
				// If not, then we should not mark isLiveStreamOn as true
				if(camera.LiveStreamIntervalObj){
					camera.IsLiveStreamOn = true;
					
					// Refer to new filePath
					camera.FilePath = imagePath;
					number_of_images++;

					ImageTaken();
				}
				camera.Stop();
			}, function(error){
				console.log("Error in Raspistill");
				clearInterval(camera.LiveStreamIntervalObj);
			}, function(stdout){
				
			}, function(stderr){
				console.log("Error in Raspistill");
				clearInterval(camera.LiveStreamIntervalObj);
			}, config);
		} catch(e){
			throw e.message;
		}
	}

	function StopLiveStream(){
		if(camera.LiveStreamIntervalObj){
			clearInterval(camera.LiveStreamIntervalObj);
			camera.IsLiveStreamOn = false;
			delete camera.LiveStreamIntervalObj;
		} else{
			throw "Error: LiveStream instance does not need to be stopped";
		}
	}

	function GetImagePath(){
		var now = new Date();
		return default_camera_file_folder_path + default_camera_file_name + now.getTime() + default_camera_file_format;
	}

	function ImageTaken(){
		// Remove file if it exceeds half of the gif sequence
		if(number_of_images == total_num_of_sequences){
			var files = fs.readdirSync(default_camera_file_folder_path);
		 	// For now, assume the first one in the files will be the oldest image
	       	fs.unlinkSync(filePath = default_camera_file_folder_path + '/' + files[0]);	
	       	number_of_images--;
		}
	}

	return camera;
}

