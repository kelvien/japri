(function() {
	"use strict";
	
	var app = angular.module("Japri");
	
	// CONSTANT VALUES
	app
	.constant("AUTH_EVENTS", {
		loginSuccess : "auth-login-success",
		logoutSuccess : "auth-logout-success",
		notAuthenticated : "auth-not-authenticated",
		notAuthorized : "auth-not-authorized"
    })
    .constant("MODULES", {
    	unauthorized: {
			name: "401",
			url: "/401",
			title: "Not Authorized",
			templateUrl: "public/views/partials/401.html"
		},
		forbidden: {
			name: "403",
			url: "/403",
			title: "Forbidden",
			templateUrl: "public/views/partials/403.html"
		},
		notfound: {
			name: "404",
			url: "/404",
			title: "Page Not Found",
			templateUrl: "public/views/partials/404.html"
		},
		login: {
			name: "login",
			url: "/login",
			title: "Log in",
			controller: "LoginCtrl",
			controllerAs: "l",
			templateUrl: "public/views/partials/login.html"
		},
		index: {
			name: "index",
			url: "/",
		        title: "Dashboard",
		        controller: "IndexCtrl",
		        controllerAs: "i",
		        templateUrl: "public/views/partials/index.html",
		        authentication: true,
		        authorized_roles: ["Developer", "User"]
		},
		users: {
			name: "user",
			url: "/user",
			title: "Users",
			controller: "UserCtrl",
			controllerAs: "u",
			templateUrl: "public/views/partials/users.html",
			authentication: true,
		    authorized_roles: ["Developer"]
		},
		chat: {
			name: "chat",
			url: "/chat",
			title: "Chat",
			controller: "ChatCtrl",
			controllerAs: "c",
			templateUrl: "public/views/partials/chat.html",
			authentication: true
		},
		cam: {
			name: "cam",
			url: "/cam",
			title: "Camera",
			controller: "CamCtrl",
			controllerAs: "c",
			templateUrl: "public/views/partials/cam.html",
			authentication: true,
			authorized_roles: ["Developer", "User"]
		},
		nfc: {
			name: "nfc",
			url: "/nfc",
			title: "NFC",
			controller: "NFCCtrl",
			controllerAs: "n",
			templateUrl: "public/views/partials/nfc.html",
			authentication: true,
			authorized_roles: ["Developer"]
		},
		door: {
			name: "door",
			url: "/door",
			title: "Door",
			controller: "DoorCtrl",
			controllerAs: "d",
			templateUrl: "public/views/partials/door.html",
			authentication: true,
			authorized_roles: ["Developer", "User"]
		},
		sensor: {
			name: "sensor",
			url: "/sensor",
			title: "Sensors",
			controller: "SensorCtrl",
			controllerAs: "s",
			templateUrl: "public/views/partials/sensor.html",
			authentication: true,
			authorized_roles: ["Developer"]
		},
		lighting: {
			name: "lighting",
			url: "/lighting",
			title: "Lighting",
			controller: "LightCtrl",
			controllerAs: "l",
			templateUrl: "public/views/partials/lighting.html",
			authentication: true,
			authorized_roles: ["Developer", "User"]
		}
    });

})();
