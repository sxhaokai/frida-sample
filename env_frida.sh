#!/usr/bin/env bash
adb push /Users/haokai/Downloads/frida-server /data/local/tmp/
adb shell chmod 755 /data/local/tmp/frida-server
adb shell su -c /data/local/tmp/frida-server &
sleep 2
adb shell netstat -tunlp | grep frida-server