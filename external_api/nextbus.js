var xml2json = require("xml2json");
var http = require("http");

var default_timeout = 10000;
var url = "webservices.nextbus.com";

function nextbusAPI(){
	var nextbus = this;

	nextbus.GetAgent = GetAgent;
	nextbus.GetRoutes = GetRoutes;
	nextbus.GetRouteConfig = GetRouteConfig;
	nextbus.GetPredictions = GetPredictions;

	function GetAgent(){
		var promise = new Promise(function(resolve, reject) {
			var options = {
				host: url,
				port: 80,
				method: "GET",
				path: "/service/publicXMLFeed?command=agencyList"
			};

			http.request(options, function(res) {
				var responseData = "";

				res.setEncoding("utf8");
				res.on("data", function (chunk) {
					responseData += chunk;
				});

				res.on("end", function() {
					var responseObject = xml2json.toJson(responseData);
					resolve(responseObject);
			    });
			})
			.setTimeout(default_timeout)
			.on("timeout", function(timeout){
				reject("Timeout in making an API request call");
			}).on("error", function(error){
				reject("Unable to make an API request call");
			}).end();
		});

		return promise;
	}

	function GetRoutes(agentId){
		var promise = new Promise(function(resolve, reject) {
			var agentID = agentId || "cyride";
			var options = {
				host: url,
				port: 80,
				method: "GET",
				path: "/service/publicXMLFeed?command=routeList&a="+agentID
			}
			http.request(options, function(res) {
					var responseData = "";

					res.setEncoding("utf8");
					res.on("data", function (chunk) {
						responseData += chunk;
					});

					res.on("end", function() {
						var responseObject = xml2json.toJson(responseData);
						resolve(responseObject);
				    });
				})
				.setTimeout(default_timeout)
				.on("timeout", function(timeout){
					reject("Timeout in making an API request call");
				}).on("error", function(error){
					reject("Unable to make an API request call");
				}).end();
			});

		return promise;
	}

	function GetRouteConfig(agentId, routeTag){
		var promise = new Promise(function(resolve, reject) {
			if(routeTag == ""){
				reject(false);
			}
			var agentID = agentId || "cyride";
			var options = {
				host: url,
				port: 80,
				method: "GET",
				path: "/service/publicXMLFeed?command=routeConfig&a="+agentID+"&r="+routeTag
			}
			http.request(options, function(res) {
					var responseData = "";

					res.setEncoding("utf8");
					res.on("data", function (chunk) {
						responseData += chunk;
					});

					res.on("end", function() {
						var responseObject = xml2json.toJson(responseData);
						resolve(responseObject);
				    });
				})
				.setTimeout(default_timeout)
				.on("timeout", function(timeout){
					reject("Timeout in making an API request call");
				}).on("error", function(error){
					reject("Unable to make an API request call");
				}).end();
			});

		return promise;
	}

	function GetPredictions(agentId, routeTag, stopTag){
		var promise = new Promise(function(resolve, reject) {
			if(routeTag == "" || stopTag == ""){
				reject(false);
			}
			var agentID = agentId || "cyride";
			var options = {
				host: url,
				port: 80,
				method: "GET",
				path: "/service/publicXMLFeed?command=predictions&a="+agentID+"&r="+routeTag+"&s="+stopTag
			}
			http.request(options, function(res) {
					var responseData = "";

					res.setEncoding("utf8");
					res.on("data", function (chunk) {
						responseData += chunk;
					});

					res.on("end", function() {
						var responseObject = xml2json.toJson(responseData);
						resolve(responseObject);
				    });
				})
				.setTimeout(default_timeout)
				.on("timeout", function(timeout){
					reject("Timeout in making an API request call");
				}).on("error", function(error){
					reject("Unable to make an API request call");
				}).end();
			});

		return promise;
	}

}

module.exports = nextbusAPI;