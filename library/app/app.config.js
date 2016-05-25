// CONFIGURATION
(function(){
		
	var app = angular.module("Japri");

	app.config(["$httpProvider", "$urlRouterProvider", "$locationProvider", "$stateProvider", "angularPromiseButtonsProvider", "MODULES", Config]);
	function Config($httpProvider, $urlRouterProvider, $locationProvider, $stateProvider, angularPromiseButtonsProvider, Modules){

		// Set Interceptor for all Requests
		$httpProvider.interceptors.push("AuthInterceptor");

		// Removes /# on all routes
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});

		angularPromiseButtonsProvider.extendConfig({
			disableBtn: true,
			btnLoadingClass: "is-loading",
			addClassToCurrentBtnOnly: false,
			disableCurrentBtnOnly: false
		});

		// Route all declared states in the constant
		angular.forEach(Modules, function(value, key){
			$stateProvider
			.state(value)
		});

		// Set Otherwise state (404)
		$urlRouterProvider.otherwise("/404");

	}

})();
