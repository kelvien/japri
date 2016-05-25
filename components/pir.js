var spawn = require("child_process").spawn;
var path = require("path");

function PIR(){
	var pir = this;

	pir.process;
	pir.IsPIROn = false;
	
	pir.time;
	pir.DataRead;

	pir.StartSensor = StartSensor;
	pir.Start = Start;
	pir.Stop = Stop;

	function Start(exit, error, stdout, stderr){
		exit = exit || function(){};
		error = error || function(){};
		stdout = stdout || function(){};
		stderr = stderr || function(){};

		if(!pir.process){
			pir.process = spawn("python", [path.join(__dirname, "/../library/PIR/PIR.py")]);
			// on finishing command
			pir.process.on("exit", function(){
				pir.IsPIROn = false;
				delete pir.process;
				exit();
			});
			// error
			pir.process.on("error", function(){
				pir.IsPIROn = false;
				delete pir.process;
				error();
			});
			// stdout message
			pir.process.stdout.on("data", function(data){
				var now = new Date();
				pir.time = now.getTime();
				
				pir.IsPIROn = true;
				pir.DataRead = data.toString();
			})
			// stderr message
			pir.process.stderr.on("data", function(data){
				pir.IsPIROn = false;
				delete pir.process;
				stderr();
			});
		} else{
			throw "PIR Sensor is currently running";	
		}
	}
	
	function Stop(){
		if(pir.process){
			pir.process.kill();
			pir.IsPIROn = false;
			delete pir.process;
		} else{
			throw "PIR Sensor is not stopped because it is not running";
		}
	}

	function StartSensor(){
		try{
			pir.Start(function(exit){
				
			}, function(error){
				console.log("Error in  PIR sensor script");
			}, function(stdout){
				
			}, function(stderr){
				console.log("Error in PIR sensor script");
			});	
		} catch(e){
			throw e.message;	
		}
	}

	return pir;
}

module.exports = PIR;
