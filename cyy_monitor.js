// 自定义事件
(function () {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        // 创建新的Event对象
        var myCustomEvent = document.createEvent('CustomEvent');
        // 初始化事件对象
        myCustomEvent.initCustomEvent(
            // 事件名
            event,
            // 事件是否冒泡
            params.bubbles,
            // 是否可以取消事件的默认行为
            params.cancelable,
            // 细节参数
            params.detail
        );
        return myCustomEvent;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

// 重写 XMLHttpRequest 监听 原本的事件
(function () {
    function ajaxEventTrigger(event) {
        var ajaxEvent = new CustomEvent(event, {
            detail: this
        });
        // 触发事件
        window.dispatchEvent(ajaxEvent);
    }

    var oldXHR = window.XMLHttpRequest;
    var open = oldXHR.prototype.open;
    var send = oldXHR.prototype.send;

    function newXHR() {
        var realXHR = new oldXHR();

        realXHR.addEventListener('abort', function () {
            ajaxEventTrigger.call(this, 'ajaxAbort');
        }, false);

        realXHR.addEventListener('error', function () {
            ajaxEventTrigger.call(this, 'ajaxError');
        }, false);

        realXHR.addEventListener('load', function () {
            ajaxEventTrigger.call(this, 'ajaxLoad');
        }, false);

        realXHR.addEventListener('loadstart', function () {
            ajaxEventTrigger.call(this, 'ajaxLoadStart');
        }, false);

        realXHR.addEventListener('progress', function () {
            ajaxEventTrigger.call(this, 'ajaxProgress');
        }, false);

        realXHR.addEventListener('timeout', function () {
            ajaxEventTrigger.call(this, 'ajaxTimeout');
        }, false);

        realXHR.addEventListener('loadend', function () {
            ajaxEventTrigger.call(this, 'ajaxLoadEnd');
        }, false);

        realXHR.addEventListener('readystatechange', function () {
            ajaxEventTrigger.call(this, 'ajaxReadyStateChange');
        }, false);

        return realXHR;
    }

    function openReplacement() {
        // 获取 open 参数
        console.log('open', arguments);
        return open.apply(this, arguments);
    }

    function sendReplacement() {
        // 获取 send 参数
        console.log('send', arguments);
        return send.apply(this, arguments);
    }

    window.XMLHttpRequest.prototype.open = openReplacement;
    window.XMLHttpRequest.prototype.send = sendReplacement;
    window.XMLHttpRequest = newXHR;

})();

// 统计页面加载时间
window.logInfo = {
    // 设备类型
    device: null,
    // 页面初始化
    openTime: '',
    // 页面白屏时间
    whiteScreenTime: '',
    // 用户可操作时间
    readyTime: '',
    // 总下载时间
    allloadTime: '',
    // 当前时间
    nowTime: ''
};

let logRequestHost = '';

if (/((http(s)?:\/\/)?\d+\.\d+\.\d+\.\d+)|(localhost)(:\d+(\/)?)/ig.test(window.location.host)) {
    logRequestHost = '//10.2.10.227:8300';
} else {
    logRequestHost = '//' + window.location.host;
}

const logUrl = {
    // 加载信息
    load: logRequestHost + '/msg_load',
    // 错误信息
    error: logRequestHost + '/msg_error',
    // 请求信息
    http: logRequestHost + '/msg_http',
}

// 页面初始化
window.logInfo.openTime = performance.timing.navigationStart;
// 页面白屏时间
window.logInfo.whiteScreenTime = +new Date() - window.logInfo.openTime;
// 设备类型
window.logInfo.device = getDevice();

let defaults = {
    // 错误的具体信息
    msg: '',
    // 错误所在的url
    url: '',
    // 错误所在的行
    line: '',
    // 错误所在的列
    col: '',
    // 时间
    nowTime: ''
};

// 页面加载
document.addEventListener('DOMContentLoaded', function (event) {
    window.logInfo.readyTime = +new Date() - window.logInfo.openTime;
});

// 资源加载错误 css js img
document.addEventListener('error', function (ev) {
    const oEvent = ev || event;
    const oTarget = oEvent.srcElement || oEvent.target;
    const path = oTarget.src || oTarget.href;
    console.log(oTarget);
}, true);

// 监听 ajax 请求
window.addEventListener('ajaxReadyStateChange', function (e) {
    console.log(e.detail); // XMLHttpRequest Object
});

window.onload = function () {
    window.logInfo.allloadTime = +new Date() - window.logInfo.openTime;
    window.logInfo.nowTime = +new Date();

    let timeName = {
        whiteScreenTime: '白屏时间',
        readyTime: '用户可操作时间',
        allloadTime: '总下载时间',
        device: '设备名称',
        nowTime: '当前时间',
    };

    let logStr = '';
    for (let i in timeName) {
        logStr += '&' + i + '=' + window.logInfo[i];
        // console.warn(timeName[i] + ':' + window.logInfo[i] + 'ms');
    }
    (new Image()).src = logUrl.load + '?' + logStr;
};

window.onerror = function (msg, url, line, col, error) {

    col = col || (window.event && window.event.errorCharacter) || 0;

    defaults.url = url;
    defaults.line = line;
    defaults.col = col;
    defaults.nowTime = new Date().getTime();

    if (error && error.stack) {
        // 如果浏览器有堆栈信息，直接使用
        defaults.msg = error.stack.toString();

    } else if (arguments.callee) {
        // 尝试通过callee拿堆栈信息
        let ext = [];
        let fn = arguments.callee.caller;
        let floor = 3;
        while (fn && (--floor > 0)) {
            ext.push(fn.toString());
            if (fn === fn.caller) {
                break;
            }
            fn = fn.caller;
        }
        ext = ext.join(',');
        defaults.msg = error.stack.toString();
    }

    ajax({
        url: logUrl.error,
        type: 'post',
        data: defaults
    });
}

function getDevice() {
    const u = navigator.userAgent;

    const type = { // 移动终端浏览器版本信息
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        iPad: u.indexOf('iPad') > -1,
        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
        iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1,
        trident: u.indexOf('Trident') > -1,
        // opera 内核
        presto: u.indexOf('Presto') > -1,
        // 苹果、谷歌内核
        webKit: u.indexOf('AppleWebKit') > -1,
        // 火狐内核
        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
        // 是否为移动终端
        mobile: !!u.match(/AppleWebKit.*Mobile/i) || !!u.match(/xiaomi|redmi|huawei|oppo|vivo|moto|oneplus|smartisan|nubia|meizu|sony|nokia|htc|zte/),
        wechat: u.indexOf('MicroMessenger') > -1,
        webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
    };

    const deviceTypeList = Object.keys(type);
    for (let i = 0; i < deviceTypeList.length; i++) {
        if (type[deviceTypeList[i]]) {
            return deviceTypeList[i];
        }
    }
}

function json2url(json) {
    json.t = Math.random();
    var arr = [];
    for (var name in json) {
        arr.push(name + "=" + encodeURIComponent(json[name]));
    }
    return arr.join("&");
}

function ajax(options) {
    options = options || {};
    if (!options.url) {
        return;
    }
    options.type = options.type || "get";
    options.data = options.data || {};
    options.timeout = options.timeout || 0;

    var xhr = new XMLHttpRequest();

    var str = json2url(options.data);

    if (options.type == "get") {
        xhr.open("get", options.url + "?" + str, true);
        xhr.send();
    } else {
        xhr.open("post", options.url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(str);

    }

    //4 接收
    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4) { //完成
            clearTimeout(timer);
            //成功
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                options.success && options.success(xhr.responseText);
            } else {
                //失败
                options.error && options.error();
            }

        }
    };

    if (options.timeout) {
        var timer = setTimeout(function () {
            xhr.abort();
        }, options.timeout);
    }

}