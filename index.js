ajax({
    type: 'post',
    url: 'https://www.easy-mock.com/mock/5a3ca07ffb6fe310cf6ab3bf/example_1513922687186/test_post',
    data: {
        name: 'cyy',
        age: 18
    },
    success: function (data) {
        console.log(data);
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
        console.log(data);
    }
});

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

    // 4 接收
    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4) { //完成
            clearTimeout(timer);
            //成功
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                options.success && options.success(JSON.parse(xhr.responseText));
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