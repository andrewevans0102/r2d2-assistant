#!/usr/bin/env python3
import fileinput
import os

R2D2_TWILIO_ACCOUNT_SID = os.environ['R2D2_TWILIO_ACCOUNT_SID']
R2D2_TWILIO_AUTH_TOKEN = os.environ['R2D2_TWILIO_AUTH_TOKEN']
R2D2_TWILIO_ACCOUNT_PHONE_NUMBER = os.environ['R2D2_TWILIO_ACCOUNT_PHONE_NUMBER']

def localEnvironment():
    print("local environment file is starting")
    fileName = "handler.js"
    # read file into memory
    with open(fileName, 'r') as file :
        filedata = file.read()
    # replace variables in place
    filedata = filedata.replace("R2D2_TWILIO_ACCOUNT_SID", R2D2_TWILIO_ACCOUNT_SID)
    filedata = filedata.replace("R2D2_TWILIO_AUTH_TOKEN", R2D2_TWILIO_AUTH_TOKEN)
    filedata = filedata.replace("R2D2_TWILIO_ACCOUNT_PHONE_NUMBER", R2D2_TWILIO_ACCOUNT_PHONE_NUMBER)
    # write out updated file
    with open(fileName, 'w') as file:
        file.write(filedata)
    print("local environment file is finished")

print("setup environment has started")
localEnvironment()
print("setup environment has finished")