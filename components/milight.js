var Milight = require("milight");

function Light(ip){
	var light = this;

	light.milight = new Milight({
	    host: ip,
	    broadcast: false,
	    delayBetweenMessages: 1
	});

	// Variables
	light.IsMilightOn = false;
	light.Brightness = 0;

	light.SetOn = SetOn;
	light.Off = Off;
	light.SetBrightness = SetBrightness;
	light.SetColorRGB = SetColorRGB;
	light.SetColorHex = SetColorHex;
	light.SetWhite = SetWhite;

	light.Mode = Mode;

	// Milight Basic Functions
	function SetOn(){
		light.IsMilightOn = true;
	}

	function Off(){
		light.milight.zone(1).off();
		light.IsMilightOn = false;
		light.Brightness = 0;
	}

	function SetBrightness(brightness){
		light.SetOn();
		light.Brightness = brightness;
		light.milight.zone(1).brightness(brightness);
		light.Brightness = brightness;
	}

	function SetColorHex(hex){
		light.SetOn();
		light.milight.zone(1).rgb(hex);
	}

	function SetColorRGB(r, g, b){
		light.SetOn();
		light.milight.zone(1).rgb255(r, g, b);
	}

	function SetWhite(brightness){
		brightness = brightness || 100;
		light.Brightness = brightness;
		
		light.SetOn();
		// Enforce turning on (Like pressing Milight app for 3 seconds -_-, that's why)
		for(i = 0; i < 20; i++){
			light.milight.zone(1).white(brightness);
		}
	}

	function Mode(mode){
		switch(mode){
			case "romantic":
				light.SetColorRGB(255, 132, 188);
				setTimeout(function(){
					light.SetBrightness(25);
				}, 2000);
				break;
			case "blue":
				light.SetColorRGB(0, 119, 190);
				setTimeout(function(){
					light.SetBrightness(25);
				}, 2000);
				break;
			default:
				throw "Mode does not exist";
		}
	}

	function Init(){
		Off();
	}

	return light;
}

module.exports = Light;