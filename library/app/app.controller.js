// CONTROLLER
(function(){

	var app = angular.module('Japri');

	app.controller("HeaderCtrl", ["$scope", "MenuService", HeaderCtrl]);
	function HeaderCtrl($scope, MenuService){
		var vm = this;
		
		vm.Menu = MenuService.GetMenu(SuccessLogoutCallback);

		vm.ReloadMenu = ReloadMenu;

		function ReloadMenu(){
			vm.Menu = MenuService.GetMenu(SuccessLogoutCallback);
		}

		function SuccessLogoutCallback(){
			Materialize.toast("You have been logged out", 5000);
		}
	}

	app.controller("IndexCtrl", ["$scope", "$controller", "AnnyangService", IndexCtrl]);
	function IndexCtrl($scope, $controller, AnnyangService){
		var vm = this;

		AnnyangService.Init();

		$controller("LightCtrl", {$scope: $scope});
	}

	app.controller("TimeCtrl", ["$scope", "SessionService", "TimeService", TimeCtrl]);
	function TimeCtrl($scope, SessionService, TimeService){
		var name = SessionService.GetName() || "good looking";
		var vm = this;

		var info = TimeService.GetAllInfo();

		vm.time = info.time;
		vm.date = info.date;
		vm.fullTime = info.fullTime;
		vm.friendlyText = info.friendlyText;

		GetInfo();

		function GetInfo(){
			var info = TimeService.GetAllInfo(name);
			vm.time = info.time;
			vm.date = info.date;
			vm.fullTime = info.fullTime;
			vm.friendlyText = info.friendlyText;
		}

		// Start Interval
		vm.timeInterval = setInterval(function(){
			GetInfo();
			$scope.$apply();
		}, 1000);

		$scope.$on("$destroy", function(){
			clearInterval(vm.timeInterval);
		});
	}

	app.controller("WeatherCtrl", ["$scope", "WeatherResource", "TimeService", WeatherCtrl]);
	function WeatherCtrl($scope, WeatherResource, TimeService){
		var vm = this;

		vm.iconColor = "white";

		vm.loading = true;
		vm.data = false;
		vm.interval = false;
		vm.refreshTime = 1000 * 60 * 30; // 30 Minutes
		
		// Initial
		GetWeather();

		vm.interval = setInterval(GetWeather, vm.refreshTime);

		function GetWeather(){
			vm.loading = true;
		
			return WeatherResource.getPrediction({position: "42.0258191,-93.6965875"}).$promise.then(function(success){
				vm.loading = false;
				vm.data = success.data;
			 
			var time = TimeService.GetAllInfo();
			vm.lastUpdated = time.fullTime;
			}, function(error){
				vm.Error = "Unable to retrieve weather information";
			});
		}

		$scope.$on("$destroy", function dismiss() {
			clearInterval(vm.interval);
		});
	}	

	app.controller("BibleCtrl", ["$scope", "BibleResource", BibleCtrl]);
	function BibleCtrl($scope, BibleResource){
		var vm = this;

		vm.loading = true;
		vm.data = false;
		vm.interval = false;
		vm.refreshTime = 1000 * 60 * 60 * 4 // 4 Hour
		
		// Initial
		GetBibleVOTD();

		vm.interval = setInterval(GetBibleVOTD, vm.refreshTime);
		
		function GetBibleVOTD(){
			vm.loading = true;
			return BibleResource.getVotd().$promise.then(function(success){
				vm.loading = false;
				vm.data = success.data;
			}, function(error){
				vm.data = false;
			});
		}

		$scope.$on("$destroy", function dismiss() {
			clearInterval(vm.interval);
		});
	}	

	app.controller("NewsCtrl", ["$scope", "NewsResource", NewsCtrl]);
	function NewsCtrl($scope, NewsResource){
		var vm = this;

		vm.loading = true;
		vm.data = false;
		vm.interval = false;
		vm.refreshTime = 1000 * 60 * 60; // 1 Hour

		//Initial
		GetNews();

		vm.interval = setInterval(GetNews, vm.refreshTime);

		function GetNews(){
			vm.loading = true;
			return NewsResource.getTopStories({section: "national"}).$promise.then(function(success){
				vm.loading = false;
				vm.data = success.data;
			}, function(error){
				vm.error = "Unable to retrieve news";
			});
		}

		$scope.$on("$destroy", function dismiss() {
			clearInterval(vm.interval);
		});
	}	

	app.controller("NextbusCtrl", ["$scope", "NextbusResource", "TimeService", NextbusCtrl]);
	function NextbusCtrl($scope, NextbusResource, TimeService){
		var default_nextbus_agent = "cyride";

		var colorMap = 
		{
		1: "red",
		2: "green",
		3: "blue",
		4: "grey darken-1",
		5: "yellow darken-2",
		6: "brown",
		7: "purple",
		8: "cyan",
		10: "pink",
		23: "orange"
		}; // Matching it with what Materialize has

		var vm = this;

		vm.loading = true;
		vm.interval = false;

		vm.routes = false;
		vm.stops = false;
		vm.predictions = false;

		vm.route = "6S"; // Default value route
		vm.stop = "1092"; // Default value stop: Howe Hall
		vm.busColor = colorMap[StripNonDigit(vm.route)];

		vm.refreshTime = 1000 * 30; // 30 Seconds

		vm.isArray = angular.isArray;

		// Initial
		if(vm.route && vm.stop){
			Init();
		}

		function Init(){
			GetNextbusRoute();
			GetNextbusRouteConfig();
			GetPredictions();
		}

		// Functions
		vm.ChangeNextbusRoute = ChangeNextbusRoute;
		vm.ChangeNextbusStop = ChangeNextbusStop;

		function StripNonDigit(str){
			return str.replace(/\D/g,'');
		}

		function GetNextbusRoute(){
			vm.loading = true;
			NextbusResource.getRoute({agentId: default_nextbus_agent}).$promise.then(function(success){
				vm.routes = success.data.body.route;
				vm.loading = false;
			}, function(error){
				vm.error = "Unable to retrieve Nextbus routes";
			});
		}

		function GetNextbusRouteConfig(){
			vm.loading = true;
			NextbusResource.getRouteConfig({agentId: default_nextbus_agent, routeTag: vm.route}).$promise.then(function(success){
				vm.stops = success.data.body.route.stop;
				vm.loading = false;
			}, function(error){
				vm.error = "Unable to retrieve Nextbus stops";
			});
		}

		function ChangeNextbusRoute(){
			vm.stops = false;
			vm.stop = "";
			vm.predictions = false;
			if(vm.route != ""){
				vm.busColor = colorMap[StripNonDigit(vm.route)];
				GetNextbusRouteConfig();
			}
		}

		function ChangeNextbusStop(){
			vm.predictions = false;
			if(vm.stop != ""){
				GetPredictions();
			}
		}

		function GetPredictions(){
			if(vm.route && vm.stop){
				vm.loading = true;
				NextbusResource.getPrediction({agentId: default_nextbus_agent, routeTag: vm.route, stopTag: vm.stop}).$promise.then(function(success){
					var time = TimeService.GetAllInfo();

					vm.lastUpdated = time.fullTime;
					vm.predictions = success.data.body.predictions;
					vm.loading = false;
				}, function(error){
					vm.error = "Unable to retrieve Nextbus predictions";
				});
			}
		}

		vm.interval = setInterval(GetPredictions, vm.refreshTime);

		$scope.$on("$destroy", function dismiss() {
			clearInterval(vm.interval);
		});
	}	

	app.controller("LoginCtrl", ["$scope", "AuthService", "AuthResource", LoginCtrl]);
	function LoginCtrl($scope, AuthService, AuthResource){
		var vm = this;

		// Login form's Model
		vm.model = {};
		vm.Login = Login;

		function Login(dashboard){
			var model = (dashboard) ? false : vm.model;
			return AuthService.Login(model, function(success){
				Materialize.toast("Welcome back!", 5000);
				delete vm.error;
			}, function(error){
				if(error.data.msg){
					Materialize.toast(error.data.msg, 5000)
				} else{
					vm.error = "Unable to log in now. Please try again later.";
				}
			});
		}
	}

	app.controller("UserCtrl", ["UserResource", "NFCResource", UserCtrl]);
	function UserCtrl(UserResource, NFCResource){
		var vm = this;

		vm.usersTab = false;
		vm.signupTab = true;

		vm.model = {};
		vm.respond = {};

		vm.Signup = Signup;
		vm.EditUser = EditUser;
		vm.DeleteUser = DeleteUser;

		LoadUsers();
		LoadTags();

		function EditUser(user){
			return UserResource.edit({email: user.email,model: user.EditFormModel}).$promise.then(function(success){
				user.name = success.user.name;
				user.permission = success.user.permission;
				user.tag = success.user.tag;
				user.isEditing = false;
				Materialize.toast("Successfully edited user", 5000);
			}, function(error){
				Materialize.toast(error.data.msg, 5000);
			});
		}

		function DeleteUser(user){
			return UserResource.delete({email: user.email}).$promise.then(function(success){
				user.isDeleting = false;
				delete user;
				Materialize.toast("Successfully deleted user", 5000);
			}, function(error){
				Materialize.toast(error.data.msg, 5000);
			});
		}

		function LoadUsers(){
			UserResource.query().$promise.then(function(success){
				vm.users = success;
				angular.forEach(vm.users, function(value, key){
					value.isEditing = false;
					value.isDeleting = false;
					if(value.tag){
						NFCResource.get({tagId: value.tag}).$promise.then(function(success){
							value.tag = success.data;
						}, function(error){
							Materialize.toast("Unable to retrieve Tag UID", 5000);
						});
					}
				});
			}, function(error){
				Materialize.toast("Unable to retrieve users", 5000);
			});
		}

		function LoadTags(){
			NFCResource.query().$promise.then(function(success){
				vm.Tags = success;
			}, function(error){

			});
		}

		function Signup(){
			return UserResource.save({}, vm.model).$promise.then(function(res){
				vm.respond.success = true;
				vm.respond.message = "User has successfully been created";
			}, function (err){
				if(err.data.msg){
					vm.respond.success = false;
					vm.respond.message = err.data.msg;
				}else{
					vm.respond.success = false;
					vm.respond.message = "User cannot be created. Please try again later";
				}
			});
		}	
	}

	
	app.controller("CamCtrl", ["$rootScope", "$scope", "$location", "SessionService", "SocketService", "CameraResource", CamCtrl]);
	function CamCtrl($rootScope, $scope, $location, SessionService, SocketService, CameraResource){
		var vm = this;

		vm.IsDeveloper = SessionService.IsDeveloper();
		vm.ToggleStreaming = ToggleStreaming;
		vm.DevToggleStreaming = DevToggleStreaming;

		vm.loadingLiveStream = true;
		vm.isStreaming = true;
		vm.isServerStreaming = false;

		function ToggleStreaming(){
			if(vm.isStreaming){
				SocketService.off("liveReply");
			} else{
				SocketService.on("liveReply", function(data){
					vm.liveStreamUri = "data:image/jpg;base64," + data;
				});
			}
			vm.isStreaming = !vm.isStreaming;
		}

		function DevToggleStreaming(){
			if(vm.isServerStreaming){
				return CameraResource.save({action: "stop"}).$promise.then(function(success){
					Materialize.toast("LiveStream has been stopped", 5000);
				}, function(err){
					Materialize.toast("Unable to turn off LiveStream", 5000);
				});
			} else{
				return CameraResource.save({action: "start"}).$promise.then(function(success){
					vm.imgLoaded = false;
					Materialize.toast("LiveStream has been started", 5000);
				}, function(err){
					Materialize.toast("Unable to turn on LiveStream", 5000);
				});
			}
		}

		SocketService.emit("getCamStatus", {query:SessionService.GetToken()});

		SocketService.on("liveReply", function(data){
			vm.liveStreamUri = "data:image/jpg;base64," + data;
		});

		SocketService.on("liveStreamStatus", function(data){
			vm.loadingLiveStream = false;
			vm.isServerStreaming = data;
		});

		// Always have this in Controller that uses SocketService, to disconnect user from Server's Socket.IO on leaving the page that has this controller
		$scope.$on("$destroy", function dismiss() {
			SocketService.off("liveReply");
			SocketService.off("liveStreamStatus");
		});
	}

	app.controller("NFCCtrl", ["$scope", "SessionService", "SocketService", "NFCResource", NFCCtrl]);
	function NFCCtrl($scope, SessionService, SocketService, NFCResource){
		var vm = this;

		vm.loadingNfc = true;

		vm.detectedTags = [];

		vm.isNFCOn = false;
		vm.isReading = false;
		vm.isWriting = false;
		vm.isPolling = false;

		vm.pollType = false;

		vm.OpenWriteTab = OpenWriteTab;
		vm.OpenReadTab = OpenReadTab;

		vm.RegisterTag = RegisterTag;
		vm.StopNFC = StopNFC;
		vm.Poll = Poll;
		vm.ReadTag = ReadTag;
		vm.WriteTag = WriteTag;

		SocketService.emit("getNFCStatus", {"query": SessionService.GetToken()}, function(){

		});	

		SocketService.on("nfcStatus", function(data){
			vm.loadingNfc = false;
			vm.isNFCOn = data;	
		});

		SocketService.on("nfcPollData", function(data){
			if(data){
				NFCResource.tag({tagUid: data.uid}).$promise.then(function(success){
					vm.detectedTags.unshift({date: new Date(), tag: data.uid, registered: success.found});
				}, function(error){
					vm.detectedTags.unshift({date: new Date(), tag: data.uid, error: true});
				});
			}
		});

		function RegisterTag(uid){
			return NFCResource.register({tagUid: uid}).$promise.then(function(success){
				vm.registerTagInput = "";
				Materialize.toast("NFC Tag with UID: "+uid+" has successfully been registered", 5000);
			}, function(error){
				Materialize.toast("NFC Tag with UID: "+uid+" cannot be registered", 5000);
			});
		}

		function OpenWriteTab(){
			vm.isWriting = true;
			vm.isPolling = false;
			vm.isReading = false;
		}

		function OpenReadTab(){
			vm.isReading = true;
			vm.isWriting = false;
			vm.isPolling = false;
		}

		function StopNFC(){
			return NFCResource.save({action: "stop"}).$promise.then(function(success){
				Materialize.toast("NFC Reader has been stopped", 5000);
				vm.isReading = false;
				vm.isWriting = false;
				vm.isPolling = true;

				vm.pollType = false;
			}, function(error){
				Materialize.toast("Unable to turn off NFC Reader", 5000);
				vm.isReading = false;
				vm.isWriting = false;
				vm.isPolling = true;
			});
		}

		function Poll(type){
			return NFCResource.save({action: "poll", type: type}).$promise.then(function(success){
				vm.pollType = (type == "authorizeDoorOpener") ? "Authenticating door" : "Polling";

				Materialize.toast("NFC Reader starts polling", 5000);
			}, function(error){
				Materialize.toast("Unable to start NFC Reader", 5000);
			});
		}

		function ReadTag(){
			vm.IsWaiting = true;
			return NFCResource.save({action: "read"}).$promise.then(function(success){
				Materialize.toast("NFC Reader is waiting for an NFC Tag", 5000);
				vm.IsWaiting = false;
			}, function(error){
				if(error.data.timeout){
					Materialize.toast("Timeout: NFC Reader does not detect an NFC Tag", 5000);
				} else{
					Materialize.toast("There is an error in reading your NFC Tag", 5000);
				}
				vm.IsWaiting = false;
			});
		}

		function WriteTag(message){
			vm.IsWaiting = true;
			return NFCResource.save({action: "write", data: message}).$promise.then(function(success){
				Materialize.toast("NFC Reader is waiting for an NFC Tag", 5000);
				vm.IsWaiting = false;
			}, function(error){
				if(error.data.timeout){
					Materialize.toast("Timeout: NFC Reader does not detect an NFC Tag", 5000);
				} else{
					Materialize.toast("There is an error in writing your NFC Tag", 5000);
				}
				vm.IsWaiting = false;
			});
		}

		// Always have this in Controller that uses SocketService, to disconnect user from Server's Socket.IO on leaving the page that has this controller
		$scope.$on("$destroy", function dismiss() {
			SocketService.off("nfcStatus");
			SocketService.off("nfcPollData");
		});
	}

	app.controller("DoorCtrl", ["$rootScope", "$scope", "SessionService", "SocketService", "ServoResource", "AnnyangService", DoorCtrl]);
	function DoorCtrl($rootScope, $scope, SessionService, SocketService, ServoResource, AnnyangService){
		var vm = this;

		vm.loadingServoStatus = true;
		vm.isBusy = true;

		vm.OpenDoor = OpenDoor;

		function OpenDoor(){
			return ServoResource.save({action: "open-door"}).$promise.then(function(success){
				Materialize.toast("Door has been opened", 5000);
			}, function (error){
				Materialize.toast("Door cannot be opened", 5000);
			});
		}

		SocketService.emit("getDoorStatus", {"query": SessionService.GetToken()}, function(){

		});	

		SocketService.on("doorStatus", function(data){
			vm.loadingServoStatus = false;
			vm.isBusy = data;	
		});

		AnnyangService.AddCommand("open the door", function(){
			OpenDoor();
		});

		// Always have this in Controller that uses SocketService, to disconnect user from Server's Socket.IO on leaving the page that has this controller
		$scope.$on("$destroy", function dismiss() {
			SocketService.off("doorStatus");
		});
	}

	app.controller("PirSensorCtrl", ["$scope", "SessionService", "SocketService", "SensorResource", PirSensorCtrl]);
	function PirSensorCtrl($scope, SessionService, SocketService, SensorResource){
		var maxDataLength = 1000;

		var vm = this;

		vm.loadingPIR = true;
		vm.isPIROn = false;
		vm.PIRReading = false;

		vm.TogglePIR = TogglePIR;

		SocketService.emit("getPIRStatus", {query:SessionService.GetToken()});

		SocketService.on("sendPirStatus", function(data){
			vm.loadingPIR = false;
			vm.isPIROn = data;

			if(!vm.isPIROn){
				vm.PIRReading = false;
			}
		});

		SocketService.on("sendPirReading", function(data){
			vm.PIRReading = data
		});

		function TogglePIR(){
			if(vm.isPIROn){
				return SensorResource.togglePirSensor({action:"off"}).$promise.then(function(success){
					Materialize.toast("PIR Sensor has been turned off", 5000);
				}, function(error){
					Materialize.toast("Unable to turn off PIR Sensor", 5000);
				})
			} else{
				return SensorResource.togglePirSensor({action:"on"}).$promise.then(function(success){
					Materialize.toast("PIR Sensor has been turned on", 5000);
				}, function(error){
					Materialize.toast("Unable to turn on PIR Sensor", 5000);
				})
			}
		}
	}

	app.controller("LightSensorCtrl", ["$scope", "SessionService", "SocketService", "SensorResource", LightSensorCtrl]);
	function LightSensorCtrl($scope, SessionService, SocketService, SensorResource){
		var vm = this;
		
		vm.loadingLightSensor = true;

		vm.isLightSensorOn = false;
		vm.LightSensorReading = false;
		vm.LightSensorReadingFormatted = "";

		vm.ToggleLightSensor = ToggleLightSensor;

		SocketService.emit("getLightSensorStatus", {query:SessionService.GetToken()});

		SocketService.on("sendLightSensorStatus", function(data){
			vm.loadingLightSensor = false;
			vm.isLightSensorOn = data;
			// Reset if it's off
			if(!vm.isLightSensorOn){
				vm.LightSensorReading = 0;
			}
		});

		SocketService.on("sendLightSensorReading", function(data){
			vm.LightSensorReading = data.raw;
			vm.LightSensorReadingFormatted = data.friendlyData;
		});
		
		function ToggleLightSensor(){
			if(vm.isLightSensorOn){
				return SensorResource.toggleLightSensor({action:"off"}).$promise.then(function(success){
					Materialize.toast("LightSensor has been turned off", 5000);
				}, function(error){
					Materialize.toast("Unable to turn off LightSensor", 5000);
				});
			} else{
				return SensorResource.toggleLightSensor({action:"on"}).$promise.then(function(success){
					Materialize.toast("LightSensor has been turned on", 5000);
				}, function(error){
					Materialize.toast("Unable to turn on LightSensor", 5000);
				});
			}
		}

		// Always have this in Controller that uses SocketService, to disconnect user from Server's Socket.IO on leaving the page that has this controller
		$scope.$on("$destroy", function dismiss() {
			SocketService.off("sendLightSensorStatus");
			SocketService.off("sendLightSensorReading");
		});
	}

	app.controller("SensorCtrl", ["$scope", "$controller", SensorCtrl]);
	function SensorCtrl($scope, $controller){
		var vm = this;

		vm.p = $controller("PirSensorCtrl", {$scope: $scope});
		vm.l = $controller("LightSensorCtrl", {$scope: $scope});
	}

	app.controller("MilightCtrl", ["$scope", "SessionService", "SocketService", "LightResource", "AnnyangService", MilightCtrl]);
	function MilightCtrl($scope, SessionService, SocketService, LightResource, AnnyangService){
		var vm = this;

		vm.loadingMilightStatus = true;
		vm.isLightOn = false;

		vm.wheelColor;

		vm.ChangeMilightColor = ChangeMilightColor;
		vm.ChangeMilightWhite = ChangeMilightWhite;
		vm.ChangeBrightness = ChangeBrightness;
		vm.TurnMilightOff = TurnMilightOff;

		function ChangeMilightColor(hex){
			var color = hex || vm.wheelColor;
			// Since this is a color wheel, multiple api requests will spam notifications
			// therefore I'm just assuming it will be successful.
			LightResource.changeColor({type: "milight", color: color});
		}

		function ChangeMilightWhite(){
			return LightResource.toggle({type: "milight", action: "on"}).$promise.then(function(success){
				Materialize.toast("Milight has been turned on", 5000);
			}, function(error){
				Materialize.toast("Unable to turn on Milight", 5000);
			});
		}

		function TurnMilightOff(){
			return LightResource.toggle({type: "milight", action: "off"}).$promise.then(function(success){
				Materialize.toast("Milight has been turned off", 5000);
			}, function(error){
				Materialize.toast("Unable to turn off Milight", 5000);
			});
		}

		function ChangeBrightness(){
			// Since this is a color wheel, multiple api requests will spam notifications
			// therefore I'm just assuming it will be successful.
			LightResource.changeBrightness({type: "milight", brightness: vm.milightBrightness});
		}

		SocketService.emit("getMilightStatus", {"query": SessionService.GetToken()}, function(){

		});	
	

		SocketService.emit("getLightStripStatus", {"query": SessionService.GetToken()}, function(){

		});	

		SocketService.on("milightStatus", function(data){
			vm.loadingMilightStatus = false;
			vm.isLightOn = data;
		});

		SocketService.on("milightBrightness", function(data){
			vm.milightBrightness = data;
		});

		// Always have this in Controller that uses SocketService, to disconnect user from Server's Socket.IO on leaving the page that has this controller
		$scope.$on("$destroy", function dismiss() {
			SocketService.off("milightStatus");
			SocketService.off("milightBrightness");
		});
	}

	app.controller("LightStripCtrl", ["$scope", "SessionService", "SocketService", "LightResource", "AnnyangService", LightStripCtrl]);
	function LightStripCtrl($scope, SessionService, SocketService, LightResource, AnnyangService){
		var vm = this;
		
		vm.loadingLightStripStatus = true;
		vm.isLightStripOn = false;

		vm.wheelColor;

		vm.ToggleLightStrip = ToggleLightStrip;
		vm.Rainbow = Rainbow;
		vm.Iterate = Iterate;
		vm.Beam = Beam;
		vm.SetLightStripColor = SetLightStripColor;
		vm.Blink = Blink;
		vm.SetLightStripBrightness = SetLightStripBrightness;
		vm.StopLightStrip = StopLightStrip;

		// LightStrips
		function ToggleLightStrip(){
			if(vm.isLightStripOn){
				StopLightStrip();
			} else{
				SetLightStripColor("#ffffff");
			}
		}

		function Rainbow(){
			return LightResource.lightStripAction({action: "rainbow"}).$promise.then(function(success){
				Materialize.toast("LightStrip Rainbow mode!", 5000);
			}, function(error){
				Materialize.toast("Unable to turn rainbow", 5000);
			});
		}

		function Iterate(){
			var delay = vm.lightStripDelay || 500;
			var direction = vm.lightStripDirection || true;
			return LightResource.lightStripAction({action: "iterate", delay: delay, color: vm.lightStripWheelColor, direction: direction}).$promise.then(function(success){
				Materialize.toast("LightStrip Iterate mode!", 5000);
			}, function(error){
				Materialize.toast("Unable to iterate LightStrip", 5000);
			});
		}

		function SetLightStripColor(hex){
			var color = hex || vm.lightStripWheelColor;
			LightResource.lightStripAction({action: "set-color", color: color});
		}

		function Blink(){
			var delay = vm.lightStripDelay || 1000;
			return LightResource.lightStripAction({action: "blink", color: vm.lightStripWheelColor, delay: delay}).$promise.then(function(success){
				Materialize.toast("LightStrip has blink!", 5000);
			}, function(error){
				Materialize.toast("Unable to blink LightStrip", 5000);
			});
		}

		function Beam(){
			return LightResource.lightStripAction({action: "beam", color: vm.lightStripWheelColor}).$promise.then(function(success){
				Materialize.toast("LightStrip is beaming!", 5000);
			}, function(error){
				Materialize.toast("Unable to beam LightStrip", 5000);
			});
		}

		function SetLightStripBrightness(){
			LightResource.lightStripAction({action: "set-brightness", brightness: vm.lightStripBrightness});
		}

		function StopLightStrip(){
			return LightResource.lightStripAction({action: "stop"}).$promise.then(function(success){
				Materialize.toast("LightStrip has been stopped!", 5000);
			}, function(error){
				Materialize.toast("Unable to stop LightStrip", 5000);
			});
		}

		SocketService.on("lightStripStatus", function(data){
			vm.isLightStripOn = data;
			vm.loadingLightStripStatus = false;
		});

		SocketService.on("lightStripBrightness", function(data){
			vm.lightStripBrightness = data;
		});

		// Always have this in Controller that uses SocketService, to disconnect user from Server's Socket.IO on leaving the page that has this controller
		$scope.$on("$destroy", function dismiss() {
			SocketService.off("lightStripStatus");
			SocketService.off("lightStripBrightness");
		});
	}

	app.controller("LightCtrl", ["$scope", "$controller", "AnnyangService", LightCtrl]);
	function LightCtrl($scope, $controller, AnnyangService){
		var vm = this;

		vm.m = $controller("MilightCtrl", {$scope: $scope});
		vm.l = $controller("LightStripCtrl", {$scope: $scope});

		AnnyangService.AddCommand("turn off the lights", function(){
			vm.m.TurnMilightOff();
			vm.l.StopLightStrip();
		});

		AnnyangService.AddCommand("turn on the lights", function(){
			vm.m.ChangeMilightWhite();
		});

		AnnyangService.AddCommand("i feel blue", function(){
			var color = "#3374db";
			vm.m.ChangeMilightColor(color);
			vm.l.SetLightStripColor(color);
		});

		AnnyangService.AddCommand("paint my love", function(){
			var color = "#db33ac";
			vm.m.ChangeMilightColor(color);
			vm.l.SetLightStripColor(color);
		});

		AnnyangService.AddCommand("where is the bed", function(){
			vm.m.TurnMilightOff();
			vm.l.SetLightStripColor("#ffffff");
		});

		AnnyangService.AddCommand("party mode", function(){
			vm.m.TurnMilightOff();
			vm.l.Rainbow();
		});
	}
	
	app.controller("ChatCtrl", ["$rootScope", "$scope", "SessionService", "SocketService", "NotificationService", ChatCtrl]);
	function ChatCtrl($rootScope, $scope, SessionService, SocketService, NotificationService){
		var vm = this;

		vm.Users = [];
		vm.Chats = [];

		vm.SendMessage = SendMessage;

		SocketService.on("connectedClients", ListUsers);

		SocketService.emit("getChatClients", {"query": SessionService.GetToken()}, function(data){
			ListUsers(data);
		});

		function ListUsers(data){
			vm.Users = data;
		}

		function SendMessage(){
			vm.Chats.push({me: true, message: vm.chat});
			SocketService.emit("serverGetChat", {"query": SessionService.GetToken(), from: SessionService.GetName() || SessionService.GetEmail(), message: vm.chat});
			delete vm.chat;
		}
		
		SocketService.on("serverSendChat", function(data){
			vm.Chats.push(data);
		});
	
		// Always have this in Controller that uses SocketService, to disconnect user from Server's Socket.IO on leaving the page that has this controller
		$scope.$on("$destroy", function() {
			SocketService.off("connectedClients");
			SocketService.off("serverSendChat");
		});
	}

})();
