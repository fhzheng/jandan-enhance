// ==UserScript==
// @name         jandan comment refresh
// @namespace    mtdwss@gmail.com
// @version      0.2.1
// @description  1、添加评论页内刷新按钮；2、显示图片原始大小。
// @author       mtdwss@gmail.com
// @match        http*://jandan.net/pic*
// @match        http*://jandan.net/ooxx*
// @match        http*://jandan.net/duan*
// @match        http*://jandan.net/qa*
// @match        http*://jandan.net/top*
// @match        http*://jandan.net/drawings*
// @match        http*://jandan.net/pond*
// @match        http*://jandan.net/zhoubian*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    if (window.top != window.self) return;

    //执行刷新操作
    document.refreshComment = function (node) {
        node = node.parent().parent('div');
        var c = node.attr('id').split('-')[2];
        node.children('.tucao-hot, .tucao-list, .jandan-tucao-more, .jandan-tucao-close, .tucao-form, #tucao-gg').remove().empty();
        var a = $('<div class="tucao-tmp">数据加载中....biubiubiu....</div>');
        node.append(a);
        $.ajax({
            url: "/tucao/" + c,
            method: "GET",
            data: {_: (new Date()).valueOf()},
            dataType: "json",
            success: function (f) {
                node.children('.tucao-tmp').remove().empty();
                if (f.code != 0) {
                    alert(f.msg);
                    return;
                }
                if (f.hot_tucao.length) {
                    tucao_show_hot(node, f.hot_tucao);
                }
                tucao_show_list(node, f.tucao);
                if (f.has_next_page) {
                    tucao_show_more_btn(node, c);
                }
                tucao_show_close_btn(node, c);
                tucao_show_form(node, c);
            },
            error: function (e) {
                a.html("hmm....something wrong...");
            }
        });
    };

    //添加刷新按钮
    $(document).bind('DOMNodeInserted', function (e) {
        var element = e.target;
        element = $(element);
        if (element.hasClass('tucao-form')) {
            var node = element.parent('div');
            if (node.find('.tucao-refresh').length) return;
            node.prepend('<div class="tucao-refresh" style="text-align: right;"><span style="cursor: pointer;" onclick="refreshComment($(this))">刷新</span></div>');
        }
    });
    
    //添加原图大小
    $('.view_img_link').each(function (idx, val) {
        var view_img_link = $(this).attr('href');
        var _this = $(this);
        GM_xmlhttpRequest({
            method: "HEAD",
            url: 'https:' + view_img_link,
            onload: function (response) {
                var headers = {};
                var headarray = response.responseHeaders.split('\n');
                for (var i in headarray) {
                    var d = headarray[i].split(':');
                    var k = d[0],
                        v = d[1] === undefined ? undefined : d[1].trim();
                    headers[k] = v;
                }
                
                var imgSize = headers['Content-Length'.toLowerCase()];
                imgSize = bytesToSize(imgSize);
                _this.append("<span style='font-weight:700;'> (" + imgSize + ")</span>");
                _this.prop('title', '原图大小：' + imgSize);
                }
        });
    });

    //byte -> KB,MB,GB
    function bytesToSize(bytes) {
        if (bytes < 1024) return bytes + " Bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KB";
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MB";
        else return (bytes / 1073741824).toFixed(3) + " GB";
    }
})();
