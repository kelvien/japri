var Milight = require("node-milight-promise").MilightController;
var commands = require("node-milight-promise").commands2;

function Light(ip){
	var light = this;

	light.milight = new Milight({
        ip: ip,
        commandRepeat: 5,
        delayBetweenCommands: 10
    });

    var zone = 1;

	// Variables
	light.IsMilightOn = false;
	light.Brightness = 0;

	light.SetOn = SetOn;
	light.Off = Off;
	light.SetBrightness = SetBrightness;
	light.SetColorRGB = SetColorRGB;
	light.SetColorHex = SetColorHex;
	light.SetWhite = SetWhite;

	// Helper
	// Reference
	// http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	function hexToRgb(hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}

	// Milight Basic Functions
	function SetOn(){
		light.IsMilightOn = true;
	}

	function Off(){
		light.milight.sendCommands(commands.rgbw.off(zone));
		light.IsMilightOn = false;
		light.Brightness = 0;
	}

	function SetBrightness(brightness){
		light.SetOn();
		light.milight.sendCommands(commands.rgbw.brightness(brightness));
		light.Brightness = brightness;
	}

	function SetColorHex(hex){
		var rgb = hexToRgb(hex);
		SetColorRGB(rgb.r, rgb.g, rgb.b);
	}

	function SetColorRGB(r, g, b){
		light.SetOn();
		light.milight.sendCommands(commands.rgbw.on(zone), commands.rgbw.rgb255(r, g, b));
	}

	function SetWhite(brightness){
		brightness = brightness || 100;
		light.Brightness = brightness;
		
		light.SetOn();
		light.milight.sendCommands(commands.rgbw.on(zone), commands.rgbw.whiteMode(zone), commands.rgbw.brightness(brightness));
	}

	function Init(){
		Off();
	}

	return light;
}

module.exports = Light;