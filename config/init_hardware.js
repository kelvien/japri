function Init(config, component, helper){
	if(config.initLiveStream){
		// Initiating LiveStream
		console.log("Initiating LiveStream");
		try{
			component.LiveStream.StartLiveStream();
			console.log("LiveStream initiated");
		} catch(e){
			console.log("Unable to initiate LiveStream");
		}
	}
	if(config.initNFCReader){
		// Initiating NFC
		console.log("Initiating NFC Reader");
		// Start NFC Authenticate poll to open door
		try{
			component.NFCReader.StartNFCPoll(
				helper.AuthenticateTagPromise, 
				component.ServoDriver.OpenDoor
			);
			console.log("NFC Reader initiated");
		} catch(e){
			console.log("Unable to initiate NFC Reader");
		}
	}
	if(config.initPIRSensor){
		// Initiating PIR
		console.log("Initiating PIR");
		try{
			component.PIRSensor.StartSensor();
			console.log("PIR Sensor initiated");
		} catch(e){
			console.log(e.message);
			console.log("Unable to initiate PIR");
		}
	}
	
	if(config.initLightSensor){
		// Initiating Photo Resistor
		console.log("Initiating LightSensor");
		try{
			component.LightSensor.StartSensor();
			console.log("LightSensor initiated");
		} catch(e){
			console.log(e.message);
			console.log("Unable to initiate LightSensor");
		}
	}

	if(config.initMilight){
		// Initiating Milight
		component.MilightCtrl.Init();
		console.log("Milight initiated");
	}

	if(config.initLightStrip){
		// Initiating LightStrip
		component.LightStripCtrl.Reset();
		console.log("LightStrip initiated");
	}
}

module.exports = Init;
