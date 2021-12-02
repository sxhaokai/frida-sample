# python code
import os
import re
import time
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
process = frida.get_usb_device().attach("com.tencent.mm")
# process = frida.get_usb_device().attach("com.ss.android.ugc.aweme")
script = process.create_script(open("s1.js").read())
script.on("message", my_message_handler)  # register our handler to be called
script.load()
# command = sys.stdin.read()

chatRooms = ["23353584058@chatroom",
             ]
for chatroom in chatRooms:
    script.exports.leaveroom(chatroom)
    time.sleep(2)

print("waiting for command...")
while 1 == 1:
    command = input()
    script.exports.leaveroom(command)

