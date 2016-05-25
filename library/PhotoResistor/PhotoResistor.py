#!/usr/bin/env python
import sys
import RPi.GPIO as io, time, os

io.setmode(io.BCM)

pin_number = 17

def RCtime (RCpin):
        reading = 0
        io.setup(RCpin, io.OUT)
        io.output(RCpin, io.LOW)
        time.sleep(0.1)

        io.setup(RCpin, io.IN)
        while (io.input(RCpin) == io.LOW):
                reading += 1
        return reading

while True:
        sys.stdout.write(str(RCtime(pin_number)))
        sys.stdout.flush()