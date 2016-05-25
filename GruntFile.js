module.exports = function(grunt){
    
    grunt.initConfig({
        express: {
            prod: {
                options: {
                    script: "server.js",
                    node_env: "production"
                }
            },
            dev: {
                options: {
                    script: "server.js",
                    node_env: "development"
                }
            }
        },
        less: {
            dev: {
                files: {
                    "library/css/app.css": ["library/less/*.less"]
                }   
            }          
        },
        cssmin: {
            target: {
                files: {
                "public/css/app-dist.min.css": [
                "library/bootstrap-3.3.6-dist/css/*.css", 
                "library/materialize/css/materialize.css",
                "library/loaders.css-master/loaders.css",
                "library/promise-buttons/angular-promise-buttons.css", 
                "library/speechkitt/speechkitt.css",
                "library/css/*.css"]
                }
            }
        },
        concat: {
            dist: {
              src: [
              "library/angular/angular.js", 
              "library/angular/angular-cookies.js", 
              "library/angular/angular-ui-router.js", 
              "library/angular/angular-resource.js",
              "library/jquery/jquery-2.2.1.js", 
              "library/materialize/js/materialize.js",
              "library/annyang/annyang.js", 
              "library/speechkitt/speechkitt.js",
              "library/promise-buttons/angular-promise-buttons.js",
              "library/socket.io/socket.io-client.js", 
              "library/ColorWheel/raphael.js",
              "library/ColorWheel/colorwheel.js",
              "library/ColorWheel/ng-colorwheel.js",
              "library/scroll-glue/scrollglue.js",
              "library/d3/d3.js",
              "library/skycons/skycons.js",
              "library/skycons/angular-skycons.js",
              "library/app/app.js", 
              "library/app/app.constant.js", 
              "library/app/app.config.js", 
              "library/app/app.resource.js", 
              "library/app/app.service.js", 
              "library/app/app.controller.js", 
              "library/app/app.directive.js"],
              dest: "library/js/app-dist.js",
            }
        },
        uglify: {
            prod: {
                options: {
                    mangle: false,
                },
                files: {
                    "public/js/app-dist.min.js": ["library/js/app-dist.js"]
                }
            },
            dev: {
                options: {
                    mangle: false,
                    beautify: true
                },
                files: {
                    "public/js/app-dist.min.js": ["library/js/app-dist.js"]
                }
            }
        },
        watch: {
            grunt: {
                files: ["GruntFile.js"],
                tasks: ["dev"],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            express: {
                files: [
                "japri_config.json",
                "server.js", 
                "config/*.js", 
                "models/*.js", 
                "components/*.js",
                "external_api/*.js"],
                tasks: ["express:dev"],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            html: {
                files: ["public/**/*.html"],
                options: {
                    livereload: true
                }
            },
            css: {
                files: ["library/less/*.less"],
                tasks: ["less", "cssmin"],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ["library/app/*.js"],
                tasks: ["concat", "uglify:dev"],
                options: {
                    livereload: true
                }
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-express-server");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    
    grunt.registerTask("dev", [
        "less", 
        "cssmin", 
        "concat", 
        "uglify:dev", 
        "express:dev", 
        "watch"]);
    grunt.registerTask("default", [
        "less", 
        "cssmin", 
        "concat", 
        "uglify:prod"]);
    
};
