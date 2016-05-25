var http = require("http");

var default_timeout = 10000;
var url = "labs.bible.org";

function bibleAPI(){
	var bible = this;

	bible.GetVOTD = GetVOTD;

	function GetVOTD(){
		var promise = new Promise(function(resolve, reject) {
			var options = {
				host: url,
				port: 80,
				method: "GET",
				path: "/api/?passage=votd&type=json"
			};

			http.request(options, function(res) {
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

module.exports = bibleAPI;