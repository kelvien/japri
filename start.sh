#Place this in /etc/rc.local, this script is to repair mongo, run mongo and run node on Raspberry Pi's start boot up

mongod --dbpath /home/pi/DB/mongodb --repair
mongod --dbpath /home/pi/DB/mongodb --auth & 
node /home/pi/prog/dist_test/japri/server.js &
