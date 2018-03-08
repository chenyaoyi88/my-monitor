var oBtn_addError = document.getElementById('add_error');
var oBtn_submit = document.getElementById('submit');

let upload = {
    js: [],
    res: []
};

let aJs = [];

let oldUpload = {};

oBtn_addError.onclick = function () {

    let json = {
        name: 'cyy',
        age: 18
    };

    aJs.push(json);
    console.log('aJs', aJs);
};

oBtn_submit.onclick = function () {
    if (deepCompare(aJs, upload.js)) {
        console.log('没有改变，不用提交');
        return;
    }
    upload.js = aJs;
    console.log('upload.js', upload.js);
    console.log('aJs', aJs);

    upload.js = [];
    aJs = [];
};

var arr1 = [1, 2, 3, 4];
var arr2 = [1, 2, 3, 4];

console.log(deepCompare(arr1, arr2));

function deepCompare(x, y) {
    var in1 = x instanceof Object;
    var in2 = y instanceof Object;
    if (!in1 || !in2) {
        return x === y;
    }
    if (Object.keys(x).length !== Object.keys(y).length) {
        return false;
    }
    for (var p in x) {
        var a = x[p] instanceof Object;
        var b = y[p] instanceof Object;
        if (a && b) {
            return deepCompare(x[p], y[p]);
        } else if (x[p] !== y[p]) {
            return false;
        }
    }

    return true;
}

// console.log(div);

// ajax({
//     type: 'post',
//     url: 'https://www.easy-mock.com/mock/5a3ca07ffb6fe310cf6ab3bf/example_1513922687186/test_post',
//     data: {
//         name: 'cyy',
//         age: 18
//     },
//     success: function (data) {
//         console.warn(data);
//     }
// });

// ajax({
//     type: 'get',
//     url: 'https://www.easy-mock.com/mock/5a3ca07ffb6fe310cf6ab3bf/example_1513922687186/test_get',
//     data: {
//         name: 'test',
//         age: 18
//     },
//     success: function (data) {
//         console.warn(data);
//     }
// });

// console.log(div);

// function json2url(json) {
//     var arr = [];
//     for (var name in json) {
//         arr.push(name + "=" + encodeURIComponent(json[name]));
//     }
//     return arr.join("&");
// }

// function ajax(options) {
//     options = options || {};
//     if (!options.url) {
//         return;
//     }
//     options.type = options.type || "get";
//     options.data = options.data || {};
//     options.timeout = options.timeout || 0;

//     var xhr = new XMLHttpRequest();

//     var str = json2url(options.data);

//     if (options.type == "get") {
//         xhr.open("get", options.url + "?" + str, true);
//         xhr.send();
//     } else {
//         xhr.open("post", options.url, true);
//         xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//         xhr.send(str);
//     }

//     // 4 接收
//     xhr.onreadystatechange = function () {

//         if (xhr.readyState == 4) { //完成
//             clearTimeout(timer);
//             //成功
//             if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
//                 options.success && options.success(JSON.parse(xhr.responseText));
//             } else {
//                 //失败
//                 options.error && options.error();
//             }

//         }
//     };

//     if (options.timeout) {
//         var timer = setTimeout(function () {
//             xhr.abort();
//         }, options.timeout);
//     }

// }