# python code
import os
import re
import subprocess

import frida


#
# device = frida.get_usb_device()
# pid = device.spawn(["com.ss.android.ugc.aweme"])
# device.resume(pid)
# time.sleep(1) #Without it Java.perform silently fails
# session = device.attach(pid)
# script = session.create_script(open("s1.js").read())
# script.load()
#
# #prevent the python script from terminating
# input()

# python code
def my_message_handler(message, payload):  # define our handler
    print("message: ", message)
    print("payload: ", payload)


def shell(commandv):
    print(commandv)
    # processv = os.popen(commandv)
    # outputv = processv.read()
    print(subprocess.call(commandv, shell=True))
    # print(outputv)
    # return outputv


popen = os.popen('adb shell su -c "netstat -tunlp | grep frida-server"')
readline = popen.readline()
print(readline)
strlist = re.split("\\s+", readline)
pid = ""
for value in strlist:
    if value.find("frida-server") != -1:
        pid = re.split("/", value)[0]
        break
print("frida-server pid: " + pid)
print("attach com.smzdm.client.android...")
# print("attach com.tencent.mm...")
# print("attach com.ss.android.ugc.aweme...")
# print("attach com.alimama.moon...")
process = frida.get_usb_device().attach("com.smzdm.client.android")
# process = frida.get_usb_device().attach("com.tencent.mm")
# process = frida.get_usb_device().attach("com.ss.android.ugc.aweme")
# process = frida.get_usb_device().attach("com.alimama.moon")
script = process.create_script(open("s1.js").read())
script.on("message", my_message_handler)  # register our handler to be called
script.load()
while 1 == 1:
    commandStr = input()
    split = commandStr.split(" ")
    command = split[0]
    if command == "callgetfollowlist":
        script.exports.callgetfollowlist()
    elif command == "callgetfollowcleanlist":
        script.exports.callgetfollowcleanlist()
        script.exports.callgetfollowlist()
    elif command == "tbloadmore":
        script.exports.tbloadmore(split[1])
    elif command == "tbrefresh":
        script.exports.tbrefresh(split[1])
    elif command == "tbinit":
        script.exports.tbinit()
    elif command == "mmtask":
        script.exports.mmtask()
    elif command == "refreshsmzdm":
        script.exports.refreshsmzdm()
