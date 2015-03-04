selected_flag = false;
coll = ['#62bce9', '#00FF66', '#339999', '#660033', '#990066'];
var flow = [];
var labels = [];
var date = [];
var data_max;
var data_min;
var len = 0;
var start_time;
var end_time;
var list_people = [];
var list_mistake = [];
var lines = [];
var key_user = '<div style="width:260px"><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">1</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">2</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">3</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">4</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">5</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">6</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">7</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">8</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">9</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">0</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">a</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">b</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">c</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">d</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">e</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">f</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">g</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">h</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">i</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">j</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">k</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">l</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">m</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">n</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">o</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">p</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">q</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">r</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">s</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">t</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">u</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">v</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">w</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">x</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">y</button><button type="button" style="width:40px" class="btn btn-default" onclick="return onclickfilterkey(this)">z</button><button type="button" style="width:80px" class="btn btn-default" onclick="return onclickfilterkey(this)">删除</button></div>';
function onclickfilterkey(n){
    if (n.innerHTML.length>1){
        document.getElementById("filter_text").value = document.getElementById("filter_text").value.slice(0,-1);
        document.getElementById("filter_text").focus();
    }else{
        document.getElementById("filter_text").value += n.innerHTML;
        document.getElementById("filter_text").focus();
    }
}
window.onload = function () {
    $("#start_time").datetimepicker({
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        todayHighlight: 'true',
        minView: 2,
        autoclose: true
    }).on('hide', function () {
        //alert('s');
        //refresh();
    });
    //chart();
    $("#end_time").datetimepicker({
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        todayHighlight: 'true',
        minView: 2,
        autoclose: true
    }).on('hide', function () {
        //alert('s');
        //refresh();
    });
    $(".combobox").combobox();
    onchangestyle();
};
function chooseall(input) {
    if (input.checked) {
        var hs = input.parentNode.parentNode.getElementsByTagName("input");
        for (var i = 1; i < hs.length; i++) {
            //hs[i].click();
            hs[i].disabled = true;
        }
    } else {
        var hs = input.parentNode.parentNode.getElementsByTagName("input");
        for (var i = 1; i < hs.length; i++) {
            //hs[i].click();
            hs[i].disabled = true;
        }
    }
}

function flush_info() {
    //ajax here
//    len = Math.floor((end_time.getTime() - start_time.getTime()) / (24 * 3600 * 1000)) + 1;
//    flow = [];
//    lines = document.getElementById("hint").getElementsByTagName("label");
//    for (var i = 0; i < lines.length; i++) {
//        flow.push([]);
//    }
//
//    for (var i = 0; i < lines.length; i++) {
//        for (var j = 0; j < len; j++) {
//            flow[i].push(Math.floor(Math.random() * Math.floor(Math.random() * 1000)));
//        }
//    }//这句话更新了数据源
    var jsonhttp = new XMLHttpRequest();
    jsonhttp.onreadystatechange = function () {
        if (jsonhttp.readyState == 4 && jsonhttp.status == 200) {
            var jsonfile = jsonhttp.responseText.toString();
            //alert(jsonfile);
            flow = [];
            var data = eval('(' + jsonfile + ')');
            for (var i = 0; i < data.length; i++) {
                flow.push(data[i]);

            }
            lines = document.getElementById("hint").getElementsByTagName("label");
            flush_data();
            make_chart();
        }
    }
    var request = 'type=' + document.getElementById("type").value.toString() + '&';
    var to_flush = document.getElementById("hint").getElementsByTagName("label");
    for (var i = 0; i < to_flush.length; i++) {
        request += 'batch=' + to_flush[i].getAttribute("batch") + '&';
    }
    request += '&start=' + document.getElementById("start_time").value + '&end=' + document.getElementById("end_time").value;
    //(request);

    jsonhttp.open("GET", '/update_line_chart/?' + request, true);
    jsonhttp.send();
}

function refresh() {
    start_time = new Date(document.getElementById("start_time").value);
    end_time = new Date(document.getElementById("end_time").value);
    len = parseInt((end_time.valueOf() - start_time.valueOf()) / (24 * 60 * 60 * 1000));
    //alert(len);
    // alert(len);
    //alert(start_time.getMonth());
    //alert(start_time.getDay());
    //alert(start_time.getDate());
    if (end_time.valueOf() > start_time.valueOf()) {
        //alert('s');
        flush_info();

    } else {
        alert('日期选择有误');
    }
}
function flush_data() {
    labels = [];
    date = [];
    //flow = [];

    start_time = new Date(document.getElementById("start_time").value);
    end_time = new Date(document.getElementById("end_time").value);
    //alert(start_time);
    //alert(end_time);
    //  switch (document.getElementById("style_drop_hint").getAttribute('state')) {
    //     case 'day':
    //  alert('day');
    var step = parseInt(len / 32) + 1;
    // alert(step);
    if (step == 1) {
        for (var i = start_time; i.valueOf() <= end_time.valueOf(); i.setDate(i.getDate() + 1)) {
            //alert('p');
            labels.push((i.getMonth() + 1).toString() + '-' + i.getDate().toString());
        }
    } else {
        labels.push((start_time.getMonth() + 1).toString() + '-' + start_time.getDate().toString());
        start_time.setDate(start_time.getDate() + len/4);
        labels.push((start_time.getMonth() + 1).toString() + '-' + start_time.getDate().toString());
        start_time.setDate(start_time.getDate() + len/4);
        labels.push((start_time.getMonth() + 1).toString() + '-' + start_time.getDate().toString());
        start_time.setDate(start_time.getDate() + len/4);
        labels.push((start_time.getMonth() + 1).toString() + '-' + start_time.getDate().toString());
        labels.push((end_time.getMonth() + 1).toString() + '-' + end_time.getDate().toString());
    }

    start_time = new Date(document.getElementById("start_time").value);
    end_time = new Date(document.getElementById("end_time").value);
    for (var i = start_time; i.valueOf() <= end_time.valueOf(); i.setDate(i.getDate() + 1)) {
        //alert('p');
        date.push((i.getMonth() + 1).toString() + '-' + i.getDate().toString());
    }
    var temp = [];
    for (var i = 0; i < lines.length; i++) {
        temp.push(getmax(flow[i]));
    }
    data_max = getmax(temp) + 5;
    data_min = 0;
    // break;
    // }

}
function getmax(arry) {
    var res = arry[0];
    for (var i = 0; i < arry.length; i++) {
        if (arry[i] > res) {
            res = arry[i];
        }
    }
    return res;
}
function append_to_show() {
    if (!(document.getElementById("dept_list").value && document.getElementById("model_list").value && document.getElementById("batch_list").value)) {
        alert('选择有误');
    } else {
        var hint = document.getElementById("hint");
        var hs = document.createElement("label");
        var ii = document.createElement("span");
        ii.setAttribute("class", "CC");
        ii.style.fontWeight = 'bold';
        ii.style.color = "#FF0000";
        ii.innerHTML = ' X';
        hs.setAttribute("class", "label label-primary");
        hs.innerHTML = $("#batch_list").find("option:selected").text() + '-' + $("#dept_list").find("option:selected").text() + '-' + $("#model_list").find("option:selected").text() + ' |';
        hs.setAttribute("dept", document.getElementById("dept_list").value);
        hs.setAttribute("model", document.getElementById("model_list").value);
        hs.setAttribute("batch", document.getElementById("batch_list").value);
        hs.style.marginLeft = '10px';
        ii.setAttribute("data-toggle", "tooltip");
        ii.setAttribute("data-placement", "top");
        ii.setAttribute("data-original-title", "点击以删除这条图线");
        ii.style.cursor = 'pointer';
        ii.onclick = function () {
            this.parentNode.parentNode.removeChild(this.parentNode);
            refresh();
        }
        hs.appendChild(ii);
        hint.appendChild(hs);
        var options = {
            animation: true,
            trigger: 'hover' //触发tooltip的事件
            //html: true
        }
        $('.CC').tooltip(options);
    }
}
function onChangeMistake(input) {
    document.getElementById("mistake_choose_hint").innerHTML = input.innerHTML;
    document.getElementById("mistake_choose_hint").setAttribute("value", input.getAttribute("value"));
    // refresh();
}
function onclickdepart(input) {
    document.getElementById("department_hint").innerHTML = input.innerHTML;
    //refresh();
}
var type = '';

function make_chart() {
    var line;
    var data = [];
    if (document.getElementById("type").value == 1) {
        type = '疵点计数(个)';
    } else if (document.getElementById("type").value == 2) {
        type = '返修率(%)';
    }
    //var line33 = colour[0];
    for (var i = 0; i < lines.length; i++) {
        //var hs = document.getElementsByTagName("color")[0].innerHTML;
        //alert(hs);
        data.push({
            name: lines[i].getAttribute("batch") + '-' + lines[i].getAttribute("dept"),
            value: flow[i],
            color: '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6),
            line_width: 2
        });
    }
    //alert('s');
    line = new iChart.LineBasic2D({
        render: 'canvasDiv',
        data: data,
        align: 'center',
        title: '疵点走势图',
        subtitle: '时间跨度:' + document.getElementById("start_time").value + '~' + document.getElementById("end_time").value,
        //footnote: '数据来源：模拟数据',
        width: document.getElementById('canvasDiv').parentNode.offsetWidth - 50,
        height: 500,
        animation: true,//开启过渡动画
        animation_duration: 600,//600ms完成动画
        sub_option: {
            smooth: true,//平滑曲线
            point_size: 10,
            hoolw: false,
            label: false

        },
        tip: {
            enable: true,
            shadow: true,
            listeners: {
                //tip:提示框对象、name:数据名称、value:数据值、text:当前文本、i:数据点的索引
                parseText: function (tip, name, value, text, i) {
                    //var hs = date[i].getMonth().toString();
                    return "<span style='color:#005268;font-size:12px;'>" + date[i] + ":" + value + "</span>";
                }
            }
        },
        legend: {
            enable: true,
            row: 1,//设置在一行上显示，与column配合使用
            column: 'max',
            valign: 'top',
            sign: 'bar',
            background_color: null,//设置透明背景
            offsetx: -80,//设置x轴偏移，满足位置需要
            border: true
        },
        crosshair: {
            enable: true,
            line_color: '#62bce9'
        },

        coordinate: {
            width: document.getElementById('canvasDiv').parentNode.offsetWidth - 200,
            valid_width: document.getElementById('canvasDiv').parentNode.offsetWidth - 300,
            height: 300,
            axis: {
                color: '#9f9f9f',
                width: [0, 0, 2, 2]
            },
            grids: {
                vertical: {
                    way: 'share_alike',
                    value: 12
                }
            },
            scale: [
                {
                    position: 'left',
                    start_scale: data_min,
                    end_scale: data_max,
                    scale_space: Math.floor((data_max - data_min) / 20) + 2,
                    scale_size: 2,
                    scale_color: '#9f9f9f'
                },
                {
                    position: 'bottom',
                    labels: labels
                }
            ]
        }

    });
    line.plugin(new iChart.Custom({
        drawFn: function () {
            //计算位置
            var coo = line.getCoordinate(),
                x = coo.get('originx'),
                y = coo.get('originy'),
                w = coo.width,
                h = coo.height;
            //在左上侧的位置，渲染一个单位的文字
            line.target.textAlign('start')
                .textBaseline('bottom')
                .textFont('600 11px 微软雅黑')
                .fillText(type, x - 40, y - 12, false, '#9d987a')
                .textBaseline('top')
                .fillText('(时间)', x + w + 12, y + h + 10, false, '#9d987a');

        }
    }))
    //开始画图
    line.draw();
}

function onchangestyle() {
    if (document.getElementById("model_list").value == '') {
        return;
    }
    var jsonhttp = new XMLHttpRequest();
    jsonhttp.onreadystatechange = function () {
        if (jsonhttp.readyState == 4 && jsonhttp.status == 200) {
            var jsonfile = jsonhttp.responseText.toString();
            //alert(jsonfile);
            var hs = eval('(' + jsonfile + ')');

            var ss = document.getElementById("dept_list");
            ss.innerHTML = '';
            for (var i = 0; i < hs.length; i++) {
                var temp = document.createElement("option");
                temp.value = temp.innerHTML = hs[i].department;
                ss.appendChild(temp);
            }
            onchangedept();
        }
    }
    jsonhttp.open("GET", '/update_line_chart_dept/?model=' + document.getElementById("model_list").value, true);
    jsonhttp.send();
}

function onchangedept() {
    var jsonhttp = new XMLHttpRequest();
    jsonhttp.onreadystatechange = function () {
        if (jsonhttp.readyState == 4 && jsonhttp.status == 200) {
            var jsonfile = jsonhttp.responseText.toString();
            var hs = eval('(' + jsonfile + ')');

            var ss = document.getElementById("batch_list");
            ss.innerHTML = '';
            for (var i = 0; i < hs.length; i++) {
                var temp = document.createElement("option");
                temp.value = temp.innerHTML = hs[i].batch;
                ss.appendChild(temp);
            }
        }
    }
    jsonhttp.open("GET", '/update_line_chart_batch/?dept=' + document.getElementById("dept_list").value + '&model=' + document.getElementById("model_list").value, true);
    jsonhttp.send();
}