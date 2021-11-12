console.log("Script loaded successfully ");

Java.perform(function () { //Silently fails without the sleep from the python code
    console.log("Inside java perform function");

    // hookAllClickListener()


    // hookAllMethod("com.smzdm.client.base.utils.wb")

    // Java.use("com.smzdm.client.base.utils.wb").b.implementation = function () {
    //     if (arguments[0] === "PreloadManger" && !arguments[1].startsWith("{")) {
    //         printLog(arguments[0] + ", " + arguments[1])
    //     }
    //     this.b.apply(this, arguments)
    // };

    // Java.use("com.smzdm.client.android.app.HomeActivity").onResume.implementation = function () {
    //     printLog("onResume")
    //     this.onResume.apply(this, arguments)
    // };


    Java.use("e.e.b.a.k.a.a").a.overload("java.util.List").implementation = function () {
        printLog("a")
        // showStacks3()
        this.a.apply(this, arguments)
    };
    Java.use("e.e.b.a.k.a.a").b.overload("java.util.List").implementation = function () {
        printLog("b")
        this.b.apply(this, arguments)
    };

    // Java.use("androidx.recyclerview.widget.RecyclerView$a").bindViewHolder.implementation = function () {
    //     printLog("bindViewHolder:" + this.getClass().getName())
    //     this.bindViewHolder.apply(this, arguments)
    // };

    Java.use("e.e.b.a.o.d").a
        .overload("java.lang.String", "java.util.Map", "java.lang.Class", "e.e.b.a.o.c")
        .implementation = function () {
        printLog(arguments[0])
        printJson(arguments[1])
        this.a.apply(this, arguments)
    };
});

let BottomNavActivity

function saveAs(file) {

}

function writeFile(s) {

    let file = new File([s], "tmp.json", {type: "text/plain;charset=utf-8"});
    saveAs(file);
}

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

    // Java.use("com.bytedance.android.live.broadcast.widget.StartLiveWidget").a.overload().implementation = function (){
    //     printLog("开始直播")
    //     return this.a.apply(this, arguments)
    // }

    //!!! 替换相机 视频流，播放本地视频
    Java.use("android.hardware.Camera").setPreviewTexture.implementation = function (x) {
        printLog("setPreviewTexture")
        let mPlayer = Java.use("android.media.MediaPlayer").$new();
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
 * alimama LoadMore
 */
function tbLoadMore(rvIndex) {
    printLog("tbLoadMore")
    Java.perform(function () {
        Java.choose("com.alimama.moon.ui.BottomNavActivity", {
            onMatch: function (instance) {
                let intRvIndex = Java.use("java.lang.Integer").valueOf(rvIndex).intValue();
                let adapter = instance.adapter.value;
                let billboardFragment = adapter.fragmentManager.value.findFragmentByTag(adapter.fragmentTagMap.value.get(Java.use("java.lang.Integer").valueOf(1)));

                let billboardFragmentParent = Java.cast(billboardFragment, Java.use("com.alimama.base.fragment.base.tabcontent.MultiTabFragment"));
                let viewPagerId = billboardFragmentParent.vpContainer.value.getId();
                // printLog(viewPagerId)
                let tagAllFragment = billboardFragmentParent.getChildFragmentManager().findFragmentByTag("android:switcher:" + viewPagerId + ":0");
                // printLog(billboardFragment.getClass().getName())
                // printLog(tagAllFragment.getClass().getName())

                let UNWBaseDXFragment = Java.cast(tagAllFragment, Java.use("com.alimama.base.fragment.base.UNWBaseDXFragment"))
                let innerViewPager = UNWBaseDXFragment.mUNWDinamicXContainerEngine.value.mDXContainerEngine.value
                    .tabManager.value.viewPager.value
                // printLog(innerViewPager.getClass().getName())
                let DXContainerViewPager = Java.cast(innerViewPager, Java.use("com.taobao.android.dxcontainer.DXContainerViewPager"));
                DXContainerViewPager.setCurrentItem(intRvIndex)

                let rvAdapter = Java.cast(DXContainerViewPager.engineHashMap.value.get(intRvIndex), Java.use("com.taobao.android.dxcontainer.DXContainerSingleRVManager")).adapter.value;
                // printLog(rvAdapter.getClass().getName())
                rvAdapter.preLoadMore(99, Java.use("java.lang.Integer").valueOf(rvIndex))
            },
            onComplete: function () {
            }
        });
    })

}

/**
 * alimama refresh
 */
function tbRefresh(rvIndex) {
    printLog("tbRefresh")
    Java.perform(function () {
        Java.choose("com.alimama.moon.ui.BottomNavActivity", {
            onMatch: function (instance) {
                let intRvIndex = Java.use("java.lang.Integer").valueOf(rvIndex).intValue();
                let adapter = instance.adapter.value;
                let billboardFragment = adapter.fragmentManager.value.findFragmentByTag(adapter.fragmentTagMap.value.get(Java.use("java.lang.Integer").valueOf(1)));

                let billboardFragmentParent = Java.cast(billboardFragment, Java.use("com.alimama.base.fragment.base.tabcontent.MultiTabFragment"));
                let viewPagerId = billboardFragmentParent.vpContainer.value.getId();
                let tagAllFragment = billboardFragmentParent.getChildFragmentManager().findFragmentByTag("android:switcher:" + viewPagerId + ":0");

                let UNWBaseDXFragment = Java.cast(tagAllFragment, Java.use("com.alimama.base.fragment.base.UNWBaseDXFragment"))
                let innerViewPager = UNWBaseDXFragment.mUNWDinamicXContainerEngine.value.mDXContainerEngine.value
                    .tabManager.value.viewPager.value
                let DXContainerViewPager = Java.cast(innerViewPager, Java.use("com.taobao.android.dxcontainer.DXContainerViewPager"));
                DXContainerViewPager.setCurrentItem(intRvIndex)

                let MultiTabCateFragment = Java.cast(tagAllFragment, Java.use("com.alimama.base.fragment.base.tabcontent.MultiTabCateFragment"))
                let ptrFramelayout = MultiTabCateFragment.mPtrFrameLayout.value;
                let mPtrHandler = Java.cast(ptrFramelayout.mPtrHandler.value, Java.use("in.srain.cube.ptr.PtrHandler"))
                mPtrHandler.onRefreshBegin(ptrFramelayout)
            },
            onComplete: function () {
            }
        });
    })

    // Java.perform(function () {
    //     let service = Java.use("alimama.com.unwbase.UNWManager").getInstance().getService(Java.use("alimama.com.unwbase.interfaces.IUTAction").class);
    //     let serviceImpl = Java.cast(service, Java.use("alimama.com.unwbaseimpl.UWNUTImpl"));
    //     let hashMap = Java.use("java.util.HashMap").$new();
    //     hashMap.put("tabKey", "2hour")
    //     hashMap.put("navkey", "all")
    //     // hashMap.put("pageNum", "1")
    //     serviceImpl.ctrlClicked("Page_Billboard","refresh",hashMap)
    // })
}

/**
 * alimama init
 */
function tbinit() {
    printLog("tbinit")
    Java.perform(function () {
        Java.choose("com.alimama.moon.ui.BottomNavActivity", {
            onMatch: function (instance) {
                instance.onClickBottomNavItem("billBoard")

                let adapter = instance.adapter.value;
                let billboardFragment = adapter.fragmentManager.value.findFragmentByTag(adapter.fragmentTagMap.value.get(Java.use("java.lang.Integer").valueOf(1)));

                let billboardFragmentParent = Java.cast(billboardFragment, Java.use("com.alimama.base.fragment.base.tabcontent.MultiTabFragment"));
                let viewPagerId = billboardFragmentParent.vpContainer.value.getId();
                let tagAllFragment = billboardFragmentParent.getChildFragmentManager().findFragmentByTag("android:switcher:" + viewPagerId + ":0");

                let UNWBaseDXFragment = Java.cast(tagAllFragment, Java.use("com.alimama.base.fragment.base.UNWBaseDXFragment"))
                let innerViewPager = UNWBaseDXFragment.mUNWDinamicXContainerEngine.value.mDXContainerEngine.value
                    .tabManager.value.viewPager.value
                let DXContainerViewPager = Java.cast(innerViewPager, Java.use("com.taobao.android.dxcontainer.DXContainerViewPager"));
                DXContainerViewPager.setCurrentItem(0)
                DXContainerViewPager.setCurrentItem(1)
                DXContainerViewPager.setCurrentItem(2)
                DXContainerViewPager.setCurrentItem(3)
                DXContainerViewPager.setCurrentItem(0)
            },
            onComplete: function () {
            }
        });
    })

}

let logcat = false

/**
 * refreshsmzdm
 */
function refreshsmzdm() {
    printLog("refreshsmzdm")
    Java.perform(function () {

        var callback = Java.registerClass({
            name: 'f.a.k.callback1',
            implements: [Java.use("f.a.k")],
            methods: {
                a: function () {
                    console.log("callback.a")
                    return false
                },
                onComplete: function () {
                    console.log("callback.onComplete")
                },
                onError: function (t) {
                    console.log("callback.onError")
                },
                onNext: function (o) {
                    console.log("callback.onNext")
                    printJson(o)
                },
            }
        })
        Java.use("e.e.b.a.o.d")
            .a("https://haojia-api.smzdm.com/home/list",
                Java.use("com.google.gson.Gson")
                    .$new()
                    .fromJson("{\"haojia_title_abtest\":\"a\",\"price_lt\":\"\",\"is_cache\":\"1\",\"manual_sort\":\"\",\"need_default_tab_float2\":\"0\",\"mall_ids\":\"\",\"hour\":\"\",\"past_num\":\"0\",\"haojia_new_list\":\"b\",\"banner_log\":\"\",\"limit\":\"20\",\"ab_test\":\"a\",\"tag_id\":\"\",\"price_gt\":\"\",\"category_ids\":\"\",\"page\":\"1\",\"order\":\"recommend\",\"time_sort\":\"\"}", Java.use("java.util.Map").class),
                Java.use("com.smzdm.client.android.module.haojia.home.bean.HaojiaHomeBean").class,
                Java.use("com.smzdm.client.android.i.a.b.h").$new(null, callback.$new())
                )
    })
}

/**
 * mmtask
 */
function mmtask() {
    printLog("mmtask")
    Java.perform(function () {
        logcat = true
        let id = 20211021
        let json = '{"type":100, "toUsernames":["wxid_v67e7gwhwopq22"], "weChatMsgType":1, "content":"@#$%%😂"}'

        let sunTask = Java.cast(Java.use("com.google.gson.Gson").$new().fromJson(json, Java.classFactory.use("com.baijia.storm.sun.api.common.model.SunTask").class), Java.classFactory.use("com.baijia.storm.sun.api.common.model.SunTask"));
        sunTask.id.value = Java.use("java.lang.Long").$new(id)
        printLog(sunTask.id.value)
        Java.use("com.common.model.Entities.DB")
            .getSeDataBase()
            .sunTaskDao()
            .insert(Java.classFactory.use("com.common.model.Entities.SunTaskEntity").$new(sunTask))
        printLog("sleep start")
        Thread.sleep(3)
        printLog("sleep end")
        logcat = false

    })
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
        .sendTextMessage(Java.use("com.bytedance.android.livesdk.chatroom.bl.j").b("999", 7003591587318287000, 0, "202109031459170101351432010B1EB2B7", null, ""))
        .compose(Java.use("com.bytedance.android.live.core.rxutils.r").c()).subscribe(consumerImpl.$new())

    Java.use("io.reactivex.disposables.CompositeDisposable").$new().add(fetchFollowingCleanList)
    // Java.use("com.ss.android.ugc.aweme.utils.ew").a(fetchFollowingCleanList)
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

    for (let i = 0; i < mhd_array.length; i++) {
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
            // for (let j = 0; j < arguments.length; j++) {
            //     let str = arguments[j]
            //     if (typeof (arguments[j]) === "object" && arguments[j] != null) {
            //         try {
            //             str = Java.use("com.google.gson.Gson").$new().toJson(arguments[j])
            //         } catch (error) {
            //         }
            //     }
            //     args += str + ", "
            // }
            console.log("hooked method: " + str_mhd_name + (args === "" ? "" : ", " + args))
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
    callsayhifunction: sayhi,//exporting callSecretFun as callsecretfunction
    // the name of the export (callsecretfunction) cannot have  neither Uppercase letter nor uderscores.
    // callsayhifunction: sayhi
    callgetfollowlist: getFollowList,
    callgetfollowcleanlist: getFollowCleanList,
    callchatinroom: chatInRoom,
    tbloadmore: tbLoadMore,
    tbrefresh: tbRefresh,
    tbinit: tbinit,
    mmtask: mmtask,
    refreshsmzdm: refreshsmzdm,

};