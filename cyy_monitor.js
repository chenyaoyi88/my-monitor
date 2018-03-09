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
        // console.log('open', arguments);
        return open.apply(this, arguments);
    }

    function sendReplacement() {
        // 获取 send 参数
        // console.log('send', arguments);
        return send.apply(this, arguments);
    }

    window.XMLHttpRequest.prototype.open = openReplacement;
    window.XMLHttpRequest.prototype.send = sendReplacement;
    window.XMLHttpRequest = newXHR;

})();

let logUploadHost = '';

if (/((http(s)?:\/\/)?\d+\.\d+\.\d+\.\d+)|(localhost)(:\d+(\/)?)/ig.test(window.location.host)) {
    logUploadHost = '//10.2.10.227:8300';
} else {
    logUploadHost = '//' + window.location.host;
}

const logUploadUrl = {
    // 加载信息
    load: logUploadHost + '/msg_load',
    // 错误信息
    error: logUploadHost + '/msg_error',
    // 请求信息
    http: logUploadHost + '/msg_http'
}

let timer = null;

// 页面加载信息
let pageLoadInfo = {
    // 设备类型
    device: '',
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

// http 请求信息
let httpInfo = {
    // 请求
    req: [],
    // 响应
    res: []
};

// 错误信息
let errorInfo = {
    // js错误
    js: [],
    // 资源错误
    res: [],
    // http
    http: []
};

// 页面初始化
pageLoadInfo.openTime = performance.timing.navigationStart;
// 页面白屏时间
pageLoadInfo.whiteScreenTime = +new Date() - pageLoadInfo.openTime;
// 设备类型
pageLoadInfo.device = getDevice();

// 页面加载
document.addEventListener('DOMContentLoaded', function (event) {
    pageLoadInfo.readyTime = +new Date() - pageLoadInfo.openTime;
});

// 资源加载错误 css js img
document.addEventListener('error', function (ev) {
    const oEvent = ev || event;
    const oTarget = oEvent.srcElement || oEvent.target;
    const path = oTarget.src || oTarget.href;
    const resLoadErrorInfo = {
        path: path,
        nowTime: +new Date()
    };

    for (let item of errorInfo.res) {
        if (item.path === resLoadErrorInfo.path) {
            return;
        }
    }
    errorInfo.res.push(resLoadErrorInfo);

}, true);

// 页面加载完成提交加载数据
window.onload = function () {
    pageLoadInfo.allloadTime = +new Date() - pageLoadInfo.openTime;
    pageLoadInfo.nowTime = +new Date();

    requsetData({
        url: logUploadUrl.load,
        data: pageLoadInfo
    });
};

window.onerror = function (msg, url, line, col, error) {

    col = col || (window.event && window.event.errorCharacter) || 0;

    let jsErrorInfo = {
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

    jsErrorInfo.url = url;
    jsErrorInfo.line = line;
    jsErrorInfo.col = col;
    jsErrorInfo.nowTime = new Date().getTime();

    if (error && error.stack) {
        // 如果浏览器有堆栈信息，直接使用
        jsErrorInfo.msg = error.stack.toString();
    } else if (arguments.callee) {
        // 尝试通过callee拿堆栈信息
        let ext = [];
        let fn = arguments.callee.caller;
        // 这里只拿三层堆栈信息
        let floor = 3;
        while (fn && (--floor > 0)) {
            ext.push(fn.toString());
            if (fn === fn.caller) {
                // 如果有环
                break;
            }
            fn = fn.caller;
        }
        ext = ext.join(',');
        // 合并上报的数据，包括默认上报的数据和自定义上报的数据
        jsErrorInfo.msg = error.stack.toString();
    }

    for (let item of errorInfo.js) {
        if (item.col === jsErrorInfo.col && item.line === jsErrorInfo.line) {
            return;
        }
    }
    errorInfo.js.push(jsErrorInfo);
}

// 监听 ajax 请求
window.addEventListener('ajaxReadyStateChange', function (e) {
    var xhr = e.detail;

    if (xhr.readyState == 4) {
        let responseJson = {};
        // 完成
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
            if (xhr.responseType === '' || xhr.responseType === 'text') {
                if (xhr.responseURL.indexOf(logUploadHost) === -1) {
                    const timing = window.performance.timing;
                    responseJson = {
                        requestStart: timing.requestStart,
                        responseStart: timing.responseStart,
                        responseEnd: timing.responseEnd,
                        responseText: xhr.responseText,
                        responseURL: xhr.responseURL,
                        status: xhr.status
                    };
                    httpInfo.res.push(responseJson);
                }
            }
        } else {
            const timing = window.performance.timing;
            responseJson = {
                requestStart: timing.requestStart,
                responseStart: timing.responseStart,
                responseEnd: timing.responseEnd,
                responseURL: xhr.responseURL,
                status: xhr.status,
                statusText: xhr.statusText,
            };
            errorInfo.http.push(responseJson);
        }
    }

});

// 移动端关闭窗口响应（PC 端 chrome 暂时无法监听）
window.addEventListener('pagehide', function (event) {
    uploadErrorJsRes();
});

// 每 20 秒上传一次
clearInterval(timer);
timer = setInterval(function () {
    // 上传错误 js 和 res 的错误
    uploadErrorJsRes();
    // 上传请求信息
    uploadHttpInfo();
}, 1000 * 20);

function uploadHttpInfo() {
    if (!httpInfo.req.length && !httpInfo.res.length) {
        return;
    }
    requsetData({
        url: logUploadUrl.http,
        data: httpInfo,
        success: function () {
            httpInfo.req = httpInfo.res = [];
        }
    });
}

function uploadErrorJsRes() {
    if (!errorInfo.js.length && !errorInfo.res.length && !errorInfo.http.length) {
        return;
    }
    requsetData({
        url: logUploadUrl.error,
        data: errorInfo,
        success: function () {
            errorInfo.js = errorInfo.res = errorInfo.http = [];
        }
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

function requsetData(options) {
    options = options || {};
    if (!options.url) {
        return;
    }
    options.data = options.data || {};
    options.timeout = options.timeout || 0;

    var xhr = new XMLHttpRequest();

    xhr.open('POST', options.url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(options.data));

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