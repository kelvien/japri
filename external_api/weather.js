var https = require("https");

var default_timeout = 10000;
var url = "api.forecast.io";

function weatherAPI(config){
	var weather = this;

	weather.GetPrediction = GetPrediction;

	function GetPrediction(position){
		var promise = new Promise(function(resolve, reject) {
			if(position == ""){
				reject("Missing required parameter");
			}

			var options = {
				host: url,
				port: 443,
				method: "GET",
				path: "/forecast/"+config.weatherAPIKey+"/"+position+"?units=ca"
			};

			https.request(options, function(res) {
				var responseData = "";

				res.setEncoding("utf8");
				res.on("data", function (chunk) {
					responseData += chunk;
				});

				res.on("end", function() {
					var responseObject = responseData;
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

module.exports = weatherAPI;