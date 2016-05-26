var ws281x = require('../node_modules/rpi-ws281x-native/lib/ws281x-native');

var MAX = 150;
var pixelLeds;
var validLeds = {};

function LightStrip(){
	var lightstrip = this;

	// Variables
	lightstrip.IsLightStripInit = false;
	lightstrip.IsLightStripOn = false;

	lightstrip.Brightness = 0;

	lightstrip.CurrentInterval;
	lightstrip.CurrentTimeout;

	lightstrip.SetLedNumber = SetLedNumber;

	lightstrip.SetColorHex = SetColorHex;
	lightstrip.BlinkEvenOdd = BlinkEvenOdd;
	lightstrip.SetBrightness = SetBrightness;
	lightstrip.Rainbow = Rainbow;
	lightstrip.Iterate = Iterate;
	lightstrip.Beam = Beam;
	lightstrip.Stop = Stop;

 	function Reset(){
 		Init();
		Stop();
 	}

	// LightStrip Helper Functions //
	function rgb2int(r, g, b) {
		return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
	}

	function colorwheel(pos) {
		pos = 255 - pos;
		if (pos < 85) { return rgb2int(255 - pos * 3, 0, pos * 3); }
		else if (pos < 170) { pos -= 85; return rgb2int(0, pos * 3, 255 - pos * 3); }
		else { pos -= 170; return rgb2int(pos * 3, 255 - pos * 3, 0); }
	}

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

	function IsValidLed(ledNo){
		return validLeds[ledNo] === true;
	}

	// LightStrip Functionalities
	function Init(numOfLeds){
		if(!LightStrip.IsLightStripInit){
			leds = numOfLeds || MAX;
			ws281x.init(leds);
			pixelLeds = new Uint32Array(leds);
			clearInterval(lightstrip.CurrentInterval);

			// Leds that will be turned on
			// In this case, all. 
			for(var i = 0; i < leds; i++){
				validLeds[i] = true;
			}
			lightstrip.IsLightStripInit = true;
		} else{
		 	throw "LightStrip has already been initialized";
		}
	}

	// validLeds will be expected as form {i: true, i+1: true, ...}
	function SetValidLeds(inputValidLeds){
		validLeds = inputValidLeds;
	}

	function SetLedNumber(length){
		pixelLeds = new Uint32Array(length);
	}

	function SetColorHex(hex){
		var rgb = hexToRgb(hex);
		SetColorRGB(rgb.r, rgb.g, rgb.b);
	}

	function SetColorRGB(r, g, b){
		try{
			if(!lightstrip.IsLightStripInit){
				Init();
			}

			clearInterval(lightstrip.CurrentInterval);

			lightstrip.IsLightStripOn = true;
			lightstrip.Brightness = 100;
			for (var i = 0; i < pixelLeds.length; i++) {
				pixelLeds[i] = (IsValidLed(i)) ? rgb2int(r, g, b) : 0;
			}
			ws281x.render(pixelLeds);
		} catch(e){
			throw e;
		}
	}

	function Rainbow(){
		try{
			if(!lightstrip.IsLightStripInit){
				Init();
			}

			clearInterval(lightstrip.CurrentInterval);
			lightstrip.IsLightStripOn = true;
			lightstrip.Brightness = 100;

			var offset = 0;
			lightstrip.CurrentInterval = setInterval(function () {
				for (var i = 0; i < pixelLeds.length; i++) {
					pixelLeds[i] = (IsValidLed(i)) ? colorwheel((offset + i) % 256) : 0;
				}

				offset = (offset + 1) % 256;
				ws281x.render(pixelLeds);
			}, 1000 / 30);
		} catch(e){
			throw e;
		}
	}

	function BlinkEvenOdd(hex, delay){
		try{
			delay = delay || 1000;
			hex = hex || "#ffffff";
			var color = hexToRgb(hex);

			if(!lightstrip.IsLightStripInit){
				Init();
			}

			clearInterval(lightstrip.CurrentInterval);
			lightstrip.IsLightStripOn = true;
			lightstrip.Brightness = 100;

			var even = true;
			lightstrip.CurrentInterval = setInterval(function(){
				for(var i = 0; i < pixelLeds.length; i++){
					if(even){
						pixelLeds[i] = (i % 2 == 0 && IsValidLed(i)) ? rgb2int(color.r, color.g, color.b) : 0;
					} else{
						pixelLeds[i] = (i % 2 == 1 && IsValidLed(i)) ? rgb2int(color.r, color.g, color.b) : 0;
					}
				}
				even = !even;
				ws281x.render(pixelLeds);
			}, delay);
		} catch(e){
			throw e;
		}
	}

	function SetBrightness(brightness){
		try{
			if(!lightstrip.IsLightStripInit){
				Init();
			}
			lightstrip.Brightness = brightness;
			lightstrip.IsLightStripOn = true;
			brightness = (brightness/100)*255;
			ws281x.setBrightness(brightness);
		} catch(e){
			throw e;
		}
	}

	function Beam(hex){
		try{
			clearInterval(lightstrip.CurrentInterval);
			SetColorHex(hex);

			var t0 = Date.now();
			lightstrip.CurrentInterval = setInterval(function () {
			    var dt = Date.now() - t0;

			    ws281x.setBrightness(
			        Math.floor(Math.sin(dt/1000) * 128 + 128));
			}, 1000 / 30);
		} catch(e){
			throw e;
		}
	}

	function Iterate(delay, hex, leftToRight){
		try{
			if(!lightstrip.IsLightStripInit){
				Init();
			}
			clearInterval(lightstrip.CurrentInterval);

			lightstrip.IsLightStripOn = true;
			lightstrip.Brightness = 100;
			
			delay = delay || 500;
			hex = hex || "#ffffff";
			color = hexToRgb(hex);
			colorProcessed = rgb2int(color.r, color.g, color.b);
			var chosenLed = (leftToRight) ? 0 : pixelLeds.length;
			lightstrip.CurrentInterval = setInterval(function () {
				var i = pixelLeds.length;
				while(i--) {
					pixelLeds[i] = 0;
				}
				pixelLeds[chosenLed] = (IsValidLed(chosenLed)) ? colorProcessed : 0;
				if(leftToRight){
					if(chosenLed + 1 == pixelLeds.length){
						chosenLed = 0;
					} else{
						chosenLed++;
					}
				} else{
					if(chosenLed - 1 == -1){
						chosenLed = pixelLeds.length;
					} else{
						chosenLed--;
					}
				}
				ws281x.render(pixelLeds);
			}, delay);
		} catch(e){
			throw e;
		}
	}

	function Stop(){
		try{
			clearInterval(lightstrip.CurrentInterval);
			ws281x.reset();
			lightstrip.Brightness = 0;
			lightstrip.IsLightStripInit = false;
			lightstrip.IsLightStripOn = false;
		} catch(e){
			throw e;
		}
	}

	return lightstrip;
}

module.exports = LightStrip;