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
print("attach com.tencent.mm...")
# print("attach com.ss.android.ugc.aweme...")
process = frida.get_usb_device().attach("com.tencent.mm:push")
process2 = frida.get_usb_device().attach("com.tencent.mm")
# process = frida.get_usb_device().attach("com.ss.android.ugc.aweme")
script = process.create_script(open("s1.js").read())
script2 = process2.create_script(open("s1.js").read())


script.on("message", my_message_handler)  # register our handler to be called
script.load()
script2.load()
# command = sys.stdin.read()
while 1 == 1:
    command = input()
    # split = command.split(" ")
    # category = split[0]
    # args = split[1]
    if command == "callgetfollowlist":
        script.exports.callgetfollowlist()
    elif command == "callgetfollowcleanlist":
        script.exports.callgetfollowcleanlist()
