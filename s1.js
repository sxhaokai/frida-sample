console.log("Script loaded successfully ");

Java.perform(function x() { //Silently fails without the sleep from the python code
    console.log("Inside java perform function");
    //get a wrapper for our class
    // var string_class = Java.use("java.lang.String");
    // var handler_class = Java.use("android.os.Handler");
    // var runnable_class = Java.use("java.lang.Runnable");
    // var contact_info_class = Java.use("com.tencent.mm.plugin.profile.ui.ContactInfoUI");

    // var send_text_scene_class = Java.use("com.tencent.mm.modelmulti.i");
    // post(send_text_scene_class.$new("25251681201@chatroom","[微笑]",1,0,null));

    // contact_info_class.onResume.implementation = function () {
    //     this.onResume();
    //     let string = string_class.$new("我是谁");
    //     console.log(string + "");
    //     // showStacks3("frida");
    // }
});

function sayhi(user_name) {
    Java.perform(function () {
        var send_text_scene_class = Java.use("com.tencent.mm.modelmulti.i");
        post(send_text_scene_class.$new(user_name,"[微笑]",1,0,null));
    });
}

function post(scene){
    var core_class = Java.use("com.tencent.mm.model.bg");
    core_class.aFZ().a(scene, 0); //802
    // core_class.aFW().a(scene, 0); //803
}

rpc.exports = {
    callsayhifunction: sayhi //exporting callSecretFun as callsecretfunction
    // the name of the export (callsecretfunction) cannot have  neither Uppercase letter nor uderscores.

};


function showStacks3(str_tag) {
    var Exception = Java.use("java.lang.Exception");
    var ins = Exception.$new("Exception");
    var straces = ins.getStackTrace();

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