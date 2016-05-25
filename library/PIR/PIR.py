#from socketIO_client import SocketIO
import time
import sys
import RPi.GPIO as io

io.setmode(io.BCM)

pir_pin = 4
io.setup(pir_pin, io.IN)

while True:
	status = io.input(pir_pin)

	sys.stdout.write(str(status))
	sys.stdout.flush()
	time.sleep(1)