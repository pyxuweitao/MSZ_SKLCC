var data = [];
var label = [];
var flow = [];
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
        hs.setAttribute("data-toggle", "tooltip");
        hs.setAttribute("data-placement", "top");
        hs.setAttribute("data-original-title", "点击以删除这条图线");
        hs.style.marginLeft = '10px';
        hs.onclick = function () {
            this.parentNode.removeChild(this);
            refresh();
        }
        hint.appendChild(hs);
        //document.getElementById("close").click();
    }
    var options = {
        animation: true,
        trigger: 'hover' //触发tooltip的事件
        //html: true
    }
    $('.label').tooltip(options);
}

function flush_info() {
    label = [];
    if (document.getElementById("style_hint").value == "month") {
        //alert('month');
        label = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    } else if (document.getElementById("style_hint").value == "season") {
        label = ["第一季度", "第二季度", "第三季度", "第四季度"];
    } else if (document.getElementById("style_hint").value == "year") {
        label = ['2012', '2013', '2014'];
    }

}
function refresh() {
    flush_info();
    make_chart();
}
function make_chart() {
    data = [];
    flow = [];
    var hs = document.getElementById("hint").getElementsByTagName("label");
    for (var i = 0; i < hs.length; i++) {
        flow.push([]);
        for (var j = 0; j < label.length; j++) {
            flow[i].push(Math.floor(Math.random() * Math.floor(Math.random() * 100)) + 3);
        }
    }
    for (var i = 0; i < hs.length; i++) {
        data.push({
            name: hs[i].innerHTML,
            color: '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6),
            value: flow[i]
        });
    }
//    data = [{
//        name:'sss',
//        color:  '#c56966',
//        data: [1,2]
//    }]
    var chart = new iChart.ColumnMulti2D({

        render: 'canvasDiv',
        data: data,
        labels: label,
        title: '数据总览表',
        subtitle: '',
        footnote: '数据来源：模拟数据',
        width: document.getElementById('canvasDiv').parentNode.offsetWidth - 50,
        height: 500,
        animation: true,//开启过渡动画
        animation_duration: 800,//800ms完成动画
        background_color: '#ffffff',
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
        coordinate: {
            background_color: '#f1f1f1',
            width: document.getElementById('canvasDiv').parentNode.offsetWidth + 1000,
            valid_width: document.getElementById('canvasDiv').parentNode.offsetWidth - 100,
            scale: [
                {
                    position: 'left',
                    start_scale: 0,
                    end_scale: 140,
                    scale_space: 20
                }
            ],
            width: 600,
            height: 260
        }
    });
    chart.draw();
}