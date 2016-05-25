var spawn = require("child_process").spawn;
var path = require("path");

var default_servo_duration = 5000;

function Servo(){
	var servo = this;

	// Variables
	servo.process;
	servo.IsServoOn = false;

	// Functions
	servo.OpenDoor = OpenDoor;
	servo.Open = Open;
	servo.Stop = Stop;

	// Servo Basic Functions
	function Open(duration, exit, error, stdout, stderr){
		duration = duration || 5000;
		exit = exit || function(){};
		error = error || function(){};
		stdout = stdout || function(){};
		stderr = stderr || function(){};

		try{
			if(!servo.process){
				servo.IsServoOn = true;
				servo.process = spawn("python", [path.join(__dirname, "/../library/Adafruit_PWM_Servo_Driver/Servo.py"), "5"]);
				// on finishing command
				servo.process.on("exit", function(){
					exit();
				});
				// error
				servo.process.on("error", function(){
					servo.Stop();
					error();
				});
				// stderr message
				servo.process.stderr.on("data", function(data){
					servo.Stop();
					stderr(data);
				});
				// stdout message
				servo.process.stdout.on("data", function(data){
					stdout(data);
				});
			} else{
				throw "Servo is currently running";
			}	
		} catch(e){
			throw e.message;
		}
	}
	
	function Stop(){
		if(servo.process){
			servo.process.kill();
			servo.IsServoOn = false;
			delete servo.process;
		} else{
			throw "Servo is not stopped because it is not running";
		}
	}

	function OpenDoor(duration){
		duration = duration || default_servo_duration;
		
		try{
			servo.Open(duration, function(exit){
				servo.Stop();
			}, function(error){
				throw "Error in Servo script";
			}, function(stdout){
	
			}, function(stderr){
				throw "Error in Servo script";
			});	
		} catch(e){
			throw e.message;	
		}
	}

	return servo;
}

module.exports = Servo;
