// APP RUN
(function() {
	"use strict";
	
	var app = angular.module("Japri", ["ui.router", "ngCookies", "ngResource", "directive.ngColorwheel", "angularPromiseButtons", "luegg.directives", "angular-skycons"]);
	
	// RUN
	app.run(function($http, $rootScope, $state, AuthService, SessionService, SocketService, NotificationService, AUTH_EVENTS){
		// Unauthenticated page YET
		var toBeState;

		// Allows angular app/root scope to access current state's data
		$rootScope.state = $state;

		// Always check for Authentication on state change
		$rootScope.$on("$stateChangeStart", SecurityCheck);

		function SecurityCheck(event, toState){
			if (!AuthService.IsAuthenticated(toState)){
					event.preventDefault();
					// Save the state that needs to be authenticated first
					// So that we can go back to it again if authentication is successful
					toBeState = toState;
					$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
			} else{
				if (!AuthService.IsAuthorized(toState)) {
					event.preventDefault();
					$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
				}
			}
		}

		// Check on complete state change
		$rootScope.$on("$stateChangeSuccess", ReloadMenu);

		function ReloadMenu(event, toState, toParams, fromState){
			$rootScope.h.ReloadMenu();
		}

		// Direct user to login before going to any page that requires authentication
		$rootScope.$on(AUTH_EVENTS.notAuthenticated, GoToLogin);

		// Direct to login on successful log out
	    $rootScope.$on(AUTH_EVENTS.logoutSuccess, FreshLogin);
		
		function GoToLogin(){
			$state.go("login");
		}

		function FreshLogin(){
			$rootScope.h.ReloadMenu();
			$state.go("login");
		}

		// Direct to unauthorized page if user is not authorized to open the page
		$rootScope.$on(AUTH_EVENTS.notAuthorized, NotAuthorized);

		function NotAuthorized(){
			$state.go("401");
		}

		// Always check for confirmed login condition and go to the previously wanted state before authentication
		$rootScope.$on(AUTH_EVENTS.loginSuccess, GoToPending);

		function GoToPending() {
			var goTo = (toBeState !== undefined) ? toBeState.name : "index";
	        $state.go(goTo);
	    };

		// Connect socket.io
		SocketService.connect();
		
	    // Run notification
	    NotificationService.StartNotification();
	});

})();
