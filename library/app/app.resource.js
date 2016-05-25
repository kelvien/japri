// FACTORY / RESOURCES
(function(){
	var app = angular.module('Japri');

	app.factory("AuthInterceptor", ["$rootScope", "$q", "$window", "AUTH_EVENTS", AuthInterceptor]);
	function AuthInterceptor($rootScope, $q, $window, AUTH_EVENTS){
		return {
			request: function(request){
				if($window.sessionStorage["japri"]){
					request.headers.Authorization = $window.sessionStorage["japri"];
				}
				return request;
			},
			responseError: function(response){
				$rootScope.$broadcast({
					401 : AUTH_EVENTS.notAuthenticated,
	                403 : AUTH_EVENTS.notAuthorized,
	                419 : AUTH_EVENTS.notAuthenticated,
	                440 : AUTH_EVENTS.notAuthenticated
				}[response.status], response);
				return $q.reject(response);
			}
		}
	}

	// Angular Resource 
	// get: GET
	// save: POST
	// query: GET , isArray
	// remove: DELETE
	// delete: DELETE

	app.factory("AuthResource", ["$resource", AuthResource]);
	function AuthResource($resource){
		var resource = $resource("api/auth");
		delete resource.get;
		delete resource.query;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("UserResource", ["$resource", UserResource]);
	function UserResource($resource){
		var resource = $resource("api/users", {}, {
			edit: {method: "POST", params: {email: "@email"}, url: "api/users/edit/:email"},
			delete: {method: "POST", params: {email: "@email"}, url: "api/users/delete/:email"}
		});
		delete resource.remove;

		return resource;
	}

	app.factory("CameraResource", ["$resource", CameraResource]);
	function CameraResource($resource){
		var resource = $resource("api/camera");
		delete resource.get;
		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("NFCResource", ["$resource", NFCResource]);
	function NFCResource($resource){
		var resource = $resource("api/nfc", {}, {
			get: {method: "GET", params: {tagId: "@tagId"}, url: "api/nfc/:tagId"},
			tag: {method: "POST", params: {tagUid: "@tagUid"}, url: "api/nfc/tag-status/:tagUid"},
			register: {method: "POST", params: {tagUid: "@tagUid"}, url: "api/nfc/tag/register/:tagUid"}
		});
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("ServoResource", ["$resource", ServoResource]);
	function ServoResource($resource){
		var resource = $resource("api/servo");

		delete resource.get;
		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("SensorResource", ["$resource", SensorResource]);
	function SensorResource($resource){
		var resource = $resource("api/sensor", {}, {
			pirStatus: {method: "GET", url: "api/sensor/pir/status"},
			togglePirSensor: {method: "POST", url: "api/sensor/pir"},
			lightSensorStatus: {method: "GET", url: "api/sensor/light-sensor/status"},
			toggleLightSensor: {method: "POST", url: "api/sensor/light-sensor"}
		});

		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("LightResource", ["$resource", LightResource]);
	function LightResource($resource){
		var resource = $resource("api/light", {}, {
			changeColor: {method: "POST", params: {type: "@type"}, url: "api/light/:type/change-color"},
			changeBrightness: {method: "POST", params: {type: "@type"}, url: "api/light/:type/change-brightness"},
			toggle: {method: "POST", params: {type: "@type"}, url: "api/light/:type"},
			lightStripAction: {method: "POST", params: {action: "@action"}, url: "api/light-strip/:action"}
		});

		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("NextbusResource", ["$resource", NextbusResource]);
	function NextbusResource($resource){
		var resource = $resource("api/nextbus", {},
			{
				getRoute: {method: "POST", params: { agentId: "@agentId" }, url: "api/nextbus/:agentId"},
				getRouteConfig: {method: "POST", params: { agentId: "@agentId", routeTag: "@routeTag" }, url: "api/nextbus/:agentId/route/:routeTag"},
				getPrediction: {method: "POST", params: { agentId: "@agentId", routeTag: "@routeTag", stopTag: "@stopTag"}, url: "api/nextbus/:agentId/route/:routeTag/stop/:stopTag"}	
			});

		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("WeatherResource", ["$resource", WeatherResource]);
	function WeatherResource($resource){
		var resource = $resource("api/weather", {},
			{
				getPrediction: {method: "POST", params: { position: "@position" }, url: "api/weather/:position"}
			});

		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("BibleResource", ["$resource", BibleResource]);
	function BibleResource($resource){
		var resource = $resource("api/bible", { },
			{
				getVotd: {method: "GET", url: "api/bible/votd"}
			});

		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}

	app.factory("NewsResource", ["$resource", NewsResource]);
	function NewsResource($resource){
		var resource = $resource("api/news", {},
			{
				getTopStories: {method: "POST", params: { section: "@section" }, url: "api/news/top-stories/:section"}	
			});

		delete resource.query;
		delete resource.put;
		delete resource.remove;
		delete resource.delete;

		return resource;
	}
})();