var nextbusAPI = require("../external_api/nextbus.js");
var weatherAPI = require("../external_api/weather.js");
var newsAPI = require("../external_api/news.js");
var bibleAPI = require("../external_api/bible.js");

function externalAPI(config){
	var externalApi = this;
	
	externalApi.NextbusAPI = new nextbusAPI();

	externalApi.NewsAPI = new newsAPI(config);

	externalApi.BibleAPI = new bibleAPI();

	externalApi.WeatherAPI = new weatherAPI(config);

	return externalApi;
}

module.exports = externalAPI;