var socketioJwt = require("socketio-jwt");
var jwt = require("jsonwebtoken");
var watchJs = require("watchjs");
var fs = require("fs");
var userModel = require("../models/user.js");

// Socket.IO Variables
var chatClients = [];
var socketClientsCount = 0;

var notification_icon_path = "/public/icons/app-icons/original-logo.png";

var lastNotificationTime = {
    movement: false,
    unnecessaryPower: false
}

function Socketio(server, config, component, helper){
    var io = require("socket.io").listen(server);

    // Watchers
    // PIR Status + Data
    watchJs.watch(component.PIRSensor, ["time", "IsPIROn"], function(){
        io.sockets.emit("sendPirStatus", component.PIRSensor.IsPIROn);
        io.sockets.emit("sendPirReading", component.PIRSensor.DataRead);
        
        // Detects movement, send notification
        if(component.PIRSensor.DataRead == 1){
            var recent = helper.SentRecentNotification("pir-sensor", lastNotificationTime.movement);
            if(recent !== true){
                lastNotificationTime.movement = recent;
                io.sockets.emit("notificationMovement", {iconUrl: notification_icon_path, msg: "Japri detected movement"});
                
                // Send email to all developers who wants to receive email
                userModel.find({
                    permission: "Developer",
                    receivesEmail: true
                }, function(err, users) {
                    if(users.length > 0){                       
                        for(var a = 0; a < users.length; a++){
                            // Individual image sequences
                            //helper.SendEmail(users[a].email, {name: "whathappened.jpg", type: "folder", path: component.LiveStream.FileFolderPath});
                            // Or GIF
                            helper.CreateGIFAndSendEmail(users[a].email, component.LiveStream.FileFolderPath, 768, 576);
                        }
                    }
                });
            }
        }
    });

     // LightSensor Status + Data
    watchJs.watch(component.LightSensor, ["time", "IsPhotoResistorOn"], function(){
        io.sockets.emit("sendLightSensorStatus", component.LightSensor.IsPhotoResistorOn);

        var lightEnum = helper.LightSensitivity(component.LightSensor.DataRead);
        io.sockets.emit("sendLightSensorReading", {raw: component.LightSensor.DataRead, friendlyData: lightEnum});

        // Detects unnecessary power usage, send notification
        var needsLight = helper.NeedsLight(lightEnum);
        if(!needsLight && (component.MilightCtrl.IsMilightOn || component.LightStripCtrl.IsLightStripOn)){
            var recent = helper.SentRecentNotification("light-sensor", lastNotificationTime.unnecessaryPower);
            if(recent !== true){
               lastNotificationTime.unnecessaryPower = recent;
               io.sockets.emit("notificationUnnecessaryPower", {iconUrl: notification_icon_path, data: lightEnum, msg: "Japri detected unnecessary usage of power"});
            } 
        }
    })

    io.sockets
    // socketio-jwt Middleware on listening to Client's connections
    .on("connection", socketioJwt.authorize({
        secret: config.jwt_secret,
        timeout: 15000 // 15 seconds
    }))
    // socketio-jwt Authenticated clients
    .on("authenticated", function(socket) {
        //this socket is authenticated, we are good to handle more events from it.
        socketClientsCount++;
        console.log("Socket.io: Client ("+socket.handshake.address+") is connected");
        console.log("Current connected user: "+socketClientsCount);

        socket.on("register", function(socketOn){
            chatClients[socket.id] = socketOn.name;

            var clients = [];
            for (var property in chatClients) {
                if(clients.indexOf(chatClients[property]) < 0){
                    clients.push(chatClients[property]);
                } 
            }

            io.sockets.emit("connectedClients", clients);
        })

        socket.on("getChatClients", function(socketOn, callbackFn){
            var clients = [];

            for (var property in chatClients) {
                if(clients.indexOf(chatClients[property]) < 0){
                    clients.push(chatClients[property]);
                } 
            }

            callbackFn(clients);
        });

        // Client disconnected event
        socket.on("disconnect", function(socketOn){
            delete chatClients[socket.id];

            var clients = [];
            for (var property in chatClients) {
                if(clients.indexOf(chatClients[property]) < 0){
                    clients.push(String(chatClients[property]));
                } 
            }
            io.sockets.emit("connectedClients", clients);

            socketClientsCount--;

            console.log("Socket.io: Client ("+socket.handshake.address+") disconnected");
            console.log("Current connected user: "+socketClientsCount);

            socket.disconnect();
        });

          ////////////////////////////////////
         //////////EVENT HANDLERS////////////
        ////////////////////////////////////

        // Raspberry Pi Camera Event handlers
        socket.on("getCamStatus", function(socketOn, clientFn){
            // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    socket.emit("liveStreamStatus", component.LiveStream.IsLiveStreamOn);
                }
            });
        });

        // Cam Status
        watchJs.watch(component.LiveStream, "IsLiveStreamOn", function(){
            socket.emit("liveStreamStatus", component.LiveStream.IsLiveStreamOn);
        });
        // Cam Streaming Data
        watchJs.watch(component.LiveStream, "FilePath", function(){
            fs.readFile(component.LiveStream.FilePath, function(error, data) {
                socket.emit("liveReply", data.toString("base64"));
            });
        });

        // NFC Reader Event handlers
        socket.on("getNFCStatus", function(socketOn, clientFn){
            // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    socket.emit("nfcStatus", component.NFCReader.IsNFCOn);
                }
            });
        });
        
        // NFC Status + Data
        watchJs.watch(component.NFCReader, ["time", "IsNFCOn"], function(){
            socket.emit("nfcStatus", component.NFCReader.IsNFCOn);
            socket.emit("nfcPollData", component.NFCReader.DataReadTag);
        });

        // Servo Event handlers
        socket.on("getDoorStatus", function(socketOn, clientFn){
            // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    var servo = component.ServoDriver;
                    socket.emit("doorStatus", servo.IsServoOn);
                    clientFn();
                }
            });
        });
        watchJs.watch(component.ServoDriver, "IsServoOn", function(){
            socket.emit("doorStatus", component.ServoDriver.IsServoOn);
        });

        // PIR Event handlers
        socket.on("getPIRStatus", function(socketOn, clientFn){
            // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    var pirSensor = component.PIRSensor;
                    socket.emit("sendPirStatus", pirSensor.IsPIROn);
                }
            });
        });

        // LightSensor Event handlers
        socket.on("getLightSensorStatus", function(socketOn, clientFn){
            // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    var lightSensor = component.LightSensor;
                    socket.emit("sendLightSensorStatus", lightSensor.IsPhotoResistorOn);
                }
            });
        });

        // Milight Event Handlers
        socket.on("getMilightStatus", function(socketOn, clientFn){
            // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    socket.emit("milightStatus", component.MilightCtrl.IsMilightOn);
                }
            });
        });
        // Milight Status
        watchJs.watch(component.MilightCtrl, "IsMilightOn", function(){
            socket.emit("milightStatus", component.MilightCtrl.IsMilightOn);
        });
        // Milight Brightness
        watchJs.watch(component.MilightCtrl, "Brightness", function(){
            socket.emit("milightBrightness", component.MilightCtrl.Brightness);
        });

        // LightStrip Event Handlers
        socket.on("getLightStripStatus", function(socketOn, clientFn){
            // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    socket.emit("lightStripStatus", component.LightStripCtrl.IsLightStripOn);
                }
            });
        });
        //LightStrip Status
        watchJs.watch(component.LightStripCtrl, "IsLightStripOn", function(){
            socket.emit("lightStripStatus", component.LightStripCtrl.IsLightStripOn);
        });
        // LightStrip Brightness
        watchJs.watch(component.LightStripCtrl, "Brightness", function(){
            socket.emit("lightStripBrightness", component.LightStripCtrl.Brightness)
        });

        // Chat
        socket.on("serverGetChat", function(socketOn, clientFn){
           // Authenticate on each emit (Find other solution later to be a middleware of a socket, for now, this will do it)
            jwt.verify(socketOn.query, config.jwt_secret, function(error, decoded){
                if(error){
                    socket.disconnect();
                    console.log("Socket.io: Client ("+socket.handshake.address+") is not authorized, but requesting to access data");
                } else{
                    socket.broadcast.emit("serverSendChat", {iconUrl: notification_icon_path, from: socketOn.from, message: socketOn.message});
                }
            });
        });  
    });
}

module.exports = Socketio;
