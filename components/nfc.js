var SerialPort = require("serialport").SerialPort;
var pn532 = require("pn532");
var ndef = require("ndef");
var path = require("path");

module.exports = NFC;

function NFC(){
	var nfc = this;

	error = false;

	// Timeout object
	timeout = false;

	// SerialPort and RFID Objects
	serialPort = false;
	rfid = false;

	// Variables
	nfc.IsNFCOn = false;
	nfc.IsNFCWaiting = false;

	nfc.time;
	nfc.DataReadTag;
	nfc.DataReadContent;

	// NFC Functionalities
	nfc.InstantiateNFC = InstantiateNFC;
	nfc.DeleteNFC = DeleteNFC;
	nfc.StartRead = StartRead;
	nfc.StartWrite = StartWrite;
	nfc.StartNFCPoll = StartNFCPoll;

	nfc.ResetData = ResetData;

	function InstantiateNFC(){
		if(!serialPort && !rfid){
			serialPort = new SerialPort("/dev/ttyS0", { baudrate: 115200 });
			rfid = new pn532.PN532(serialPort);
			serialPort.on("error", function(){
				error = true;
				serialPort = false;
				rfid = false;
			});
		} else{
			throw "NFC is already instantiated";
		}
	}

	function DeleteNFC(successCallbackFn, errorCallbackFn){
		successCallbackFn = successCallbackFn || function(){};
		errorCallbackFn = errorCallbackFn || function(){};
		
		if(serialPort && rfid){
			rfid.frameEmitter.removeAllListeners();
			serialPort.close();
			serialPort = false;
			rfid = false;
			nfc.IsNFCOn = false;
			successCallbackFn();
		} else{
			errorCallbackFn();
		}
	}

	function ResetData(){
		nfc.DataReadTag = null;
		nfc.DataReadContent = null;
	}

	function StartRead(middlewareFn, successCallbackFn, errorCallbackFn, timeoutCallbackFn, duration){
		duration = duration || 5000;
		middlewareFn = middlewareFn || function(){
			return new Promise(function(request, response){});
		};
		successCallbackFn = successCallbackFn || function(){};
		errorCallbackFn = errorCallbackFn || function(){};
		timeoutCallbackFn = timeoutCallbackFn || function(){};
		
		try{
			InstantiateNFC();
			if(!error){
				rfid.on("ready", function() {
					nfc.IsNFCOn = true;
					if(duration > 0){
						var timeout = setTimeout(function(){
							nfc.IsNFCWaiting = false;
							timeoutCallbackFn();
							DeleteNFC();
						}, duration);	
					}
					nfc.IsNFCWaiting = true;
					rfid.scanTag().then(function(tag) {
	    				clearTimeout(timeout);
	    				nfc.DataReadTag = tag;

						rfid.readNdefData().then(function(data) {
							if(data != "" && data !== undefined){
								var records = ndef.decodeMessage(data.toJSON().data);
								nfc.DataReadContent = data.toString();
								middlewareFn(tag).then(function(val) { 
									successCallbackFn(tag, val);
								}).catch(function(err) {
									errorCallbackFn();
								})
					        } else{
					        	errorCallbackFn();
					        }
					        nfc.IsNFCWaiting = false;
					        DeleteNFC();
				    	});
				    });
				});
			}
			else{
				errorCallbackFn();
			}
		} catch(e){
			throw e.message;
		}
	}

	// Message requires to be this format:
	// message = [ndef.uriRecord(""),ndef.textRecord("")]
	function StartWrite(message, middlewareFn, successCallbackFn, errorCallbackFn, timeoutCallbackFn, duration){
		message = message || "";
		duration = duration || 5000;
		middlewareFn = middlewareFn || function(){
			return new Promise(function(request, response){});
		};
		successCallbackFn = successCallbackFn || function(){};
		errorCallbackFn = errorCallbackFn || function(){};
		timeoutCallbackFn = timeoutCallbackFn || function(){};
		
		try{
			InstantiateNFC();
			if(!error){
				rfid.on("ready", function() {
					nfc.IsNFCOn = true;
					if(duration > 0){
						var timeout = setTimeout(function(){
							nfc.IsNFCWaiting = false;
							timeoutCallbackFn();
							DeleteNFC();
						}, duration);	
					}
					nfc.IsNFCWaiting = true;
					rfid.scanTag().then(function(tag) {
						clearTimeout(timeout);
						nfc.DataReadTag = tag;
						var ndefMessage = [ndef.textRecord(message)];
				        var data = ndef.encodeMessage(ndefMessage);

				        rfid.writeNdefData(data).then(function(response) {
				        	middlewareFn(tag).then(function(val) { 
								successCallbackFn();
							}).catch(function(err) {
								errorCallbackFn();
							});
							successCallbackFn();
							nfc.IsNFCWaiting = false;
						    DeleteNFC();
				        });
					 });
				});
			}
			else{
				errorCallbackFn();
			}
		} catch(e){
			throw e.message;
		}
	}

	function StartNFCPoll(middlewareFn, successCallbackFn, errorCallbackFn, timeoutCallbackFn, exitCallbackFn, duration){
		duration = duration || 0;
		middlewareFn = middlewareFn || function(){};
		successCallbackFn = successCallbackFn || function(){};
		errorCallbackFn = errorCallbackFn || function(){};
		timeoutCallbackFn = timeoutCallbackFn || function(){};
		exitCallbackFn = exitCallbackFn || function(){};
		
		try{
			InstantiateNFC();
			if(!error){
				rfid.on("ready", function() {
					nfc.IsNFCOn = true;
					if(duration > 0){
						var timeout = setTimeout(function(){
							nfc.IsNFCWaiting = false;
							timeoutCallbackFn();
							rfid.frameEmitter.removeAllListeners();
							DeleteNFC();
						}, duration);	
					}
					nfc.IsNFCWaiting = true;
					exitCallbackFn();
					rfid.on("tag", function(tag) {
						var now = new Date();
						nfc.time = now.getTime();
						
						nfc.DataReadTag = tag;
						middlewareFn(tag).then(function(val) { 
							successCallbackFn();
						}).catch(function(err) {
							errorCallbackFn();
						})
					});
				});
			}
			else{
				errorCallbackFn();
			}
		} catch(e){
			throw e.message;	
		}
	}

	return nfc;
}

