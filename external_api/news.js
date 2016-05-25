var https = require("https");

var default_timeout = 10000;
var url = "api.nytimes.com";

var validSections = [
	"home",
	"opinion",
	"world",
	"national",
	"politics",
	"upshot",
	"nyregion",
	"business",
	"technology",
	"science",
	"health",
	"sports",
	"arts",
	"books",
	"movies",
	"theater",
	"sundayreview",
	"fashion",
	"tmagazine",
	"food",
	"travel",
	"magazine",
	"realestate",
	"automobiles",
	"obituaries",
	"inside"
]

function newsAPI(config){
	var news = this;

	news.GetTopStories = GetTopStories;

	function GetTopStories(section){
		var promise = new Promise(function(resolve, reject) {
			if(section != "" && validSections.indexOf(section) < 0){
				reject("Invalid section");
			}

			var options = {
				host: url,
				port: 443,
				method: "GET",
				path: "/svc/topstories/v2/"+section+".json?api-key="+config.nytTopStoriesAPIKey
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

module.exports = newsAPI;