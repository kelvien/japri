#!/usr/bin/python

from Adafruit_PWM_Servo_Driver import PWM
import sys
import time

# Initialise the PWM device using the default address
pwm = PWM(0x40)

servoMin = 150  # Min pulse length out of 4096
servoMax = 450  # Max pulse length out of 4096

delay = float(sys.argv[1])

pwm.setPWMFreq(60)                       

pwm.setPWM(0, 0, servoMin)
time.sleep(delay)
pwm.setPWM(0, 0, servoMax)
