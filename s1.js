console.log("Script loaded successfully ");

Java.perform(function () { //Silently fails without the sleep from the python code
    console.log("Inside java perform function");

    hookAllClickListener()

    // hookAllMethod("com.baidu.homework.activity.search.singlequestion.PicSearchActivity")

    // Java.use("com.baidu.homework.activity.search.singlequestion.PicSearchActivity").a.overload("android.content.Context", "[B","int", "int", "boolean").implementation = function () {
    //     printLog(arguments[2] + ", " + arguments[3] + ", " + arguments[4])
    //     this.a.apply(this, arguments)
    // };
    // Java.use("com.baidu.homework.common.ui.widget.HybridWebView$d").shouldInterceptRequest.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest').implementation = function () {
    //     printLog("res: " + arguments[1].getUrl())
    //     this.shouldInterceptRequest.apply(this, arguments)
    // };
    // Java.use("com.baidu.homework.common.ui.widget.HybridWebView$d").shouldInterceptRequest.overload('com.zuoyebang.common.web.WebView', 'java.lang.String').implementation = function () {
    //     printLog("url: " + arguments[1])
    //     this.shouldInterceptRequest.apply(this, arguments)
    // };

    // Java.use("com.zuoyebang.common.web.WebView").loadUrl.overload("java.lang.String").implementation = function () {
    //     printLog(arguments[0])
    //     this.loadUrl.apply(this, arguments)
    // };

    // Java.use("com.zuoyebang.common.web.WebView").evaluateJavascript.implementation = function () {
    //     printLog(arguments[0])
    //     this.evaluateJavascript.apply(this, arguments)
    // };

    // hookAllMethod("com.zuoyebang.common.web.s")


    // Java.use("com.baidu.homework.activity.search.singlequestion.PicSearchActivity").a.overload("com.baidu.homework.common.net.model.v1.Picsearchnew").implementation = function () {
    //     showStacks3()
    //     return this.a.apply(this, arguments)
    // };

    // Java.use("com.baidu.homework.activity.search.singlequestion.PicSearchActivity$5").a.overload("java.lang.Object").implementation = function () {
    //     send(Java.use("com.google.gson.Gson").$new().toJson(arguments[0]))
    //     return this.a.apply(this, arguments)
    // };

    // Java.use("com.baidu.homework.activity.search.core.SearchResultPagerAdapter").e.overload("int").implementation = function () {
    //     printLog(this.b(arguments[0]))
    //     showStacks3()
    //     return this.e.apply(this, arguments)
    // };

    // Java.use("com.baidu.homework.common.net.model.v1.Picsearchnew$Input").buildInput.implementation = function () {
    //     printArgs(arguments)
    //     return this.buildInput.apply(this, arguments)
    // };


    // Java.use("com.baidu.homework.common.ui.widget.HybridWebView").isPageLoadCompleted.implementation = function () {
    //     showStacks3()
    //     return this.isPageLoadCompleted.apply(this, arguments)
    // };

    // hookAllMethod("com.baidu.homework.common.ui.widget.HybridWebView")


    // hookRoomInfo()

    // hookAllMethod("com.baidu.homework.common.ui.widget.HybridWebView")
    // Java.use("android.webkit.WebView").loadUrl.overload("java.lang.String").implementation = function () {
    //     // printLog("loadUrl" + arguments[0])
    //     send(arguments[0])
    //     this.loadUrl.apply(this, arguments)
    // };

    // Java.use("com.baidu.homework.common.ui.widget.HybridWebView").loadUrl.overload("java.lang.String").implementation = function () {
    //     printLog("postUrl")
    //     printArgs(arguments)
    //     this.loadUrl.apply(this, arguments)
    // };

    // hookAllMethod("com.ss.android.ugc.aweme.live.LivePlayActivity")
    // hookAllMethod("com.bytedance.android.live.core.a.a")//日志
    // Java.use("com.bytedance.retrofit2.intercept.RealInterceptorChain").RealInterceptorChain__proceed$___twin___.implementation = function (x) {
    //     printLog("url: " + x.getUrl())
    //     return this.RealInterceptorChain__proceed$___twin___(x);
    // };




    //打印网络请求
    // Java.use("com.bytedance.retrofit2.SsHttpCall$1").callSuccess.implementation = function (p) {
    //     printLog(getField(getField(getField(this, "this$0"), "originalRequest"), "url"))
    //     printJson(getField(p, "body"))
    //     return this.callSuccess(p)
    // }

    //日志
    // hookAllMethod("com.ss.avframework.utils.AVLog")
    // hookAllMethod("com.ss.android.ttvecamera.t")
});

function printLog(str) {
    console.log("=>" + str)
}

function getField(obj, fieldName) {
    return obj.getClass().getDeclaredField(fieldName).get(obj)
}

function getJsonValue(obj, ...fieldNames) {
    let jsonObj = Java.use("org.json.JSONObject").$new(Java.use("com.google.gson.Gson").$new().toJson(obj));
    if (fieldNames.length === 1) {
        return jsonObj.opt(fieldNames[0])
    } else {
        let tmpObj = jsonObj
        for (let i = 0; i < fieldNames.length - 1; i++) {
            tmpObj = tmpObj.optJSONObject(fieldNames[i])
        }
        return tmpObj.opt(fieldNames[fieldNames.length - 1])
    }
}

function setField(obj, fieldName, value) {
    let declaredField = obj.getClass().getDeclaredField(fieldName);
    declaredField.setAccessible(true)
    declaredField.set(obj, value)

}


function hookCamera() {

    Java.use("com.bytedance.android.live.broadcast.widget.StartLiveWidget").a.overload().implementation = function (){
        printLog("开始直播")
        return this.a.apply(this, arguments)
    }

    //!!! 替换相机 视频流，播放本地视频
    Java.use("android.hardware.Camera").setPreviewTexture.implementation = function (x) {
        printLog("setPreviewTexture")
        let mPlayer =  Java.use("android.media.MediaPlayer").$new();
        mPlayer.setSurface(Java.use("android.view.Surface").$new(x));
        mPlayer.setAudioStreamType(3);
        mPlayer.setDataSource("/sdcard/a.mp4");
        mPlayer.setLooping(true);
        mPlayer.prepare();
        mPlayer.start();
    };

    //防止视频旋转
    Java.use("android.graphics.Matrix").preRotate.overload("float").implementation = function (x) {
        return this.preRotate(0)
    };

    // Java.use("com.ss.avframework.livestreamv2.capture.CameraVideoCapturer").tryDeliverFrame.implementation = function () {
    //     printLog("rotation: " + this.g.value + ", " + this.h.value)
    //     this.tryDeliverFrame.apply(this, arguments)
    // };

    // Java.use("com.ss.avframework.livestreamv2.capture.CameraVideoCapturer").$init.implementation = function () {
    //     let result = this.$init.apply(this, arguments);
    //     this.h.value = 3
    //     printLog("CameraVideoCapturer construct")
    //     return result
    // };
}

function hookRoomInfo() {
    Java.use("com.bytedance.android.livesdk.message.config.depend.a").a.overload("com.ss.ugc.live.sdk.msg.data.SdkMessage").implementation = function (x) {
        let ret = this.a(x);
        let messageType = getJsonValue(ret, "common", "method")
        if ("WebcastRoomUserSeqMessage" == messageType) {
            //观看人数
            printLog(messageType + ", total: " + getJsonValue(ret, "total"))
        } else if ("WebcastMemberMessage" == messageType) {
            //xx 来了
            let displayKey = getJsonValue(ret, "common", "display_text", "key")
            let displayPattern = getJsonValue(ret, "common", "display_text", "default_pattern")
            let userNickName = getJsonValue(ret, "user", "nickname")
            printLog(messageType + ", " + userNickName + ", " + displayPattern + ", displayKey: " + displayKey)
        } else if ("WebcastChatMessage" == messageType) {
            //聊天
            let userNickName = getJsonValue(ret, "user", "nickname")
            let content = getJsonValue(ret, "content")
            printLog(messageType + ", " + userNickName + ": " + content)
        } else if ("WebcastLikeMessage" == messageType) {
            //为主播点赞
            let userNickName = getJsonValue(ret, "user", "nickname")
            printLog(messageType + ", " + userNickName + " 为主播点赞了")
        } else if ("WebcastRoomIntroMessage" == messageType) {
            //进直播间介绍
            let userNickName = getJsonValue(ret, "user", "nickname")
            let intro = getJsonValue(ret, "intro")
            let label = getJsonValue(ret, "label")
            printLog(messageType + ", " + userNickName + label + ", " + intro)
        } else if ("SystemMessage" == messageType) {
            //进直播系统提示消息
            let content = getJsonValue(ret, "content")
            printLog(messageType + ", " + content)
        } else if ("WebcastAudioChatMessage" == messageType) {
            //语音聊天消息
            let userNickName = getJsonValue(ret, "user", "nickname")
            let content = getJsonValue(ret, "content")
            let audio_url = getJsonValue(ret, "audio_url")
            printLog(messageType + ", " + userNickName + ": " + content + ", " + audio_url)
        } else {
            printLog(messageType + ", 待解析")
            // printJson(ret)
        }
        return ret
    };
}

/**
 * 获取关注列表
 */
function getFollowList() {
    var consumerImpl = Java.registerClass({
        name: 'io.reactivex.functions.ConsumerImplGetFollowList',
        implements: [Java.use("io.reactivex.functions.Consumer")],
        methods: {
            accept: function (x) {
                console.log("zzz")
                console.log(Java.use("com.google.gson.Gson").$new().toJson(x))
            },
        }
    })

    let fetchFollowingCleanList = Java.use("com.ss.android.ugc.aweme.following.repository.d").$new().a("2871548127752867",
        "MS4wLjABAAAA7AnNOcH8mPR0eY0U5pLJDf47swnUhbYaaFGuxUdeYIqNDND-5C9GMlsb9MvWqiZP", 0, 0, 20, 0, 4, 2, 1, 0, 0)
    Java.use("com.ss.android.ugc.aweme.utils.ew").a(fetchFollowingCleanList).subscribe(consumerImpl.$new())
}

/**
 * 获取关注clean列表
 */
function getFollowCleanList() {
    var consumerImpl = Java.registerClass({
        name: 'io.reactivex.functions.ConsumerImplGetFollowCleanList',
        implements: [Java.use("io.reactivex.functions.Consumer")],
        methods: {
            accept: function (x) {
                console.log("zzz")
                console.log(Java.use("com.google.gson.Gson").$new().toJson(x))
            },
        }
    })
    let fetchFollowingCleanList = Java.use("com.ss.android.ugc.aweme.following.repository.FollowingCleanApi").a.value.a().fetchFollowingCleanList(0, 20, 0, 0, 0);
    Java.use("com.ss.android.ugc.aweme.utils.ew").a(fetchFollowingCleanList).subscribe(consumerImpl.$new())
}

/**
 * 直播间评论
 */
function chatInRoom() {
    var consumerImpl = Java.registerClass({
        name: 'io.reactivex.functions.ConsumerImplChatInRoom',
        implements: [Java.use("io.reactivex.functions.Consumer")],
        methods: {
            accept: function (x) {
                console.log("zzz")
                printJson(x)
            },
        }
    })
    let fetchFollowingCleanList = Java.use("com.bytedance.android.livesdk.service.i").k().b().a(Java.use("com.bytedance.android.livesdk.chatroom.api.RoomRetrofitApi").getClass())
        .sendTextMessage(Java.use("com.bytedance.android.livesdk.chatroom.bl.j").b("999", 7003591587318287000, 0, "202109031459170101351432010B1EB2B7", null,""))
        .compose(Java.use("com.bytedance.android.live.core.rxutils.r").c()).subscribe(consumerImpl.$new())

    Java.use("io.reactivex.disposables.CompositeDisposable").$new().add(fetchFollowingCleanList)
    // Java.use("com.ss.android.ugc.aweme.utils.ew").a(fetchFollowingCleanList)
}

/**
 * zyb
 */
function picsearch() {
    var consumerImpl = Java.registerClass({
        name: 'com.baidu.homework.common.net.f.abc',
        implements: [Java.use("com.baidu.homework.common.net.f$a")],
        methods: {
            a: [{
                returnType: 'void',
                argumentTypes: ['com.baidu.homework.common.net.e'],
                implementation(error) {
                    printLog("error")
                    printJson(error)
                }
            }, {
                returnType: 'void',
                argumentTypes: ['java.lang.Object'],
                implementation(result) {
                    printLog("success")
                    send(Java.use("com.google.gson.Gson").$new().toJson(result))
                }
            }]
        }
    })

    Java.choose("com.baidu.homework.base.ProxyApplication",{
        onMatch: function(context){
            printLog("request=>")
            let file = Java.use("java.io.File").$new("/sdcard/a.png");
            let input = Java.use("java.io.BufferedInputStream").$new(Java.use("java.io.FileInputStream").$new(file));
            let array = new Array(input.available());
            array.fill(0)
            let bArr = Java.array('byte', array);
            // bArr = Java.cast(bArr, Java.use("[B"))
            input.read(bArr, 0, input.available());
            input.close();
            let j2 = Java.use("com.baidu.homework.common.utils.h").a(Java.use("com.baidu.homework.base.BaseApplication").getCuid() + Java.use("android.os.SystemClock").elapsedRealtime())
            let a2 = Java.use("com.baidu.homework.activity.search.a.g").a(bArr, true)
            let inputbase = Java.use("com.baidu.homework.common.net.model.v1.Picsearchnew$Input")
                .buildInput(0, j2, 0, 0, a2, "", "", 1, "20211214174806ecc2d5c7d513d7f8e7c2c61da3fb513c01748ff2d70e8303", 0, 1, 0, "{\"ugcQuestion\":0}", "{\"newFirstCamera\":\"2\"}", "")
            let request = Java.use("com.baidu.homework.common.net.f").$new(context, inputbase, "image", bArr);
            Thread.sleep(3)
            request.a(consumerImpl.$new())
        },
        onComplete: function(){

        }
    });

}

/**
 * hook所有view的ClickListener的点击
 */
function hookAllClickListener() {
    Java.use("android.view.View").performClick.implementation = function () {
        console.log("\nview: " + this.getClass().getName() + ", view-id: " + this.getId() + "\nlistener: " + Java.cast(Java.cast(this.mListenerInfo.value, Java.use("android.view.View$ListenerInfo")).mOnClickListener.value, Java.use("java.lang.Object")).getClass().getName())
        return this.performClick();
    }
}

/**
 * hook 该类中的所有方法
 * @param className
 */
function hookAllMethod(className) {
    console.log("\nhook all methods in class: " + className)
    let cls = Java.use(className);
    let mhd_array = cls.class.getDeclaredMethods();

    for (let i = 0; i < mhd_array.length; i++)
    {
        let mhd_cur = mhd_array[i];
        let str_mhd_name = mhd_cur.getName()
        let pClazzNames = []
        let parameterTypes = mhd_cur.getParameterTypes();
        for (let j = 0; j < parameterTypes.length; j++) {
            pClazzNames.push(parameterTypes[j].getName())
        }
        console.log("hook method " + str_mhd_name + ", " + pClazzNames)
        let method = cls[str_mhd_name];
        method.overload.apply(method, pClazzNames).implementation = function () {
            let args = ""
            for (let j = 0; j < arguments.length; j++) {
                let str = arguments[j]
                if (typeof (arguments[j]) === "object" && arguments[j] != null) {
                    try {
                        str = Java.use("com.google.gson.Gson").$new().toJson(arguments[j])
                    } catch (error){}
                }
                args += str + ", "
            }
            console.log("hooked method: " + str_mhd_name)
            // console.log("hooked method: " + str_mhd_name + (args === "" ? "" : ", " + args))
            return this[str_mhd_name].apply(this, arguments)
        }
            // getGenericInterceptor(className, str_mhd_name, pClazzNames.length)
    }
}

function printArgs(args) {
    for (let i = 0; i < args.length; i++) {
        console.log(args[i])
    }
}

function printJson(x) {
    console.log("====================================================")
    console.log(Java.use("com.google.gson.Gson").$new().toJson(x))
}

function sayhi(user_name) {
    Java.perform(function () {
        var send_text_scene_class = Java.use("com.tencent.mm.modelmulti.i");
        post(send_text_scene_class.$new(user_name, "[微笑]", 1, 0, null));
    });
}

function post(scene) {
    var core_class = Java.use("com.tencent.mm.model.bj");
    core_class.buS().a(scene, 0); //802
    // core_class.aFW().a(scene, 0); //803
}


/**
 * 动态生成 callback 方法
 * @param className
 * @param func
 * @param parameterCount
 * @returns {Function}
 */
function getGenericInterceptor(className, func, parameterCount) {
    let args = []
    for (let i = 0; i < parameterCount; i++) {
        args.push('arg_' + i)
    }
    let script = "let result = this.__FUNCNAME__(__SEPARATED_ARG_NAMES__);\nlet logmessage = '__CLASSNAME__.__FUNCNAME__(' + __SEPARATED_ARG_NAMES__ + ') => ' + result;\nconsole.log(logmessage);\nreturn result;"

    script = script.replace(/__FUNCNAME__/g, func);
    script = script.replace(/__SEPARATED_ARG_NAMES__/g, args.join(', '));
    script = script.replace(/__CLASSNAME__/g, className);
    script = script.replace(/\+  \+/g, '+');

    args.push(script)
    return Function.apply(null, args)
}

function showStacks3() {
    let str_tag = "frida"
    let Exception = Java.use("java.lang.Exception")
    let ins = Exception.$new("Exception")
    let straces = ins.getStackTrace();

    if (undefined == straces || null == straces) {
        return;
    }

    console.log("=============================" + str_tag + " Stack strat=======================");
    console.log("");

    for (var i = 0; i < straces.length; i++) {
        var str = "   " + straces[i].toString();
        console.log(str);
    }

    console.log("");
    console.log("=============================" + str_tag + " Stack end=======================\r\n");
    Exception.$dispose();
}



rpc.exports = {
    callsayhifunction: sayhi ,//exporting callSecretFun as callsecretfunction
    // the name of the export (callsecretfunction) cannot have  neither Uppercase letter nor uderscores.
    // callsayhifunction: sayhi
    callgetfollowlist: getFollowList,
    callgetfollowcleanlist: getFollowCleanList,
    callchatinroom: chatInRoom,
    picsearch: picsearch,

};