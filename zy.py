# encoding:utf8
import base64
import binascii
import gzip
import hashlib
import json
import random
import re
import time
import uuid

import requests
from Crypto.Cipher import ARC4 as rc4cipher
from requests_toolbelt import MultipartEncoder


class Sign(object):

    def __init__(self, input, salt):
        self.input = input
        self.salt = salt

    def get_sign(self):
        s = "8&%d*[{}]@{}".format(self.md5(self.salt), self.input)
        # print(s)
        # print(len(s))
        return self.md5(s)

    def md5(self, s, salt=''):
        """
        MD5加密+加盐
        :param salt:
        :return:
        """
        new_s = str(s) + salt
        m = hashlib.md5(new_s.encode())
        return m.hexdigest()


PC_1 = [
    56, 48, 40, 32, 24, 16, 8,
    0, 57, 49, 41, 33, 25, 17,
    9, 1, 58, 50, 42, 34, 26,
    18, 10, 2, 59, 51, 43, 35,
    62, 54, 46, 38, 30, 22, 14,
    6, 61, 53, 45, 37, 29, 21,
    13, 5, 60, 52, 44, 36, 28,
    20, 12, 4, 27, 19, 11, 3
]

MOVE_TIMES = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

PC_2 = [
    13, 16, 10, 23, 0, 4,
    2, 27, 14, 5, 20, 9,
    22, 18, 11, 3, 25, 7,
    15, 6, 26, 19, 12, 1,
    40, 51, 30, 36, 46, 54,
    # 29, 39, 50, 44, 32, 47, 47魔改为了46
    29, 39, 50, 44, 32, 46,
    43, 48, 38, 55, 33, 52,
    45, 41, 49, 35, 28, 31
]

IP_Table = [
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7,
    56, 48, 40, 32, 24, 16, 8, 0,
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6
]

E_Table = [
    31, 0, 1, 2, 3, 4,
    3, 4, 5, 6, 7, 8,
    7, 8, 9, 10, 11, 12,
    11, 12, 13, 14, 15, 16,
    15, 16, 17, 18, 19, 20,
    19, 20, 21, 22, 23, 24,
    23, 24, 25, 26, 27, 28,
    27, 28, 29, 30, 31, 0
]

S_Box = [
    # S1
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
     0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
     4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
     15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],

    # S2
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
     3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
     0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
     13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],

    # S3
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
     13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
     13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
     1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],

    # S4
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
     13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
     10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
     3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],

    # S5
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
     14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
     4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
     11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],

    # S6
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
     10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
     9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
     4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],

    # S7
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
     13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
     1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
     6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],

    # S8
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
     1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
     7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
     2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
]

P_Table = [
    15, 6, 19, 20, 28, 11,
    27, 16, 0, 14, 22, 25,
    4, 17, 30, 9, 1, 7,
    23, 13, 31, 26, 2, 8,
    18, 12, 29, 5, 21, 10,
    3, 24
]

IP_1_Table = [
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41, 9, 49, 17, 57, 25,
    32, 0, 40, 8, 48, 16, 56, 24
]


class Decrypt(object):

    def __init__(self):
        """
        解密mainpageinfo数据
        注: tid解密是用from base64 在rc4(newkey)
            mainpageinfo中解密是from base64 在rc4(解密后的tid)  在from base64 在rc4(newkey), 最后ungzip
        :param decrypt_random: 上面的随机数
        """
        # self.decrypt_random = decrypt_random
        pass

    def decrypt_data(self, data, decrypt_random):

        keypart1 = self.md5("@#AIjd83#@6B")
        keypart2 = self.md5(self.getVersionCode())
        keypart3 = self.md5("[%s]@" % decrypt_random)
        keypart3 = self.handle_keypart3(keypart3)
        key_part1p2p3 = keypart1 + keypart2 + keypart3
        key_part1p2p3 = self.handle_p1p2p3(key_part1p2p3)
        keypart4 = self.md5(key_part1p2p3)
        tid_rc4_key = self.get_new_key(key_part1p2p3, keypart4)
        # print("newkey:", tid_rc4_key)
        # return newkey

        information = data.get("data").get("answers")

        if not information:
            return

        tids = None
        if information:
            tids = information.get("tids")
            mainpageinfo = information.get("mainPageInfo")
            if tids and mainpageinfo:
                for i in range(len(tids)):
                    tids[i] = self.rc4_algorithm("decrypt", tids[i], tid_rc4_key)
                    # print(tids[i])
                    mainpageinfo[i] = gzip.decompress(
                        self.rc4_algorithm("decrypt", self.rc4_algorithm("decrypt", mainpageinfo[i], tids[i]),
                                           tid_rc4_key).encode("latin-1")).decode("latin-1")

        information["tids"] = tids
        information["mainPageInfo"] = mainpageinfo
        return data

    def md5(self, s, salt=''):
        """
        MD5加密+加盐
        :param salt:
        :return:
        """
        new_s = str(s) + salt
        m = hashlib.md5(new_s.encode())
        return m.hexdigest()

    def getVersionCode(self):
        VersionCode = 850
        return VersionCode

    def handle_keypart3(self, keypart3):
        keypart3 = list(keypart3)
        _len = len(keypart3) - 1
        for i in range(15):
            tmp = keypart3[i]
            keypart3[i] = keypart3[_len - i]
            keypart3[_len - i] = tmp

        return "".join(keypart3)

    def handle_p1p2p3(self, key_part1p2p3):
        key_part1p2p3 = list(key_part1p2p3)
        _len = len(key_part1p2p3) - 1
        if _len >= 7:
            for i in range(3):
                tmp = key_part1p2p3[i]
                key_part1p2p3[i] = key_part1p2p3[_len - i]
                key_part1p2p3[_len - i] = tmp

        return "".join(key_part1p2p3)

    def get_new_key(self, p1p2p3, md5_p1p2p3):
        _new_key = list(p1p2p3 + md5_p1p2p3)
        _len = len(_new_key) - 1
        if _len >= 7:
            for i in range(60):
                tmp = _new_key[i]
                _new_key[i] = _new_key[_len - i]
                _new_key[_len - i] = tmp

        return "".join(_new_key)

    def rc4_algorithm(self, encrypt_or_decrypt, data, key1):

        if encrypt_or_decrypt == "encrypt":
            key = bytes(key1, encoding='utf-8')
            enc = rc4cipher.new(key)
            res = enc.encrypt(data.encode('utf-8'))
            res = base64.b64encode(res)
            res = str(res, 'utf8')
            return res

        elif encrypt_or_decrypt == "decrypt":
            data = base64.b64decode(data)
            key = bytes(key1, encoding='latin-1')
            enc = rc4cipher.new(key)
            res = enc.decrypt(data)
            res = str(res, 'latin-1')
            return res


class Convert(object):

    def __init__(self, deviceid):
        self.ch = "@fG2SuLA"
        self.deviceid = deviceid

    def textsearchresult(self, content):

        decrypt = Decrypt()
        output = self.getChallenge()
        # Ori Data is
        plainText = "8&%d*##{}##0f3c509eef614432e414ce9d37f00c80##{}|0".format(output, self.deviceid)
        final, data_size = self.des_encrypt(plainText, self.ch)

        # DES Data is
        result = self.str2hex(final, data_size)

        # 输入 DES Data
        data = self.bind_device(result).get("data").get("data")

        hex2str = self.hex2str(data)
        des_key_2 = plainText[7:12] + "#G4"
        response_len = len(data) >> 2

        result = self.des_decrypt(hex2str, des_key_2, response_len)

        obj_random = self.hexStr_to_str(result)
        obj_random = obj_random.strip(b'\x00'.decode()).split("##")[-1]
        # print("obj_random:", obj_random)

        _t = int(time.time())
        time.sleep(random.uniform(1, 3))

        url = "http://search.zybang.com/search/submit/textsearch"
        payload = f"_t_={_t}&androidVersion=8.0.0&appId=homework&area=&channel=baiduzhushou&city=&content={content}&cuid={self.deviceid}|0&dayivc=65&device=AOSP on msm8996&feSkinName=skin-gray&gradeId=4&hybrid=1&isFirst=0&nt=wifi&openCard=1&operatorid=&os=android&physicssize=4.971247911145660&pkgName=com.baidu.homework&presid=&province=&screenscale=2.625&screensize=1920x1080&sdk=26&token=1_XPXQH3c5HRPtFHkSwi3sCCURmT25QfxM&vc=850&vcname=13.7.2&zbkvc=220"
        input = base64.b64encode(payload.replace("&", "").encode("utf8")).decode("utf8")
        # print(input.decode("utf8"))
        s = Sign(input, obj_random)
        sign = s.get_sign()

        payload = f"&presid=&content={content}&isFirst=0&gradeId=4&openCard=1&area=&screensize=1920x1080&cuid={self.deviceid}%7C0&os=android&physicssize=4.971247911145660&city=&channel=baiduzhushou&vc=850&dayivc=65&token=1_XPXQH3c5HRPtFHkSwi3sCCURmT25QfxM&hybrid=1&province=&zbkvc=220&androidVersion=8.0.0&pkgName=com.baidu.homework&appId=homework&feSkinName=skin-gray&vcname=13.7.2&sdk=26&operatorid=&device=AOSP on msm8996&screenscale=2.625&nt=wifi"
        payload += "&sign={}&_t_={}".format(sign, _t)
        # print(payload)

        headers = {
            'Cookie': 'cuid={}%7C0'.format(self.deviceid),
            'X-Wap-Proxy-Cookie': 'none',
            'Accept-Encoding': 'identity',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; AOSP on msm8996 Build/OPR6.170623.010; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.125 Mobile Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'search.zybang.com',
            'Connection': 'Keep-Alive'
        }

        response = requests.post(url, headers=headers, data=payload.encode("utf8").decode("latin-1"))
        data = json.loads(response.content.decode())
        # print(data)
        data = decrypt.decrypt_data(data, obj_random)
        # print(data)
        print(content)
        return data

    def picsearchresult(self, filepath, is_mul=False):

        with open(filepath, "rb") as f:
            content = f.read()

            decrypt = Decrypt()
            output = self.getChallenge()
            # Ori Data is
            plainText = "8&%d*##{}##0f3c509eef614432e414ce9d37f00c80##{}|0".format(output, self.deviceid)
            final, data_size = self.des_encrypt(plainText, self.ch)

            # DES Data is
            result = self.str2hex(final, data_size)

            # 输入 DES Data
            data = self.bind_device(result).get("data").get("data")

            hex2str = self.hex2str(data)
            des_key_2 = plainText[7:12] + "#G4"
            response_len = len(data) >> 2

            result = self.des_decrypt(hex2str, des_key_2, response_len)

            obj_random = self.hexStr_to_str(result)
            obj_random = obj_random.strip(b'\x00'.decode()).split("##")[-1]
            # print("obj_random:", obj_random)

            _t = str(int(time.time()))
            # time.sleep(random.uniform(1, 3))

            picmd5 = self.md5(content).upper()
            if is_mul:
                url = "http://search.zybang.com/search/submit/wholesearch"
            else:
                url = "http://search.zybang.com/search/submit/picsearchnew"
            logid = str(random.randint(int(time.time()) // 2, int(time.time()))) + str(
                random.randint(int(time.time()) // 2, int(time.time())))
            payload = f"_t_={_t}androidVersion=8.0.0appId=homeworkarea=bookId=0channel=baiduzhushoucity=cuid={self.deviceid}|0dayivc=65device=AOSP on msm8996feSkinName=skin-grayhybrid=1isFirst=0logid={logid}nt=wifioperatorid=os=androidphysicssize=4.971247911145660picMD5={picmd5}pkgName=com.baidu.homeworkprovince=ref=1screenscale=2.625screensize=1920x1080sdk=26thirdChannel=token=1_XPXQH3c5HRPtFHkSwi3sCCURmT25QfxMuserType=0vc=850vcname=13.7.2wholeExtraInfo=zbkvc=220"
            input = base64.b64encode(payload.replace("&", "").encode("utf8")).decode("utf8")
            s = Sign(input, obj_random)
            sign = s.get_sign()

            m = MultipartEncoder(fields={
                "image": ("image", content, "application/octet-stream"),
                "ref": (None, "1", "text/plain; charset=UTF-8"),
                "logid": (None, logid, "text/plain; charset=UTF-8"),
                "bookId": (None, "0", "text/plain; charset=UTF-8"),
                "isFirst": (None, "0", "text/plain; charset=UTF-8"),
                "picMD5": (None, picmd5, "text/plain; charset=UTF-8"),
                "thirdChannel": (None, "", "text/plain; charset=UTF-8"),
                "wholeExtraInfo": (None, "", "text/plain; charset=UTF-8"),
                "userType": (None, "0", "text/plain; charset=UTF-8"),
                "area": (None, "", "text/plain; charset=UTF-8"),
                "screensize": (None, "1920x1080", "text/plain; charset=UTF-8"),
                "cuid": (None, self.deviceid + "|0", "text/plain; charset=UTF-8"),
                "os": (None, "android", "text/plain; charset=UTF-8"),
                "physicssize": (None, "4.971247911145660", "text/plain; charset=UTF-8"),
                "city": (None, "", "text/plain; charset=UTF-8"),
                "channel": (None, "baiduzhushou", "text/plain; charset=UTF-8"),
                "vc": (None, "850", "text/plain; charset=UTF-8"),
                "dayivc": (None, "65", "text/plain; charset=UTF-8"),
                "token": (None, "1_XPXQH3c5HRPtFHkSwi3sCCURmT25QfxM", "text/plain; charset=UTF-8"),
                "hybrid": (None, "1", "text/plain; charset=UTF-8"),
                "province": (None, "", "text/plain; charset=UTF-8"),
                "zbkvc": (None, "220", "text/plain; charset=UTF-8"),
                "androidVersion": (None, "8.0.0", "text/plain; charset=UTF-8"),
                "pkgName": (None, "com.baidu.homework", "text/plain; charset=UTF-8"),
                "appId": (None, "homework", "text/plain; charset=UTF-8"),
                "feSkinName": (None, "skin-gray", "text/plain; charset=UTF-8"),
                "vcname": (None, "13.7.2", "text/plain; charset=UTF-8"),
                "sdk": (None, "26", "text/plain; charset=UTF-8"),
                "operatorid": (None, "", "text/plain; charset=UTF-8"),
                "device": (None, "AOSP on msm8996", "text/plain; charset=UTF-8"),
                "screenscale": (None, "2.625", "text/plain; charset=UTF-8"),
                "nt": (None, "wifi", "text/plain; charset=UTF-8"),
                "sign": (None, sign, "text/plain; charset=UTF-8"),
                "_t_": (None, _t, "text/plain; charset=UTF-8")
            })
            #
            # dic = dict(sorted(zip(dic.keys(), dic.values())))

            headers = {
                'Cookie': 'cuid={}%7C0'.format(self.deviceid),
                'X-Wap-Proxy-Cookie': 'none',
                'Accept-Encoding': 'identity',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; AOSP on msm8996 Build/OPR6.170623.010; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.125 Mobile Safari/537.36',
                'Content-Type': m.content_type,
                'Host': 'search.zybang.com',
                'Connection': 'Keep-Alive'
            }

            # response = requests.post(url, headers=headers, data=m,  proxies={"http": "http://localhost:8888"})
            response = requests.post(url, headers=headers, data=m)
            # print(response.content.decode())
            data = json.loads(response.content.decode())
            # print(data)
            data = decrypt.decrypt_data(data, obj_random)
            # print(data)
            print(filepath)
            return data

    def md5(self, s):
        """
        MD5加密+加盐
        :return:
        """
        m = hashlib.md5(s)
        return m.hexdigest()

    def des_encrypt(self, plainText, ch):
        """
        des 非标准加密
        :param plainText: 加密之前明文
        :param ch: 密钥
        :return: final, data_size
        """
        v11 = 0
        bit = [0 for _ in range(64)]
        subKeys = [[0 for _ in range(48)] for _ in range(16)]
        self.Char8ToBit64(ch, bit)
        self.DES_MakeSubKeys(bit, subKeys)
        data_str, data_size = self.plainTextPadding(plainText)
        # print(data_str, data_size)
        v10 = [0 for _ in range(data_size)]
        cipherBlock = [0 for _ in range(data_size)]
        final = ""
        while v11 < data_size:
            v5 = data_str
            final += self.DES_EncryptBlock(v5[v11:v11 + 8], subKeys, cipherBlock)
            v11 += 8

        return final, data_size

    def DES_EncryptBlock(self, plainBlock, subkeys, cipherBlock):
        """
        f函数
        :param plainBlock:
        :param subkeys:
        :param cipherBlock:
        :return:
        """
        bit = [0 for _ in range(64)]
        self.Char8ToBit64(plainBlock, bit)
        v4 = 0
        bit = self.DES_IP_Transform(bit)
        v9 = bit[32:]
        while v4 <= 15:
            v7 = v9[:32]
            v7 = self.DES_E_Transform(v7)
            # if v4 == 9:
            #     print("demo")
            v7 = self.DES_XOR(v7, subkeys[v4], 48)
            v7 = self.DES_SBOX(v7)
            v7 = self.DES_P_Transform(v7)
            bit = self.DES_XOR(bit, v7, 32)
            if v4 != 15:
                self.DES_Swap(bit, v9)
            v4 += 1

        bit = self.DES_IP_1_Transform(bit)
        cipherBlock = self.Bit64ToChar8(bit, cipherBlock)
        return cipherBlock

    def des_decrypt(self, cipherBuffer, ch, cipherLength):
        """
        des解密(主要获得最后计算sign的随机值)
        :param cipherBuffer:
        :param ch:
        :param cipherLength:
        :return:
        """
        plainText = [0 for _ in range(cipherLength + 1)]
        v8 = 0
        bit = [0 for _ in range(64)]
        subKeys = [[0 for _ in range(48)] for _ in range(16)]
        self.Char8ToBit64(ch, bit)
        self.DES_MakeSubKeys(bit, subKeys)
        cipherBlock = [0 for _ in range(cipherLength)]
        final = ""
        while v8 < cipherLength:
            final += self.DES_DecryptBlock(cipherBuffer[v8:v8 + 8], subKeys, cipherBlock)
            v8 += 8
        # print(final)
        result = self.plainTextDeletePadding(final, cipherLength * 2)
        # print(result)
        return result

    def DES_DecryptBlock(self, cipherBlock, subkeys, plainBlock):
        bit = [0 for _ in range(64)]
        self.Char8ToBit64(cipherBlock, bit)
        bit = self.DES_IP_Transform(bit)
        v9 = bit[32:]
        v5 = 15
        while v5 >= 0:
            v7 = v9[:32]
            v7 = self.DES_E_Transform(v7)
            v7 = self.DES_XOR(v7, subkeys[v5], 48)
            v7 = self.DES_SBOX(v7)
            v7 = self.DES_P_Transform(v7)
            bit = self.DES_XOR(bit, v7, 32)
            if v5:
                self.DES_Swap(bit, v9)
            v5 -= 1

        bit = self.DES_IP_1_Transform(bit)
        plainBlock = self.Bit64ToChar8(bit, plainBlock)
        return plainBlock

    def plainTextDeletePadding(self, plainText, intPlainTextLength):
        result = [0 for _ in range(intPlainTextLength)]
        result[:intPlainTextLength] = plainText[:intPlainTextLength]
        result[intPlainTextLength - 1] = "0"
        return "".join(result)

    def bind_device(self, hex352):
        """
        绑定真机接口
        :param hex352: des_encrypt加密后的str2hex(final)
        :return:
        """
        url = "http://www.zybang.com/pluto/app/antispam"

        payload = f"&data={hex352}&area=&screensize=1920x1080&cuid={self.deviceid}%7C0&os=android&physicssize=4.971247911145660&city=&channel=baiduzhushou&vc=850&dayivc=65&token=1_XPXQH3c5HRPtFHkSwi3sCCURmT25QfxM&hybrid=1&province=&zbkvc=220&androidVersion=8.0.0&pkgName=com.baidu.homework&appId=homework&feSkinName=skin-gray&vcname=13.7.2&sdk=26&operatorid=&device=AOSP on msm8996&screenscale=2.625&"
        headers = {
            'Cookie': '',
            'X-Wap-Proxy-Cookie': 'none',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; AOSP on msm8996 Build/OPR6.170623.010; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.125 Mobile Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'www.zybang.com',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        return eval(response.content.decode())

    def Char8ToBit64(self, ch, b):
        """
        8 -> 64二进制
        :param ch:
        :param b:
        :return:
        """
        for i in range(8):
            self.__ByteToBit(ch[i], b, 8 * i)

    def __ByteToBit(self, key, b, index):
        for i in range(8):
            if isinstance(key, str):
                b[index + i] = (ord(str(key)) >> i) & 1
            else:
                b[index + i] = (key >> i) & 1

    def DES_MakeSubKeys(self, key, subkeys):
        """
        生成密钥
        :param key:
        :param subkeys:
        :return:
        """
        v3 = 0
        tempbts = [0 for _ in range(56)]
        self.DES_PC1_Transform(key, tempbts)
        # print(tempbts)
        while (v3 <= 15):
            self.DES_ROL(tempbts, MOVE_TIMES[v3])
            # if v3 == 9:
            #     print("demo")
            self.DES_PC2_Transform(tempbts, subkeys[v3])
            v3 += 1

    def DES_PC1_Transform(self, key, tempbts):
        """
        PC1_table
        :param key:
        :param tempbts:
        :return:
        """
        for i in range(56):
            tempbts[i] = key[PC_1[i]]

    def DES_ROL(self, data, time):
        """
        生成密钥过程中左右置换
        :param data:
        :param time:
        :return:
        """
        v5 = [0 for _ in range(56)]
        v5[:time] = data[:time]
        v5[time:time + time] = data[28:28 + time]
        data[:28 - time] = data[time:28]
        data[28 - time: 28] = v5[:time]
        data[28:56 - time] = data[28 + time:56]
        data[56 - time:56] = v5[time:2 * time]
        # print(data)

    def DES_PC2_Transform(self, key, tempbts):
        """
        PC2_table
        :param key:
        :param tempbts:
        :return:
        """
        for i in range(48):
            tempbts[i] = key[PC_2[i]]

    def plainTextPadding(self, plainText):
        """
        填充
        :param plainText:
        :return:
        """
        _len = len(plainText)
        v4 = ((_len + ((_len >> 31) >> 29)) & 0xFFFFFFF8) + 8
        v5 = v4 - _len
        v6 = [0 for _ in range(((_len + ((_len >> 31) >> 29)) & 0xFFFFFFF8) + 8)]
        v6[:_len] = plainText[:_len]
        v6[v4 - 1] = v5
        #   result->size = v4;
        #   result->str = v6;
        return v6, v4

    def DES_IP_Transform(self, data):
        """
        IP_Table
        :param data:
        :return:
        """
        v3 = [0 for _ in range(64)]
        for i in range(64):
            v3[i] = data[IP_Table[i]]
        return v3

    def DES_E_Transform(self, data):
        """
        E_Table
        :param data:
        :return:
        """
        v3 = [0 for _ in range(48)]
        for i in range(48):
            v3[i] = data[E_Table[i]]
        return v3

    def DES_XOR(self, R, L, count):
        """
        异或
        :param R:
        :param L:
        :param count:
        :return:
        """
        for i in range(count):
            R[i] ^= L[i]
        return R

    def DES_SBOX(self, data):
        """
        S盒
        :param data:
        :return:
        """
        for i in range(8):
            v1 = 4 * i
            v2 = 6 * i
            v3 = S_Box[i][
                32 * data[v2] + 16 * data[6 * i + 5] + data[v2 + 4] + 8 * data[v2 + 1] + 4 * data[v2 + 2] + 2 * data[
                    v2 + 3]]
            data[v1] = (v3 >> 3) & 1
            data[v1 + 1] = (v3 >> 2) & 1
            data[v1 + 2] = (v3 >> 1) & 1
            data[v1 + 3] = v3 & 1
        return data

    def DES_P_Transform(self, data):
        """
        P_Table
        :param data:
        :return:
        """
        v3 = [0 for _ in range(32)]
        for i in range(32):
            v3[i] = data[P_Table[i]]
        return v3

    def DES_Swap(self, left, right):
        """
        左右交换(最后一轮f不交换)
        :param left:
        :param right:
        :return:
        """
        v5 = [0 for _ in range(32)]
        v5[:32] = left[:32]
        left[:32] = right[:32]
        right[:32] = v5[:32]
        left[32:] = v5

    def DES_IP_1_Transform(self, data):
        """
        IP_1_Table
        :param data:
        :return:
        """
        v3 = [0 for _ in range(64)]
        for i in range(64):
            v3[i] = data[IP_1_Table[i]]
        return v3

    def Bit64ToChar8(self, bit, ch):
        """
        64位2进制->8
        :param bit:
        :param ch:
        :return:
        """
        c = ""
        for i in range(8):
            c += self.BitToByte2(bit, ch[i], 8 * i)
        return c

    def BitToByte2(self, bit, ch, index):
        for i in range(8):
            ch |= bit[index + i] << i
        # print(ch)
        return "%02x" % ch

    def getChallenge(self):
        """
        随机字符串(注册设备上传服务端需要,sign生成需要用到)
        :return:
        """
        v6 = ""
        lrand = int(time.time())
        v4 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        v5 = len("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
        for i in range(10):
            v6 += v4[random.randint(0, lrand) % v5]
        return v6

    def str2hex(self, s, size):
        """
        str->hex
        :param s:
        :param size:
        :return:
        """
        # v6 = [0 for _ in range(4 * _len + 1)]
        # v6[4 * _len] = 10
        bit = [0, 0, 0, 0, 0, 0, 0, 0]
        print(s, size, "str2hex")
        str2hex = ""
        for i in range(size):
            self.__ByteToBit2(s[2 * i:2 * (i + 1)], bit)
            str2hex += self.__bin8ToHex(bit)
        return str2hex

    def __ByteToBit2(self, key, bit):
        """
        :param key:
        :param bit:
        :return:
        """
        key = int(key, 16)
        for i in range(8):
            if isinstance(key, str):
                bit[i] = (ord(str(key)) >> i) & 1
            else:
                bit[i] = (key >> i) & 1

    def __bin8ToHex(self, bin):
        """
        每位(2个字符如90->0009)
        :param bin:
        :return:
        """
        v2, v3 = 0, 0
        for i in range(4):
            v2 += (1 << (3 - i)) * (bin[i])
        for j in range(4):
            v3 += (1 << (3 - j)) * bin[4 + j]
        return "%02x%02x" % (v2, v3)

    def hex2str(self, s):
        """
        hex -> str
        :param s:
        :return:
        """
        _len = len(s)
        data = [0 for _ in range(2 * _len)]
        v2 = [0 for _ in range(_len // 4 + 1)]
        v2[_len // 4] = 0

        for i in range(0, _len, 2):
            v8 = s[i:i + 2]
            self.hex2bin(v8, data, 2 * i)

        hex2str = ""
        for j in range(0, 2 * _len, 8):
            hex2str += self.BitToByte(data[j:j + 8], v2[j // 8])
        return hex2str

    def BitToByte(self, bit, ch):
        for i in range(8):
            ch |= bit[i] << i
        return chr(ch)

    def hex2bin(self, hexstr, binstr, current_addr):
        s1 = ord(hexstr[1])
        if s1 == 48:
            v3 = "0000"
        elif s1 == 49:
            v3 = "0001"
        elif s1 == 50:
            v3 = "0010"
        elif s1 == 51:
            v3 = "0011"
        elif s1 == 52:
            v3 = "0100"
        elif s1 == 53:
            v3 = "0101"
        elif s1 == 54:
            v3 = "0110"
        elif s1 == 55:
            v3 = "0111"
        elif s1 == 56:
            v3 = "1000"
        elif s1 == 57:
            v3 = "1001"
        elif s1 == 97:
            v3 = "1010"
        elif s1 == 98:
            v3 = "1011"
        elif s1 == 99:
            v3 = "1100"
        elif s1 == 100:
            v3 = "1101"
        elif s1 == 101:
            v3 = "1110"
        elif s1 == 102:
            v3 = "1111"
        else:
            v3 = "0000"

        for i in range(4):
            binstr[current_addr + i] = int(v3[i])

    def str_to_hexStr(self, string):
        str_bin = string.encode('utf-8')
        return binascii.hexlify(str_bin).decode('utf-8')

    def hexStr_to_str(self, hex_str):
        hex = hex_str.encode('utf-8')
        str_bin = binascii.unhexlify(hex)
        return str_bin.decode('utf-8')


def getUUID():
    return "".join(str(uuid.uuid4()).split("-")).upper()


if __name__ == '__main__':

    # TODO 不要换太频繁, 不返回数据再换
    deviceid = "06012E6A8CF439D61C2B473052D32F1A"
    # deviceid = "9FFABD3E9B46D6D3FF9D111352A9041A"
    # deviceid = getUUID()
    # deviceid = ""
    convert = Convert(deviceid)


    # 文字拍搜
    for _ in range(1):
        result = convert.textsearchresult("中心对称图形又是轴对称图形")
        print(json.dumps(result))

    def sub_span(matched):
        return ""

    #
    # 图片单题拍搜
    # for _ in range(1):
    #     result = convert.picsearchresult("1616661829740653.jpeg")
    #     for qu in result["data"]["answers"]["mainPageInfo"]:
    #         qu = json.loads(qu)
    #         question = qu.get("question", {}).get("content")
    #         answer = qu.get("answer", [])[0].get("content")
    #
    #         question = re.sub("<span.+?</span>", sub_span, question)
    #         print("q:", question)
    #         answer = re.sub("<span.+?</span>", sub_span, answer)
    #         print("a:", answer)

    # 图片多题拍搜
    # for _ in range(1):
    #     result = convert.picsearchresult("./1234.jpg", is_mul=True)
    #     print(json.dumps(result))