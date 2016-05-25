// CURRENT MODULES
var camera = require("../components/camera.js");
var servo = require("../components/servo.js");
var nfc = require("../components/nfc.js");
var pir = require("../components/pir.js");
var photoResistor = require("../components/photo_resistor.js");
var milight = require("../components/milight.js");
var lightstrip = require("../components/lightstrip.js");

module.exports = Component;

function Component(config, helper){
	var component = this;

	// To create a new instance in case it is needed
	component.Camera = function(){
		return new camera();
	};
	component.Nfc = function(){
		return new nfc();
	};
	component.Servo = function(){
		return new servo();
	}
	component.Pir = function(){
		return new pir();
	};
	component.PhotoResistor = function(){
		return new photoResistor();	
	};
	component.Milight = function(){
		return new milight();
	};
	component.Lightstrip = function(){
		return new lightstrip();
	};

	// This is meant to only be created once and 
	// will be called later in the application
	var LiveStream = new camera(config, helper);
	component.LiveStream = LiveStream;

	var NFCReader = new nfc(config);
	component.NFCReader = NFCReader;

	var ServoDriver = new servo();
	component.ServoDriver = ServoDriver;

	var PIRSensor = new pir(config);
	component.PIRSensor = PIRSensor;

	var LightSensor = new photoResistor(config);
	component.LightSensor = LightSensor;

	var MilightCtrl = new milight(config.milightIPAddress);
	component.MilightCtrl = MilightCtrl;

	var LightStripCtrl = new lightstrip();
	component.LightStripCtrl = LightStripCtrl;

	return component;
}
