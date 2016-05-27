// SERVICES
(function(){

	var app = angular.module("Japri");

	app.service("SessionService", ["$window", SessionService]);
	function SessionService($window){
		this.Create = Create;
		this.Destroy = Destroy;
		this.IsExpired = IsExpired;
		this.GetRole = GetRole;
		this.GetName = GetName;
		this.GetEmail = GetEmail;
		this.GetToken = GetToken;
		this.IsDeveloper = IsDeveloper;

		function Create(res) {
			if(Valid(res)){
				var payload = res.split(".")[1];
				var payload_info = JSON.parse(atob(payload));
				this.user_role = payload_info.permission;
				this.name = payload_info.name;
				this.email = payload_info.email;
				this.token = res;
			}
		};

		function Destroy() {
			delete this.user_role;
			delete this.token;
			delete this.name;
			delete this.email;

			$window.sessionStorage.removeItem("japri");
			delete $window.localStorage.japri;
		};

		function GetName(){
			return this.name;
		}

		function GetEmail(){
			return this.email;
		}

		function GetToken(){
			return this.token;
		}

		function GetRole(){
			return this.user_role;
		}

		function IsDeveloper(){
			return (this.user_role == "Developer");
		}

		function IsExpired(res){
			if(Valid(res)){
				var payload = res.split(".")[1];
				var payload_info = JSON.parse(atob(payload));
				return (Math.round(new Date().getTime() / 1000) >= payload_info.exp);
			}
			return true;
		}

		function Valid(res){
			var splitted = res.split(".");
			if(splitted.length != 3){
				return false
			}
			var payload_info = JSON.parse(atob(splitted[1]));
			return (payload_info.exp !== undefined && payload_info.permission !== undefined);
		}

		return this;
	}

	app.service("AuthService", ["$rootScope", "$window", "AuthResource", "SessionService", "AUTH_EVENTS", "SessionService", "SocketService", "NotificationService", AuthService]);
	function AuthService($rootScope, $window, AuthResource, SessionService, AUTH_EVENTS, SessionService, SocketService, NotificationService){
		var service = this;

		service.IsAuthenticated = IsAuthenticated;
		service.IsAuthorized = IsAuthorized;
		service.GetUserRole = GetUserRole;
		service.Login = Login;
		service.Logout = Logout;

		function IsAuthenticated(state){
			if(state.authentication !== undefined){
				// Create application SessionService if session still exists
				if($window.localStorage.japri && !SessionService.token){
	   				$window.sessionStorage["japri"] = $window.localStorage.japri;
	   			}
				if ($window.sessionStorage["japri"]) {
					// Check if we have previously stored it, and make sure the new one is not a bogus
					if(SessionService.token && SessionService.token != $window.sessionStorage["japri"]){
						SessionService.Destroy();
						return false;
					}

					// Check if token is valid by checking expiration time
	            	if(SessionService.IsExpired($window.sessionStorage["japri"])){
	            		// Time to delete session storage
	            		SessionService.Destroy();
	            		return false;
	            	}
	            	SessionService.Create($window.sessionStorage["japri"]);	
	            } else{
	            	SessionService.Destroy();
	            	return false;
	            }
			}
			return true;
		}

		function IsAuthorized(state){
			if(state.authorized_roles !== undefined){
				if(state.authorized_roles.indexOf(SessionService.user_role) <= -1){
					return false;
				} else if(!this.IsAuthenticated(state)){
					return false;
				} else if(SessionService.token != $window.sessionStorage["japri"]){
					SessionService.Destroy();
					return false;
				}
			}
			return true;
		}

		function GetUserRole(){
			if($window.sessionStorage["japri"] !== undefined){
				SessionService.Create($window.sessionStorage["japri"]);
				return SessionService.GetRole();
			}
		}

		function Login(model, success, error){
			var sendModel;
			if(model){
				sendModel = {email: model.email, password: model.password};
			} else{
				sendModel = {};
			}
			return AuthResource.save(sendModel).$promise.then(function(res){
				// LocalStorage is kept even until browser is closed
				$window.localStorage.japri = res.token;
				// SessionStorage is kept only within a tab session
				$window.sessionStorage["japri"] = res.token;

				SessionService.Create(res.token);

				// Connect socket.io
				SocketService.connect();
				// Run notification
	    		NotificationService.StartNotification();

				$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				success();
			}, function(err){
				error(err);
			});
		}

		function Logout(success){
			// Stop socket.io
			SocketService.disconnect();
			
			SessionService.Destroy();

			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
			success();
		}

		return service;
	}
	
	app.service("MenuService", ["MODULES", "AuthService", "SessionService", MenuService]);
	function MenuService(Modules, AuthService, SessionService){
		var service = this;

		// MENUS to be shown depending on user role
		var menu = [
		Modules.login
		];
		
		var userMenu = [
		Modules.cam, 
		Modules.door,
		Modules.lighting,
		Modules.chat
		];

		var developerMenu = [
		Modules.cam, 
		Modules.door, 
		Modules.lighting,
		Modules.sensor,
		Modules.nfc, 
		Modules.users,
		Modules.chat
		];

		service.GetMenu = GetMenu;
		
		function GetMenu(successLogoutCallback){
			var logoutMenu = {
				title: "Log out",
				callback_function: function(){
					AuthService.Logout(successLogoutCallback)
				}
			};

			var role = SessionService.GetRole();
			if(role == "User"){
				// Only valid account will have the log out menu
				var found = false;
				for(var i = 0; i < userMenu.length; i++){
					if(userMenu[i].title == "Log out"){
						found = true;
						break;
					}
				}
				if(!found){
					userMenu.push(logoutMenu);
				}
				return userMenu;
			} else if(role == "Developer"){
				// Only valid account will have the log out menu
				var found = false;
				for(var i = 0; i < developerMenu.length; i++){
					if(developerMenu[i].title == "Log out"){
						found = true;
						break;
					}
				}
				if(!found){
					developerMenu.push(logoutMenu);
				}
				return developerMenu;
			} else{
				return menu;
			}
		}

		return service;
	}

	app.service("TimeService", ["SessionService", TimeService]);
	function TimeService(SessionService){
		var FriendlyText = 
		{ Morning: "Good morning, ",
		Monday: "You are going to crush Monday, ",
		Wednesday: "Happy Hump day, ",
		Friday: "It's weekend, ",
		GoodDay: "Have a good day, ",
		Night: "Good night, "
		};

		var Months = 
		["January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"];

		var Days = 
		["Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"];

		var service = this;

		service.GetAllInfo = GetAllInfo;
		
		return service;

		function GetAllInfo(name){
			var now = new Date();

			var info = {};

			info.time = GetTime(now);
			info.date = GetDate(now);
			info.fullTime = info.date+". "+info.time;
			info.friendlyText = GetFriendlyText(now, name);

			return info;
		}

		function GetTime(date){
			return Pad(date.getHours())+":"+Pad(date.getMinutes())+":"+Pad(date.getSeconds());
		}

		function GetDate(date){
			return Days[date.getDay()]+", "+date.getDate()+" "+Months[date.getMonth()]+" "+date.getFullYear();
		}

		function GetFriendlyText(date, name){
			if(FriendlyText[Days[date.getDay()]]){
				return FriendlyText[Days[date.getDay()]]+" "+name+" !";
			} else{
				return (date.getHours() > 4 && date.getHours() < 11) ? FriendlyText.Morning+" "+name+" !" : (date.getHours() > 22 || date.getHours() <= 4) ? FriendlyText.Night+" "+name+" !" : FriendlyText.GoodDay+" "+name+" !";
			}
		}

		/*Helper function*/
		function Pad(num){
			return (String(num).length == 1) ? String("0"+num) : String(num);
		}
	}

	app.service("SocketService", ["$rootScope", "$window", "$location", "SessionService", "AUTH_EVENTS", SocketService]);
	function SocketService($rootScope, $window, $location, SessionService, AUTH_EVENTS){
		var service = this;
		
		service.connect = Connect;
		service.disconnect = Disconnect;
		service.on = On;
		service.off = Off;
		service.emit = Emit;
		service.isOn = IsOn;

		var socket = null;

		function IsOn(){
			return (socket !== null);
		}

		function Connect(){
			socket = io.connect($location.host()+":"+$location.port());		

			// Default event listener
			socket.on("connect", function () {
				socket.emit("authenticate", {token: SessionService.GetToken()});	    
			});

			socket.on("authenticated", function () {
				socket.emit("register", {name: SessionService.GetName() || SessionService.GetEmail()});
		    });	
			
			socket.on("disconnect", function (){

			});

			socket.on("unauthorized", function(data, callback){
				// Callback to disconnect user
				callback();
			});

			return socket;
		}

		function Disconnect(){
			if(socket){
				socket.disconnect();
				socket = null;
			}
		}

		// Callback functions
		// This is to apply changes to the view (Look at: $rootScope.$apply)
		// Reference: https://github.com/tiagocparra/angularJS-socketIO/blob/master/angular-socket.js
		function On(event, callback){
            socket.on(event, function(){
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        }

		function Off(event, callback) {
	        if (typeof callback == 'function') {
	            //neste caso o callback nao tem acesso a $scope nem à
	            //scope definida pela variavel socket
	            socket.removeListener(event, callback);
	        } else {
	            socket.removeAllListeners(event);
	        }
	    }

	    function Emit(event, data, callback) {
	        if (typeof callback == 'function') {
	            socket.emit(event, data, function () {
	                var args = arguments;
	                $rootScope.$apply(function () {
	                    callback.apply(socket, args);
	                });
	            });
	        }    
	        else{
	            socket.emit(event, data);
	        }
	    }

		return service;
	}

	// Browsers Notification Service
	app.service("NotificationService", ["SessionService", "SocketService", NotificationService]);
	function NotificationService(SessionService, SocketService){		
		var Service = this;

		Service.NotifyChat = NotifyChat;
		Service.StartNotification = StartNotification;
		Service.StopNotification = StopNotification;

		function NotifyChat(title, content, imgUrl, onClickFn){
			Notification.requestPermission(function(permission){
		        var notification = new Notification(title,{
					body: content,
					icon: imgUrl,
					isClickable: true
				});

				notification.onclick = function(event) {
					window.focus();
					notification.close();
				};

	            setTimeout(function(){
	                notification.close();
	            }, 5000);
		    });
		}

		function StartNotification(){
			SocketService.on("serverSendChat", function(data){
				NotifyChat("Japri Chat", data.from+": "+data.message, data.iconUrl);
			});

			SocketService.on("notificationMovement", function(data){
				Notification.requestPermission(function(permission){
			        var notification = new Notification(
			        	"Movement on front door",{
						body: "Motion sensor detected movement",
						icon: data.iconUrl,
						isClickable: true
					});

					notification.onclick = function(event) {
						window.focus();
						notification.close();
					};

		            setTimeout(function(){
		                notification.close();
		            }, 5000);
			    });
			});

			SocketService.on("notificationUnnecessaryPower", function(data){
				Notification.requestPermission(function(permission){
			        var notification = new Notification(
			        	"Unnecessary power",{
						body: "Light sensor indicates: "+data.data+", and your light is on. You might want to turn them off",
						icon: data.iconUrl,
						isClickable: true
					});

					notification.onclick = function(event) {
						window.focus();
						notification.close();
					};

		            setTimeout(function(){
		                notification.close();
		            }, 5000);
			    });
			});
		}

		function StopNotification(){
			if(Service.notificationInterval){
				clearInterval(Service.notificationInterval);
				SocketService.off("notificationMovement");
				SocketService.off("notificationUnnecessaryPower");
				SocketService.disconnect();
			}
		}

		return Service;
	}

	app.service("ChartService", [ChartService]);
	function ChartService(){
		var service = this;

		service.CreateChart = CreateChart;

		function CreateChart(type, element, scope){
			// https://bost.ocks.org/mike/path/

			var initial_data = false;

			var range = 400;
			var duration = 1000;

			var now = new Date(Date.now() - duration);
			var data = d3.range(range).map(function() { return 0; });

			var margin = {top: 0, right: 0, bottom: 20, left: 50};
			var width = 850;
			var boxWidth = element.find("svg").parent()[0].clientWidth;
			var height = element.find("svg").parent()[0].clientHeight - margin.bottom;

			var x = d3.time.scale()
			    .domain([now * duration, now - duration])
			    .range([0, width]);

			var y = d3.scale.linear()
			    .range([height, 0]);

			var line = d3.svg.line()
			    .interpolate("basis")
			    .x(function(d, i) { return x(now - (range - 1 - i) * duration); })
			    .y(function(d, i) { return y(d); });

			var svg = d3.select(element.find("svg")[0])
			    .attr("width", width)
			    .attr("height", height + margin.top + margin.bottom)
			  	.append("g");

			svg.append("defs").append("clipPath")
			    .attr("id", "clip")
			  	.append("rect")
			    .attr("width", width)
			    .attr("height", height);

			var x_axis = svg.append("g")
			    .attr("class", "x-axis")
			    .attr("transform", "translate(0," + height + ")")
			    .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

			var path = svg.append("g")
			    .attr("clip-path", "url(#clip)")
			  	.append("path")
			    .datum(data)
			    .attr("class", "line");

			var transition = d3.select({}).transition()
			    .duration(1000)
			    .ease("linear");

			(function tick() {
			  transition = transition.each(function() {

			    // update the domains
			    now = new Date();
			    x.domain([now - (range - 2) * duration, now - duration]);
			    y.domain([0, d3.max(data)]);

			    // To set initial data on sensor charts
			    if(!initial_data){
			    	switch(type){
						case "light-sensor":
							data.push(13000);
							break;
						case "pir-sensor":
							data.push(0);
							break;
						default:
							data.push(0);
							break;
					}
					initial_data = true;
			    } else{
			    	data.push(scope.Data);
			    }

			    // redraw the line
			    svg.select(".line")
			        .attr("d", line)
			        .attr("transform", null);

			    // slide the x-axis left
			    x_axis.call(x.axis);

			    // slide the line left
			    path.transition()
			        .attr("transform", "translate(" + x(now - (range - 1) * duration) + ")");

			    // pop the old data point off the front
			    data.shift();

			  }).transition().each("start", tick);
			})();
		}

		return service;
	}

	// Annyang Service
	// Speech recognizer service
	app.service("AnnyangService", ["$rootScope", AnnyangService]);
	function AnnyangService($rootScope) {
        var Service = this;
        
        Service.Init = init;
        Service.Start = start;
        Service.Stop = stop;
        Service.AddCommand = addCommand;

        Service.commands = {};

        function addCommand(phrase, callback) {
            var command = {};
            
            command[phrase] = function(args) {
                $rootScope.$apply(callback(args));
            };

            // Extend our commands list
            angular.extend(Service.commands, command);
            
            annyang.addCommands(command);
        }

        function init() {
            annyang.addCommands(Service.commands);
            annyang.debug(true);
           
            RunAnnyangGUI();
        }

        function start(){
        	annyang.start();
        }

        function RunAnnyangGUI(){
        	SpeechKITT.annyang();

	        SpeechKITT.setSampleCommands(["Open the door", "Turn on the lights"]);

	        SpeechKITT.rememberStatus(1);

	        annyang.addCallback("resultMatch", function() {
	        	SpeechKITT.abortRecognition();
			});

	        SpeechKITT.vroom();
        }

        function stop(){
        	annyang.removeCommands(Service.commands);
        	annyang.abort();
        }
        
        return Service;
    }

})();
