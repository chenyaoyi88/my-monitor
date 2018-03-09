// var oBtn_addError = document.getElementById('add_error');
// var oBtn_submit = document.getElementById('submit');

// oBtn_addError.onclick = function () {
//     console.log(123);
//     console.log(div);
// };

// oBtn_submit.onclick = function () {
//     console.log(123);
//     console.log(aaa);
// };


// const arr = [18, 18, 19, 21, 18, 20];
// let count = -1;

// let aUploadErrorJs = [];
// let oUploadErrorJs = {};

// oBtn_addError.onclick = function () {

//     count++;

//     let jsErrorInfo = {
//         name: 'cyy',
//         age: arr[count]
//     };

//     if (deepCompare(jsErrorInfo, oUploadErrorJs)) {
//         console.log('没有改变，不用提交');
//         return;
//     }

//     oUploadErrorJs = jsErrorInfo;
//     aUploadErrorJs.push(oUploadErrorJs);

//     console.log(errorInfo);

// };

// oBtn_submit.onclick = function () {

//     if (!aUploadErrorJs.length) return;

//     setTimeout(function () {
//         console.log(errorInfo);
//         aUploadErrorJs = [];
//     }, 100);
// };

// var arr1 = [1, 2, 3, 4];
// var arr2 = [1, 2, 3, 4];

// console.log(deepCompare(arr1, arr2));

// function deepCompare(x, y) {
//     var in1 = x instanceof Object;
//     var in2 = y instanceof Object;
//     if (!in1 || !in2) {
//         return x === y;
//     }
//     if (Object.keys(x).length !== Object.keys(y).length) {
//         return false;
//     }
//     for (var p in x) {
//         var a = x[p] instanceof Object;
//         var b = y[p] instanceof Object;
//         if (a && b) {
//             return deepCompare(x[p], y[p]);
//         } else if (x[p] !== y[p]) {
//             return false;
//         }
//     }

//     return true;
// }

// console.log(div);

const aElements = document.getElementsByTagName('*');

for (let i = 0; i < aElements.length; i++) {
    console.dir(aElements[i])
}


ajax({
    type: 'post',
    url: 'https://www.easy-mock.com/mock/5a3ca07ffb6fe310cf6ab3bf/example_1513922687186/test_post',
    data: {
        name: 'cyy',
        age: 18
    },
    success: function (data) {
        console.warn(data);
    }
});

ajax({
    type: 'get',
    url: 'https://www.easy-mock.com/mock/5a3ca07ffb6fe310cf6ab3bf/example_1513922687186/test_get',
    data: {
        name: 'test',
        age: 18
    },
    success: function (data) {
        console.warn(yyy);
    },
    error: function (err) {
        console.log(err);
    }
});

console.log(div);

function json2url(json) {
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

    // 4 接收
    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4) { //完成
            clearTimeout(timer);
            //成功
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                options.success && options.success(JSON.parse(xhr.responseText));
            } else {
                //失败
                options.error && options.error(xhr.statusText);
            }

        }
    };

    if (options.timeout) {
        var timer = setTimeout(function () {
            xhr.abort();
        }, options.timeout);
    }

}