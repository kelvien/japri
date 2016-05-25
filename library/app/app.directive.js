// DIRECTIVES
(function(){
	
	var app = angular.module("Japri");
	
	app.directive("jHeader", [jHeader]);
	function jHeader() {
		return {
			restrict: "E",
			controller: "HeaderCtrl",
			controllerAs: "h",
			templateUrl: "/public/views/common/header.html",
			link: function($scope){
				// Materialize SideNav
				$(".button-collapse").sideNav({"edge": "left"});
				// Close on choosing menu
				$("ul.side-nav").on("click", function(){
					$(".button-collapse").sideNav("hide");
				});
			}
		};
	}

	app.directive("jFooter", [jFooter]);
	function jFooter() {
		return {
			restrict: "E",
			templateUrl: "/public/views/common/footer.html",
			link: function($scope){
				// Get current year for copyright
				$scope.year = new Date().getFullYear();
			}
		};
	}

	// Load image
	app.directive("imgLoading", [ImgLoading]);
	function ImgLoading(){
		return {
			restrict: "A",
			scope: {
				imgLoaded: "=imgLoaded",
				imgLoadError: "=imgLoadError"
			},
			link: function(scope, element, attrs, ctrl){
				element.bind("load", function(){
					scope.imgLoaded = true;
				});
				element.bind("error", function(){
					scope.imgLoadError = true;
				});
			}
		}
	}

	// Edit user directive 
	app.directive("editUser", [EditUser]);
	function EditUser(){
		return {
			restrict: "E",
			templateUrl: "/public/views/common/edit-user.html",
			controller: "UserCtrl",
			controllerAs: "u",
			scope: {
				user: "=user"
			},
			link: function(scope, element, attrs, ctrl){
				$('select').material_select();
			}
		}
	}

	// Delete user directive 
	app.directive("deleteUser", [deleteUser]);
	function deleteUser(){
		return {
			restrict: "E",
			templateUrl: "/public/views/common/delete-user.html",
			controller: "UserCtrl",
			controllerAs: "u",
			scope: {
				user: "=user"
			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	/*Dashboard widgets*/
	app.directive("camWidget", [camWidget]);
	function camWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/cam.html",
			controller: "CamCtrl",
			controllerAs: "c",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("chatWidget", [chatWidget]);
	function chatWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/chat.html",
			controller: "ChatCtrl",
			controllerAs: "c",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("doorWidget", [doorWidget]);
	function doorWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/door.html",
			controller: "DoorCtrl",
			controllerAs: "d",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("milightWidget", [milightWidget]);
	function milightWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/milight.html",
			controller: "MilightCtrl",
			controllerAs: "m",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("lightStripWidget", [lightStripWidget]);
	function lightStripWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/light-strip.html",
			controller: "LightStripCtrl",
			controllerAs: "l",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("nfcWidget", [nfcWidget]);
	function nfcWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/nfc.html",
			controller: "NFCCtrl",
			controllerAs: "n",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("pirSensorWidget", [pirSensorWidget]);
	function pirSensorWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/pir-sensor.html",
			controller: "PirSensorCtrl",
			controllerAs: "p",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("lightSensorWidget", [lightSensorWidget]);
	function lightSensorWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/light-sensor.html",
			controller: "LightSensorCtrl",
			controllerAs: "l",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("timeWidget", [timeWidget]);
	function timeWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/time.html",
			controller: "TimeCtrl",
			controllerAs: "t",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("weatherWidget", [weatherWidget]);
	function weatherWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/weather.html",
			controller: "WeatherCtrl",
			controllerAs: "w",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("bibleWidget", [bibleWidget]);
	function bibleWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/bible.html",
			controller: "BibleCtrl",
			controllerAs: "b",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("newsWidget", [newsWidget]);
	function newsWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/news.html",
			controller: "NewsCtrl",
			controllerAs: "n",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("nextbusWidget", [nextbusWidget]);
	function nextbusWidget(){
		return {
			restrict: "E",
			templateUrl: "/public/views/widget/nextbus.html",
			controller: "NextbusCtrl",
			controllerAs: "n",
			scope: {

			},
			link: function(scope, element, attrs, ctrl){

			}
		}
	}

	app.directive("pirSensorChart", ["ChartService", pirSensorChart]);
	function pirSensorChart(ChartService){
		return {
			restrict: "E",
			templateUrl: "/public/views/common/pir-sensor-chart.html",
			scope: {
				Data: "=data"
			},
			link: function(scope, element, attrs, ctrl){
				ChartService.CreateChart("pir-sensor", element, scope);
			}
		}
	}

	app.directive("lightSensorChart", ["ChartService", lightSensorChart]);
	function lightSensorChart(ChartService){
		return {
			restrict: "E",
			templateUrl: "/public/views/common/light-sensor-chart.html",
			scope: {
				Data: "=data"
			},
			link: function(scope, element, attrs, ctrl){
				ChartService.CreateChart("light-sensor", element, scope);
			}
		}
	}

})();