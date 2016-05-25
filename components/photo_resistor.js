var spawn = require("child_process").spawn;
var path = require("path");

function PhotoResistor(){
  var photoResistor = this;
  
	photoResistor.process;
	photoResistor.IsPhotoResistorOn = false;

	photoResistor.time;
	photoResistor.DataRead;

	photoResistor.StartSensor = StartSensor;
	photoResistor.Start = Start;
	photoResistor.Stop = Stop;

	function Start(exit, error, stdout, stderr){
		exit = exit || function(){};
		error = error || function(){};
		stdout = stdout || function(){};
		stderr = stderr || function(){};

		if(!photoResistor.process){
			photoResistor.process = spawn("python", [path.join(__dirname, "/../library/PhotoResistor/PhotoResistor.py")]);
			// on finishing command
			photoResistor.process.on("exit", function(){
				photoResistor.IsPhotoResistorOn = false;
				exit();
			});
			// error
			photoResistor.process.on("error", function(){
				photoResistor.IsPhotoResistorOn = false;
				error();
			});
			// stdout message
			photoResistor.process.stdout.on("data", function(data){
				photoResistor.IsPhotoResistorOn = true;
				photoResistor.DataRead = data.toString();

				var now = new Date();
				photoResistor.time = now.getTime();
			})
			// stderr message
			photoResistor.process.stderr.on("data", function(data){
				// Continue on warning on this script, so don't stop it
				//photoResistor.Stop();
				photoResistor.IsPhotoResistorOn = false;
				stderr();
			});
		} else{
			throw "PIR Sensor is currently running";	
		}

	}

	function Stop(){
		if(photoResistor.process){
			photoResistor.process.kill();
			photoResistor.IsPhotoResistorOn = false;
			delete photoResistor.process;
		} else{
			console.log("PhotoResistor is not stopped because it is not running");
		}
	}

	function StartSensor(){
		try{
			photoResistor.Start(function(exit){
				
			}, function(error){
				console.log("Error in Photo resistor script");
			}, function(stdout){
				
			}, function(stderr){
				console.log("Error in Photo resistor script");
			});	
		} catch(e){
			throw e.message;	
		}
	}

}

module.exports = PhotoResistor;
