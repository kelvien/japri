var fs = require("fs");

function app_routes(app, config){
	var router = require("express").Router();

	// Log requests to terminal
	router.use(function(request, response, next){
		console.log("Page Request: "+request.method+": "+request.url);
		next();
	});

	// Route all get requests to main index
	// Angular will direct it accordingly
	router.route("*")
	.get(function(request, response) {
		fs.readFile(__dirname+"/../public/views/common/layout.html", function(err, data){
			if(err){
				throw err;
			}
			response.writeHead(200, {
				"Content-Type": "text/html"
			});
			response.write(data);
			response.end();
		});
	})

	app.use(router); 
}

module.exports = app_routes;