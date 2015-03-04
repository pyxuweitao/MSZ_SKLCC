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
    //document.getElementById("department_list").change();
    flush_people_list('s');

};
function flush_people_list() {
    var hs = document.getElementById("department_list").value;
    var jsonhttp = new XMLHttpRequest();
    jsonhttp.onreadystatechange = function () {
        if (jsonhttp.readyState == 4 && jsonhttp.status == 200) {
            var jsonfile = jsonhttp.responseText.toString();
            alert(jsonfile);
            var hs = document.getElementById("people_list");
            hs.innerHTML = '';
            var employees = eval('(' + jsonfile + ')');
            //alert(employees.length);
            for (var i=0;i<employees.length;i++){
                var temp = document.createElement("option");
                temp.innerHTML = employees[i].username;
                temp.value = employees[i].em_number;
                hs.appendChild(temp);
            }
        }
    }
    jsonhttp.open("GET", '/update_pie_chart_people_list/?dept=' + hs, true);
    jsonhttp.send();
}

function flush_info() {
    //ajax here
    var jsonhttp = new XMLHttpRequest();
    jsonhttp.onreadystatechange = function () {
        if (jsonhttp.readyState == 4 && jsonhttp.status == 200) {
            var jsonfile = jsonhttp.responseText.toString();
            alert(jsonfile);
        }
    }

    jsonhttp.open("GET", '/update_pie_chart/?dept='+document.getElementById("department_list").value + '&people='+document.getElementById("people_list").value+'&start_time='+document.getElementById("start_time").value+'&end_time='+document.getElementById("end_time").value, true);
    jsonhttp.send();
    //return;
}

function refresh() {
    start_time = new Date(document.getElementById("start_time").value);
    end_time = new Date(document.getElementById("end_time").value);
    //alert(start_time.getMonth());
    //alert(start_time.getDay());
    //alert(start_time.getDate());
    if (end_time.valueOf() > start_time.valueOf()) {
        flush_info();
    } else {
        //alert('日期选择有误');
    }
}

function append_to_show() {
    if (document.getElementById("mistake_list").value == 'none' || document.getElementById("people_list").value == 'none') {
        alert('选择有误');
    } else {
        var hint = document.getElementById("hint");
        var hs = document.createElement("label");
        hs.setAttribute("class", "label label-primary");
        hs.innerHTML = $("#department_list").find("option:selected").text() + '-' + $("#mistake_list").find("option:selected").text() + '-' + $("#people_list").find("option:selected").text();
        hs.setAttribute("mistake", document.getElementById("mistake_list").value);
        hs.setAttribute("people", document.getElementById("people_list").value);
        hs.setAttribute("department", document.getElementById("department_list").value);
        hs.style.marginLeft = '10px';
        hs.onclick = function () {
            this.parentNode.removeChild(this);
            refresh();
        }
        hint.appendChild(hs);
        document.getElementById("close").click();
    }
}

function make_chart() {

    for (var i = 0; i < labels.length; i++) {
        data.push(
            {name: labels[i], value: values[i], color: '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6)}
        )
    }


    var chart = new iChart.Pie2D({
        render: 'canvasDiv',
        data: data,
        title: {
            text: '疵点构成汇总',
            height: 40,
            fontsize: 30,
            color: '#282828'
        },
        footnote: {
            text: '',
            color: '#486c8f',
            fontsize: 12,
            padding: '0 38'
        },
        sub_option: {
            mini_label_threshold_angle: 40,//迷你label的阀值,单位:角度
            mini_label: {//迷你label配置项
                fontsize: 20,
                fontweight: 600,
                color: '#ffffff'
            },
            label: {
                background_color: null,
                sign: false,//设置禁用label的小图标
                padding: '0 4',
                border: {
                    enable: false,
                    color: '#666666'
                },
                fontsize: 11,
                fontweight: 600,
                color: '#4572a7'
            },
            border: {
                width: 2,
                color: '#ffffff'
            },
            listeners: {
                parseText: function (d, t) {
                    return d.get('value') + "%";//自定义label文本
                }
            }
        },
        legend: {
            enable: true,
            padding: 0,
            offsetx: 120,
            offsety: 50,
            color: '#3e576f',
            fontsize: 20,//文本大小
            sign_size: 20,//小图标大小
            line_height: 28,//设置行高
            sign_space: 10,//小图标与文本间距
            border: false,
            align: 'left',
            background_color: null//透明背景
        },
        shadow: true,
        shadow_blur: 6,
        shadow_color: '#aaaaaa',
        shadow_offsetx: 0,
        shadow_offsety: 0,
        background_color: '#f1f1f1',
        align: 'right',//右对齐
        offsetx: -100,//设置向x轴负方向偏移位置60px
        offset_angle: -90,//逆时针偏移120度
        width: document.getElementById('canvasDiv').parentNode.offsetWidth - 100,
        height: 400,
        radius: 150,
        animation: true,//开启过渡动画
        animation_duration: 600//600ms完成动画
    });
    //利用自定义组件构造右侧说明文本
    chart.plugin(new iChart.Custom({
        drawFn: function () {
            //在右侧的位置，渲染说明文字
            chart.target.textAlign('start')
                .textBaseline('top')
                .textFont('600 20px Verdana')
                .fillText('图例', 120, 80, false, '#be5985', false, 24)
                .textFont('600 12px Verdana')
                .fillText('数据来源:模拟数据', 120, 160, false, '#999999');
        }
    }));
    chart.draw();
}