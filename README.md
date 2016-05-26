Japri is a smart home web application. It helps you control your connected home appliances, gives you information about your home's surroundings, and communicate between users.
Japri provides critical data, like camera pictures, and sensors in real-time.
Japri requires a server that is hosted by a low cost computer, Raspberry Pi 3 ($35). It will handle requests from mobile phones / computers that are connected to your home network where your Raspberry Pi is connected at.

DEMO / Article that explains a high level view of this project:
https://medium.com/@kelvien/japri-7a43cf7f0cdc

Features:
- JWT (JSON Web Token): Using token to validate per user's request
- SPA (Single Page Application): Allows seamless transition between pages
- Get quick information about time / weather / bus schedule / verse of the day
- Chat between connected users
- Stream live pictures taken by a camera
- Control lights (RGB Light bulb & Light strip), including its brightness and color
- Monitor sensors data (Motion & Light sensitivity)
- Control servo (In my case, I use it to open my door)
- Validate NFC Tags
- Use voice to perform some commands for the connected home appliances

Hardware:
- Raspberry Pi 3
- Adafruit 16-Channel 12-bit PWM/Servo HAT
- Servo (Towerpro MG996r) (180 degree rotation Servo)
- MiLight Light bulbs
- MiLight Wifi controller
- WS2812b LED Light strip (5M)
- NFC Breakout (PN532)
- PiCamera NoIR
- PIR sensor (Motion sensor)
- Photoresistor (Light sensor)

Software:
- Back-end: Node.js, Express, Grunt.js, Socket.io, MongoDB
- Front-end: Angular.js, Bootstrap
- External API: Weather, Bible, NextBus, News

Future work:
- TTS (Talk-to-speech)
- Music
- Twilio API
- AVS (Amazon Voice Service)

#Install##
`sudo npm install --unsafe-perm`

*--unsafe-perm: due to several dependencies that needs root permission and some that does not

##Notes:##
- This app requires MongoDB to run before it is able to run

It is also recommended to run mongod with --auth parameter
Example usage:
`mongod --auth --dbpath /Applications/mongodb/data/db`

And here is how you create the authorized users to access the database:
v2.6
`db.createUser(
    {
      user: "",
        pwd: "",
        roles: [
            { role: "readWrite", db: "japri" }
        ]
    }
)`
v2.4
`db.addUser(
  {   
    user: "", 
    pwd: "", 
    roles: ["readWrite"] 
  }
)`

MongoDB quick reference:
https://docs.mongodb.org/manual/reference/mongo-shell/

- Grunt's LiveReload does not work for server that is run in HTTPS (There should be a workaround, but my code does not handle that right now)

- Setting up  Raspberry PI:
I use 'Raspbian Jessie' as my OS
Follow: https://www.raspberrypi.org/documentation/installation/installing-images
to install image into the SD Card.

- Initial Steps:
`sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade`
 
- Changing keyboard settings:
open /etc/default/keyboard, and edit to:
`XKBLAYOUT=”US”`

- Connection:
Wifi/Ethernet
open /etc/wpa_supplicant/wpa_supplicant.conf, and change its settings

- Install Node.js and MongoDB:
http://blog.wia.io/installing-node-js-v4-0-0-on-a-raspberry-pi
`sudo apt-get mongodb` 

- SSL Setup in Node.js:
https://matoski.com/article/node-express-generate-ssl/

- Setup RPi 3 UART (This is needed for components that uses UART connection, such as the NFC breakout):
https://frillip.com/raspberry-pi-3-uart-baud-rate-workaround/

- Screen Rotation (This is only if you are using a screen that you are connecting to the Raspberry Pi from DSI:
open /boot/config.txt, and add:
`lcd_rotate=2`

- Setup RPi 3 Kiosk:
open /etc/rc.local, and add:
`sh /home/pi/prog/japri/start.sh`
open ~/.config/lxsession/LXDE-pi/autostart, and add:
`@chromium-browser --kiosk --incognito https://localhost  
@unclutter &`

- If it fails installing serialport:
sudo npm install --unsafe-perm serialport