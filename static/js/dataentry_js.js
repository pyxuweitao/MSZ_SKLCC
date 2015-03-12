function size_confirm() {
    var has_sized = false;
    $('#partion_input td.record').each(function () {
        if ($.trim(this.innerHTML) != '') {
            has_sized = true;
        }
    });
    if (has_sized) {
        $('#size_modal').modal('hide');
    } else {
        alert('请测量完尺寸后填写疵点');
    }
}
window.onload = function () {
    number = document.getElementById('scan_input');
    $('#size_modal').modal({
        backdrop: false,
        show: false
    }).on('hide.bs.modal', function () {
        document.getElementById("explorer_content").appendChild(document.getElementById('partion_input'));
    });
    $(change_input).popover({
        animation: true,
        content: key_pass,
        trigger: 'manual',
        html: true,
        placement: 'bottom'
    });
    var options = {
        animation: true,
        trigger: 'hover', //触发tooltip的事件
        html: true
    };
    $('.btn').tooltip(options);
    $('.menu').tooltip(options);
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    bind_size_cells();

    initiallize();
    try {
        if (window.location.hash.split('#')[1].length > 1) {
            document.getElementById('scan_input').value = window.location.hash.split('#')[1];
            document.getElementById('scan_in').click();
        }
    } catch (e) {

    }
    Messenger.options = {
        extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
        theme: 'flat'
    };
    // $('#commit_button').hover(function(){
    //     console.log('-----');
    //     this.style.border = '2px solid #7db500';
    //     this.getElementsByTagName('span')[0].style.color = '#7db500';
    // }).mouseleave(function(){
    //     this.style.border = '2px solid #ccc';
    //     this.getElementsByTagName('span')[0].style.color = '#333';
    // })
};
//window.onbeforeunload = function () {
//    if (state_no == '1' || state_no == '2') {
//        submit();
//    }
//    //   return "确定离开页面吗？";
//
//};
var change_input = document.createElement("input");
change_input.id = 'change_input';
change_input.style.width = '80%';
var change_is_shown = false;
var key_pass = '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">1</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">2</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">3</button>';
key_pass += '<br/>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">4</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">5</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">6</button>';
key_pass += '<br/>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">7</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">8</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">9</button>';
key_pass += '<br/>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">0</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width: 40px;" onclick = "return onclickpano(this)">.</button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;height:34px;" onclick = "return onclickpadel()"><span class="glyphicon glyphicon-arrow-left"></span></button><BR/>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;width:140px;" onclick="return onclickfin()"><span class="glyphicon glyphicon-ok"></span></button>';

function onclickpano(n) {
    document.getElementById('change_input').value = document.getElementById('change_input').value + $.trim(n.innerHTML);
    document.getElementById('change_input').focus();
}

function onclickpadel(n) {
    document.getElementById('change_input').value = document.getElementById('change_input').value.slice(0, -1);
    document.getElementById('change_input').focus();
}

function onclickfin() {
    if (parseFloat(document.getElementById('change_input').value) || parseFloat(document.getElementById('change_input').value) <= 1e-6) {
        document.getElementById('change_input').parentNode.innerHTML = parseFloat(document.getElementById('change_input').value);
        change_is_shown = false;
    }
}

function bind_size_cells() {
    $('#partion_input td.record').click(function (e) {
        //console.log(e.target);
        if (e.target.getAttribute('isrecord') == '1' && !change_is_shown) {
            var value_temp = this.innerHTML;
            this.innerHTML = '';
            change_input.value = value_temp;
            this.appendChild(change_input);
            change_input.focus();
            $(change_input).popover('show');
            change_is_shown = true;
        }
    }).each(function () {
        this.style.width = '60px';
        this.style.height = '45px';
    });
}
var xmlfile = '';
var to_append_mistake = ['-1', ''];
var to_append_program = ['-1', '', '', ''];
var code_length = 10;

var res_mistake_no = [];
var res_program_no = [];
var res_count = [];
var res_employee = [];
var res_mistake_name = [];
var res_program_name = [];
var res_employeeno = [];
var state_no = '';

var search_employee_input = document.createElement('input');
search_employee_input.id = 'search_employee_input';
search_employee_input.style.width = '60px';
search_employee_input.placeholder = '工号';
search_employee_input.onfocus = function () {
    number = this;
};

function initiallize() {
    search_employee_input.value = '';
    $('.btn').mouseout();
    state_no = '';
    // $("number").value = '1';
    var buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
    var scan_input = document.getElementById("scan_input");
    scan_input.value = "";
    scan_input.disabled = false;
    scan_input.focus();

    var tabs = document.getElementById("explorer_content").getElementsByTagName("div");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].innerHTML = '';
    }
    //iframe = document.createElement('iframe');
    //iframe.src = '/measure_in/?batch='+xmlDoc.getElementsByTagName('scan_id')[0].firstChild.nodeValue+'&size='+xmlDoc.getElementsByTagName('scan_model')[0].firstChild.nodeValue;
    //iframe.style.border = 'none';
    //iframe.style.width = '99%';
    //iframe.style.height = '455px';
    //iframe.style.overflow = 'auto';
    //tabs[8].appendChild(iframe);
    var ex = document.getElementById("explorer_index");
    var cata = ex.getElementsByTagName("li");
    var link = cata[1].getElementsByTagName("a");
    link[0].click();
    link = cata[2].getElementsByTagName("a");
    link[0].click();
    var id1 = document.getElementById("scan_id");
    id1.innerHTML = '';
    id1 = document.getElementById("scan_count");
    id1.innerHTML = '';
    id1 = document.getElementById("scan_group");
    id1.innerHTML = '';
    id1 = document.getElementById("scan_total_number");
    id1.innerHTML = '';
    id1 = document.getElementById("scan_package_id");
    id1.innerHTML = '';
    id1 = document.getElementById("scan_model");
    id1.innerHTML = '';
    to_append_mistake = ['-1', ''];
    to_append_program = ['-1', '', ''];

    document.getElementById("status").innerHTML = '<thead> <tr> <td>序号</td>  <td>工序</td>  <td>责任人</td>  <td>疵点</td>  <td>数量</td> </tr> </thead>  <tbody></tbody> </xml>';
    res_mistake_no = [];
    res_program_no = [];
    res_count = [];
    res_employee = [];
    res_mistake_name = [];
    res_program_name = [];
    res_employeeno = [];

    document.getElementById("hint_mistake").innerHTML = '';
    document.getElementById("hint_program").innerHTML = '';
    document.getElementById("hint_employee").innerHTML = '';
    document.getElementById("scan_input").focus();
}

function bind_to_size() {
    document.getElementById('explorer_index').getElementsByTagName('a')[8].click();
    $('#explorer_index a').each(function () {
        this.disabled = true;
    });
}

function flush_info() {
    /*
     var xmlhttp = new XMLHttpRequest();
     xmlhttp.onload = function() {
     if (xmlhttp.status == 200) {
     clearTimeout(x);
     xmlfile = xmlhttp.responseText.toString().replace(new RegExp('unknown', 'gm'), '未知');
     build_page(xmlfile);
     } else {
     clearTimeout(x);
     alert("服务器出现错误，请记录条码及时联系管理员，谢谢。");
     initiallize();
     }
     };
     var hs = document.getElementById("scan_input");
     $("#number").value = 1;
     x = setTimeout('alert("服务器没有响应，请过5分钟再次尝试，如果频繁出现请联系管理员");initiallize();', 100000);
     xmlhttp.open("GET", '/update_info/' + '?code=' + hs.value + '&href=' + Math.random() * 1000000, true);
     xmlhttp.send();
     */
    $.ajax({
        url: '/update_info/' + '?code=' + document.getElementById("scan_input").value,
        success: function (e) {
            xmlfile = e.toString().replace(new RegExp('unknown', 'gm'), '未知');
            build_page(xmlfile);
            $("a[href='#mistake_2'").parent().hide();
            $("#program_1 button").each(function(){
                if ($.trim(this.innerHTML) == '半检' ){
                    $(this).attr("class"," button button-rounded button-flat-caution button-tiny");
                }
            });
        },
        timeout: 15000,
        error: function (err,info) {
            if (info == "timeout"){
                Messenger().post({
                    message: "网络状况不良，请重试",
                    hideAfter: 3,
                    hideOnNavigate: true
                });
            }else{
                Messenger().post({
                    message: "服务器出错，请点击刷新按钮刷新页面",
                    hideAfter: 3,
                    hideOnNavigate: true
                });
            }
            initiallize();
        },
        cache: false
    });
}

function change_user(account) {
    var xml = new XMLHttpRequest();
    xml.open('GET', '/logout/?username=' + account + '&no_redirect=True', false);
    xml.onreadystatechange = function () {
        if (xml.readyState == 4 && xml.status == 200) {
            xml2 = new XMLHttpRequest();
            xml2.onreadystatechange = function () {
                if (xml2.readyState == 4 && xml2.status == 200 && xml2.responseText == "") {
                    window.location.reload(0);
                }else if (xml2.readyState == 4 && xml2.status == 200 && xml2.responseText == "notfound"){
                    alert("工号不存在,请重新登录");
                    window.location.href = '/login/';
                }else if (xml2.readyState == 4 && xml2.status == 200 && xml2.responseText == "superuser"){
                    alert("管理员无法扫码登录,请重新登录");
                    window.location.href = '/login/';
                }
            };
            xml2.open('GET', '/submit_id/?username=' + account, false);
            xml2.send();
        }
    };
    xml.send();
}

function style_measure_illeagl() {
    //console.log(document.getElementById('partion_input'));
    if (!document.getElementById('partion_input').getElementsByTagName('table')[0]) {
        return true;
    }
    var tds = document.getElementById('partion_input').getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('td');
    for (var i = 0; i < tds.length; i++) {
        if ($.trim(tds[i].innerHTML) == '') {
            return false;
        }
    }
    return true;
}

function flush_style_measure(xmlDoc) {
    var table = document.createElement('table');
    table.setAttribute('class', 'table table-bordered');
    table.style.border = 'none';
    table.style.width = '100px';
    table.innerHTML = '<thead><tr><th style="min-width: 120px;;border:#ddd 1px solid">工序</th><th style="min-width: 120px;max-width:120px;border:#ddd 1px solid">标准尺寸</th><th style="min-width: 120px;max-width:120px;border:#ddd 1px solid">公差</th><th style="max-width:120px;border:#ddd 1px solid;min-width: 120px;">对称误差</th><th style="border:none"><a style="cursor:pointer" id="measure_partition_add_col_button"> <span class="glyphicon glyphicon-plus-sign"> </span></a></th></tr></thead>';
    var str = xmlDoc.getElementsByTagName('measure');
    if (str.length == 0) {
        return;
    }
    var tbody = document.createElement('tbody');
    for (var i = 0; i < str.length; i++) {
        var tr = document.createElement('tr');
        var td0 = document.createElement('td');
        td0.style.position = 'absolute';
        td0.style.width = '120px';
        td0.style.height = '45px';
        td0.innerHTML = str[i].getAttribute('partition');
        td0.style.backgroundColor = 'rgba(238, 238, 238, 0.8)';
        var td1 = document.createElement('td');
        td1.innerHTML = str[i].getAttribute('measure_res');
        var td2 = document.createElement('td');
        td2.innerHTML = str[i].getAttribute('common_difference');
        var td3 = document.createElement('td');
        td3.innerHTML = str[i].getAttribute('symmetry');
        tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbody.appendChild(tr);
        table.appendChild(tbody);

    }
    var btn = document.createElement('button');
    btn.setAttribute('class', 'btn btn-success');
    btn.innerHTML = '尺寸测量完毕，开始录入疵点';
    btn.onclick = function () {
        if (style_measure_illeagl()) {
            return activate();
        } else {
            alert('有数据不明确');
            return null;
        }
    };
    document.getElementById('partion_input').appendChild(table);
    document.getElementById('partion_input').appendChild(btn);
    $('#measure_partition_add_col_button').tooltip({
        animation: true,
        html: true,
        title: '<label style="font-size:20px">点击添加一条测量记录</label>'
    }).click(function () {
        var rows = table.getElementsByTagName('tr');
        var th = document.createElement('th');
        th.style.border = '#ddd 1px solid';
        th.innerHTML = '<span>' + (rows[0].getElementsByTagName('th').length - 4) + '</span>';
        th.style.minWidth = '120px';
        th.colSpan = 2;
        var del_col = document.createElement('a');
        del_col.style.cursor = 'pointer';
        del_col.innerHTML = '<span class="glyphicon glyphicon-minus-sign"> </span>';
        del_col.style.marginLeft = '20px';
        del_col.setAttribute('class', 'del_col_a');
        th.appendChild(del_col);
        rows[0].insertBefore(th, this.parentNode);
        for (var i = 1; i < rows.length; i++) {
            var is_double = false;
            if (parseFloat(rows[i].getElementsByTagName('td')[3].innerHTML) >= 1e-6) {
                is_double = true;
            }
            var td0 = document.createElement('td');
            var td1 = document.createElement('td');
            td0.setAttribute('isrecord', 1);
            td1.setAttribute('isrecord', 1);
            td0.setAttribute('class', 'record');
            td1.setAttribute('class', 'record');
            if (is_double) {
                rows[i].appendChild(td0);
                rows[i].appendChild(td1);
            } else {
                td0.colSpan = 2;
                rows[i].appendChild(td0);
            }
        }
        bind_size_cells(true);
        $(del_col).tooltip({
            html: true,
            title: '<label style="font-size:20px">点击删除本次测量记录</label>',
            animation: true
        }).click(function () {
            var hh = this.parentNode.parentNode;
            var index = parseInt(this.parentNode.innerText);
            var rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            if (hh.getElementsByTagName('th').length <= 6) {
                alert('至少要填写一条记录！');
                return;
            }
            for (var i = 0; i < rows.length; i++) {
                console.log(rows[i]);
                if (parseFloat(rows[i].getElementsByTagName('td')[3].innerHTML) >= 1e-6) {
                    var tar_index = (index - 1) * 2 + 4;
                    console.log(tar_index);
                    rows[i].removeChild(rows[i].getElementsByTagName('td')[tar_index]);
                    rows[i].removeChild(rows[i].getElementsByTagName('td')[tar_index]);
                } else {
                    rows[i].removeChild(rows[i].getElementsByTagName('td')[index + 3]);
                }
            }
            this.parentNode.parentNode.removeChild(this.parentNode);
            var headers = hh.getElementsByTagName('th');
            //console.log(hh);
            for (var i = 4; i < headers.length - 1; i++) {
                //var temp_node = del_col.cloneNode(true);
                headers[i].getElementsByTagName('span')[0].innerHTML = (i - 3);

            }

        });
    });
    var ts = table.getElementsByTagName('td');
    console.log(ts);
    for (var i = 0; i < ts.length; i++) {
        ts[i].style.minHeight = '45px';
    }
    document.getElementById('measure_partition_add_col_button').click();
}

function activate() {
    $('#explorer_index a').each(function () {
        this.disabled = false;
    });
    var buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false;
    }
    document.getElementById("explorer_index").getElementsByTagName("a")[1].click();
}

function flush_style_measure_history(xmlDoc) {
    var res = xmlDoc.getElementsByTagName('Merecord');
    if (res.length == 0) {
        return;
    }
    var len = res[0].getElementsByTagName('data').length;
    if (len == 0) {
        return;
    }
    for (var i = 1; i < len; i++) {
        document.getElementById('measure_partition_add_col_button').click();
    }
    var part_map = [];
    var rows = document.getElementById('partion_input').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        part_map.push({
            index: i,
            name: $.trim(rows[i].getElementsByTagName('td')[0].innerHTML)
        });
    }
    for (var i = 0; i < res.length; i++) {
        var index_temp = null;
        var temp_data = res[i].getElementsByTagName('data');
        for (var j = 0; j < part_map.length; j++) {
            if (part_map[j].name == $.trim(res[i].getAttribute('partition'))) {
                index_temp = part_map[j].index;
                break;
            }
        }
        console.log(index_temp);
        for (var j = 0; j < temp_data.length; j++) {
            var datas = temp_data[j].getAttribute('value').split(',');
            if (datas.length == 2) {
                console.log('the length is 2');
                var v1 = parseFloat(datas[0]).toFixed(2);
                var v2 = parseFloat(datas[1]).toFixed(2);
                rows[index_temp].getElementsByTagName('td')[4 + j * 2].innerHTML = v1;
                rows[index_temp].getElementsByTagName('td')[4 + j * 2 + 1].innerHTML = v2;
            } else {
                console.log('the length is 1');
                var v = parseFloat(datas[0]).toFixed(2);
                rows[index_temp].getElementsByTagName('td')[4 + j].innerHTML = v;
            }
        }
    }
}
function build_page(info) {
    console.log(info);
    var domParser = new DOMParser();
    var xmlDoc = domParser.parseFromString(info, 'text/xml');
    var state = xmlDoc.getElementsByTagName("state");
    state_no = state[0].getAttribute("value");
    //alert(state[0].getAttribute("value"));
    if (state[0].getAttribute("value") == '0') {
        alert('条码错误，请重扫');
        initiallize();
        return;
    } else if (state[0].getAttribute("value") == '4') {
        alert('没有权限录入此条码');
        initiallize();
        return;
    } else if (state[0].getAttribute("value") == '1') {
        var tabs = document.getElementById("explorer_content").getElementsByTagName("div");
        // for (var i = 0; i < tabs.length; i++) {
        // tabs[i].innerHTML = '';
        // }
        iframe = document.createElement('iframe');
        iframe.src = '/measure_in/?batch='+xmlDoc.getElementsByTagName('scan_id')[0].firstChild.nodeValue+'&size='+xmlDoc.getElementsByTagName('scan_model')[0].firstChild.nodeValue;
        iframe.style.border = 'none';
        iframe.style.width = '99%';
        iframe.style.height = '455px';
        tabs[8].appendChild(iframe);
        iframe.onload = function () {
            flush_state_info(xmlDoc);
        };
        activate();
        flush_catalog_mistake(xmlDoc);
        flush_catalog_program(xmlDoc);
        console.log(xmlDoc.getElementsByTagName('measure'));
    } else if (state[0].getAttribute("value") == '3') {
        alert('已提交，暂时无法编辑');
        initiallize();
        return;
    } else if (state[0].getAttribute("value") == '6') {
        alert('本条码已经被其他人扫描');
        initiallize();
        return;
    } else if (state[0].getAttribute("value") == '2') {
        var tabs = document.getElementById("explorer_content").getElementsByTagName("div");
        // for (var i = 0; i < tabs.length; i++) {
        // tabs[i].innerHTML = '';
        // }
        iframe = document.createElement('iframe');
        iframe.src = '/measure_in/?batch='+xmlDoc.getElementsByTagName('scan_id')[0].firstChild.nodeValue+'&size='+xmlDoc.getElementsByTagName('scan_model')[0].firstChild.nodeValue;
        iframe.style.border = 'none';
        iframe.style.width = '99%';
        iframe.style.height = '455px';
        tabs[8].appendChild(iframe);

        alert('条码已扫描过，进入继续编辑');
        iframe.onload = function () {
            flush_state_info(xmlDoc);
        }
        //flush_state_info(xmlDoc);
        flush_catalog_mistake(xmlDoc);
        flush_catalog_program(xmlDoc);
        //flush_style_measure(xmlDoc);
        //flush_style_measure_history(xmlDoc);
        activate();
        var record = xmlDoc.getElementsByTagName("Record");
        for (var i = 0; i < record.length; i++) {
            res_count[i] = record[i].getAttribute("number");
            res_employee[i] = record[i].getAttribute("employee");
            res_mistake_name[i] = record[i].getAttribute("question");
            res_program_name[i] = record[i].getAttribute("workname");
            res_program_no[i] = record[i].getAttribute("workno");
            res_mistake_no[i] = record[i].getAttribute("questionno");
            res_employeeno[i] = record[i].getAttribute('employeeno');
        }
        flush_status();

    } else if (state[0].getAttribute('value') == '5') {
        alert('尺寸测量数据量达不到要求，请进行尺寸测量');
    }
    var options = {
        animation: true,
        trigger: 'hover', //触发tooltip的事件
        html: true
    };
    $('.button').tooltip(options);

}
button_width = '70px';
button_height = '45px';

function flush_catalog_mistake(xmlDoc) {
    var mistakes = xmlDoc.getElementsByTagName("QCQuestion");
    for (var i = 0; i < mistakes.length; i++) {
        if (mistakes[i].getAttribute("class") == '0') {
            var div = document.createElement("div");
            div.style.width = button_width;
            div.style.float = "left";
            var label = document.createElement("label");
            label.innerHTML = mistakes[i].getAttribute("no");
            label.style.width = button_width;
            label.style.textAlign = "center";
            var base = document.getElementById("mistake_1");
            var button = document.createElement("button");
            button.setAttribute("class", " button button-rounded button-flat-primary button-tiny");
            div.style.marginLeft = '10px';
            div.style.marginTop = '10px';
            button.style.width = button_width;
            button.style.height = button_height;
            button.innerHTML = mistakes[i].getAttribute("code");
            button.setAttribute("name", mistakes[i].getAttribute("code"));
            button.value = mistakes[i].getAttribute("no");
            button.onclick = function () {
                to_append_mistake[0] = this.value;
                to_append_mistake[1] = this.getAttribute("name");
                var hint = document.getElementById("hint_mistake");
                hint.innerHTML = this.innerHTML;
                //   $("#program_index").click();
            };
            button.setAttribute("data-toggle", "tooltip");
            button.setAttribute("data-placement", "top");
            button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
            div.appendChild(button);
            div.appendChild(label);
            base.appendChild(div);
        } else if (mistakes[i].getAttribute("class") == '1') {
            var div = document.createElement("div");
            div.style.width = button_width;
            div.style.float = "left";
            var label = document.createElement("label");
            label.innerHTML = mistakes[i].getAttribute("no");
            label.style.width = button_width;
            label.style.textAlign = "center";
            var base = document.getElementById("mistake_2");
            var button = document.createElement("button");
            button.setAttribute("class", " button button-rounded button-flat-highlight button-tiny");
            div.style.marginLeft = '10px';
            div.style.marginTop = '10px';
            button.style.width = button_width;
            button.style.height = button_height;
            button.innerHTML = mistakes[i].getAttribute("code");
            button.setAttribute("name", mistakes[i].getAttribute("code"));
            button.value = mistakes[i].getAttribute("no");
            button.onclick = function () {
                to_append_mistake[0] = this.value;
                to_append_mistake[1] = this.getAttribute("name");
                var hint = document.getElementById("hint_label");
                var hint = document.getElementById("hint_mistake");
                hint.innerHTML = this.innerHTML;
                //document.getElementById("hint_program").innerHTML = to_append_program[1];
                //document.getElementById("hint_employee").innerHTML = to_append_program[2];
                //   $("#program_index").click();
            }
            button.setAttribute("data-toggle", "tooltip");
            button.setAttribute("data-placement", "top");
            button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
            div.appendChild(button);
            div.appendChild(label);
            base.appendChild(div);
        } else if (mistakes[i].getAttribute("class") == '2') {
            var div = document.createElement("div");
            div.style.width = button_width;
            div.style.float = "left";
            var label = document.createElement("label");
            label.innerHTML = mistakes[i].getAttribute("no");
            label.style.width = button_width;
            label.style.textAlign = "center";
            var base = document.getElementById("mistake_3");
            var button = document.createElement("button");
            button.setAttribute("class", " button button-rounded button-flat-caution button-tiny");
            div.style.marginLeft = '10px';
            div.style.marginTop = '10px';
            button.style.width = button_width;
            button.style.height = button_height;
            button.innerHTML = mistakes[i].getAttribute("code");
            button.setAttribute("name", mistakes[i].getAttribute("code"));
            button.value = mistakes[i].getAttribute("no");
            button.onclick = function () {
                to_append_mistake[0] = this.value;
                to_append_mistake[1] = this.getAttribute("name");
                //                var hint = document.getElementById("hint_label");
                var hint = document.getElementById("hint_mistake");
                hint.innerHTML = this.innerHTML;
                //document.getElementById("hint_program").innerHTML = to_append_program[1];
                //document.getElementById("hint_employee").innerHTML = to_append_program[2];
                //   $("#program_index").click();
            }
            button.setAttribute("data-toggle", "tooltip");
            button.setAttribute("data-placement", "top");
            button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
            div.appendChild(button);
            div.appendChild(label);
            base.appendChild(div);
        }
    }
    //var mistakes =
}

function flush_catalog_program(xmlDoc) {
    var programs = xmlDoc.getElementsByTagName("ProducePackProc");
    for (var i = 0; i < programs.length; i++) {
        var base = document.getElementById("program_1");
        var button = document.createElement("button");
        button.innerHTML = programs[i].getAttribute("WorkName");
        button.value = programs[i].getAttribute("WorkLineNo");
        button.setAttribute("name", programs[i].getAttribute("WorkName"));
        button.setAttribute("employee", programs[i].getAttribute("Employee"));
        button.setAttribute("class", "button button-rounded button-flat-action button-tiny");
        button.setAttribute("employeeno", programs[i].getAttribute('Employeeno'));
        button.style.marginLeft = '10px';
        button.style.marginTop = '10px';
        button.style.width = button_width;
        button.style.height = '45px';
        button.onclick = function () {
            to_append_program[0] = this.value;
            to_append_program[1] = this.getAttribute("name");
            to_append_program[2] = this.getAttribute("employee");
            to_append_program[3] = this.getAttribute("employeeno");
            document.getElementById("hint_program").innerHTML = this.innerHTML;
            if (to_append_program[3] != 'None') {
                document.getElementById("hint_employee").innerHTML = '<a>' + to_append_program[2] + '</a>';
                document.getElementById('hint_employee').getElementsByTagName('a')[0].style.cursor = 'pointer';
                document.getElementById('hint_employee').getElementsByTagName('a')[0].onclick = function () {
                    var par = this.parentNode;
                    this.parentNode.innerHTML = '';
                    par.appendChild(search_employee_input);
                    search_employee_input.focus();
                };
            } else {
                document.getElementById('hint_employee').innerHTML = '';
                document.getElementById('hint_employee').appendChild(search_employee_input);
                search_employee_input.focus();
            }
            document.getElementById("explorer_index").getElementsByTagName("a")[3].click();
        };
        button.setAttribute("data-toggle", "tooltip");
        button.setAttribute("data-placement", "top");
        button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
        base.appendChild(button);
    }
}

function flush_state_info(xmlDoc) {
    var ele = xmlDoc.getElementsByTagName('scan_id');
    var id1 = document.getElementById("scan_id");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    id1.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + ele[0].firstChild.nodeValue + '</label>');
    if(document.getElementById("barcode_index").innerHTML != ele[0].firstChild.nodeValue && document.getElementById("barcode_lock").checked){
        if (!confirm("此条码不属于"+document.getElementById("barcode_index").innerHTML+'，还要确定扫描吗？')){
            initiallize();
            return false;
        }
    }    
    document.getElementById("barcode_index").innerHTML = ele[0].firstChild.nodeValue;

    //id1.style.fontSize = '10px';
    var msg = id1.innerHTML + '|';
    ele = xmlDoc.getElementsByTagName('scan_count');
    id1 = document.getElementById("scan_count");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    id1.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + ele[0].firstChild.nodeValue + '</label>');
    //id1.style.fontSize = '10px';
    ele = xmlDoc.getElementsByTagName('scan_measure_count');
    id1 = document.getElementById("measure_count");
    //alert(id1);
    id1.innerHTML = ele[0].firstChild.nodeValue;
    //alert(id1.innerHTML);
    id1.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + ele[0].firstChild.nodeValue + '</label>');

    ele = xmlDoc.getElementsByTagName('scan_group');
    id1 = document.getElementById("scan_group");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    id1.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + ele[0].firstChild.nodeValue + '</label>');
    //id1.style.fontSize = '10px';

    id1 = document.getElementById("scan_total_number");
    ele = xmlDoc.getElementsByTagName('scan_total_number');
    id1.innerHTML = ele[0].firstChild.nodeValue;
    id1.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + ele[0].firstChild.nodeValue + '</label>');
    //id1.style.fontSize = '10px';

    ele = xmlDoc.getElementsByTagName('scan_package_id');
    id1 = document.getElementById("scan_package_id");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    id1.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + ele[0].firstChild.nodeValue + '</label>');
    //id1.style.fontSize = '10px';

    ele = xmlDoc.getElementsByTagName('scan_model');
    id1 = document.getElementById("scan_model");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    id1.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + ele[0].firstChild.nodeValue + '</label>');
    id1.style.fontSize = '10px';
    msg += id1.innerHTML;
    var options = {
        animation: true,
        trigger: 'hover', //触发tooltip的事件
        html: true
    };
    $(".menu").tooltip(options);
    document.getElementsByTagName('iframe')[0].contentWindow.postMessage(msg, '*');
    //alert(msg);
}

function OnClickIndex() {
    var ex = document.getElementById("explorer_index");
    var cata = ex.getElementsByTagName("li");
    for (var i = 0; i < cata.length; i++) {
        cata[i].style.display = "block";
    }
}

function OnClickReScan() {
    if (confirm("记录未提交，确定要重新扫条码？")) {
        initiallize();
    }
}

function OnClickInert() {
    if (current_edit_index != -1) {
        alert('有记录修改中，请修改完成后再添加记录');
        return;
    }
    if (document.getElementById('hint_employee').getElementsByTagName('input').length != 0) {
        alert('责任人未确定，无法添加到记录中');
        return;
    }
    var count = parseInt(document.getElementById("number").value);
    var maxcount = document.getElementById("scan_count").innerHTML;
    // alert(maxcount);
    if (parseInt(count) > parseInt(maxcount) || parseInt(count) <= 0 || !count) {
        alert("数量有误，请重新输入");
        return;
    }
    //alert(count);
    if (to_append_mistake[0] == '-1' || to_append_program[0] == '-1') {
        alert('请选择工序和疵点之后再添加');
        return;
    } else {
        var exist = false;
        var pos = res_mistake_no.length;

        // alert(count);
        for (var i = 0; i < res_mistake_no.length; i++) {
            if (res_mistake_no[i] == to_append_mistake[0] && res_program_no[i] == to_append_program[0] && res_employeeno[i] == to_append_program[3]) {
                exist = true;
                pos = i;
                break;
            }
        }

        if (!exist) {
            res_mistake_name[pos] = to_append_mistake[1];
            res_program_name[pos] = to_append_program[1];
            res_count[pos] = count;
            res_employee[pos] = to_append_program[2];
            res_mistake_no[pos] = to_append_mistake[0];
            res_program_no[pos] = to_append_program[0];
            res_employeeno[pos] = to_append_program[3];
        } else {
            if ((parseInt(res_count[pos]) + parseInt(count)) > parseInt(maxcount)) {
                alert('数据错误');
                return;
            }
            res_count[pos] = (parseInt(res_count[pos]) + parseInt(count)).toString();
        }
        flush_status();

        document.getElementById("number").value = '1';
    }
    //document.getElementById("explorer_index").getElementsByTagName("a")[1].click();
    document.getElementById("hint_mistake").innerHTML = '';
    //document.getElementById("hint_program").innerHTML = '';
    //document.getElementById("hint_employee").innerHTML = '';
    to_append_mistake = ['-1', ''];
    //to_append_program = ['-1', '', ''];
    document.getElementById("search_label").value = '';
}

function flush_status() {
    var table = document.getElementById("status");
    table.innerHTML = '<thead> <tr> <td>序号</td>  <td>工序</td>  <td>责任人</td>  <td>疵点</td>  <td>数量</td> </tr> </thead>  <tbody></tbody> </xml>';
    var tb = table.getElementsByTagName("tbody")[0];
    var count = 0;
    for (var i = 0; i < res_mistake_no.length; i++) {
        var line = document.createElement("tr");
        var l1 = document.createElement("td");
        l1.innerHTML = i + 1;
        var l2 = document.createElement("td");
        l2.innerHTML = res_program_name[i];
        var l3 = document.createElement("td");
        l3.innerHTML = res_employee[i];
        var l4 = document.createElement("td");
        l4.innerHTML = res_mistake_name[i];
        var l5 = document.createElement("td");
        l5.innerHTML = res_count[i];
        count += parseInt(res_count[i]);
        line.appendChild(l1);
        line.appendChild(l2);
        line.appendChild(l3);
        line.appendChild(l4);
        line.appendChild(l5);
        line.value = '0';
        line.onclick = function () {
            if (typeof(T) != 'undefined') {
                clearTimeout(T);
            }
            selected_record = this;
            T = setTimeout('onclickrecord()', 200);
        };
        line.ondblclick = function () {
            if (typeof(T) != 'undefined') {
                clearTimeout(T);
            }
            var eles = this.getElementsByTagName('td');
            if (this.value != '2') {
                this.value = 2;
                for (var i = 0; i < eles.length; i++) {
                    eles[i].style.background = '#CC9933';
                }
                current_edit_index = parseInt(eles[0].innerHTML) - 1;
                to_append_mistake[0] = res_mistake_no[current_edit_index];
                to_append_mistake[1] = res_mistake_name[current_edit_index];
                to_append_program[0] = res_program_no[current_edit_index];
                to_append_program[2] = res_employee[current_edit_index];
                to_append_program[1] = res_program_name[current_edit_index];
                to_append_program[3] = res_employeeno[current_edit_index];
                document.getElementById("hint_mistake").innerHTML = to_append_mistake[1];
                document.getElementById("hint_program").innerHTML = to_append_program[1];
                document.getElementById('hint_employee').innerHTML = '<a>' + to_append_program[2] + '</a>';
                document.getElementById('hint_employee').getElementsByTagName('a')[0].style.cursor = 'pointer';
                document.getElementById('hint_employee').getElementsByTagName('a')[0].onclick = function () {
                    var par = this.parentNode;
                    this.parentNode.innerHTML = '';
                    par.appendChild(search_employee_input);
                    search_employee_input.focus();
                };
                document.getElementById("number").value = res_count[current_edit_index];
                var trs = this.parentNode.getElementsByTagName("tr");
                for (var i = 0; i < trs.length - 1; i++) {
                    //alert(i+1);
                    if ((i + 1) != parseInt(this.getElementsByTagName("td")[0].innerHTML)) {
                        var hs = trs[i].getElementsByTagName("td");
                        for (var j = 0; j < hs.length; j++) {
                            hs[j].style.background = '#fff';
                        }
                        trs[i].value = '0';
                    }
                }
            } else {
                for (var i = 0; i < eles.length; i++) {
                    eles[i].style.background = '#fff'
                }
                this.value = '0';
                current_edit_index = -1;
                to_append_mistake = ['-1', ''];
                to_append_program = ['-1', '', ''];
                document.getElementById("hint_mistake").innerHTML = '';
                document.getElementById("hint_program").innerHTML = '';
                document.getElementById("hint_employee").innerHTML = '';
                document.getElementById("number").value = 1;
            }
        };
        tb.appendChild(line);
    }
    var line_total = document.createElement("tr");
    var l1 = document.createElement("td");
    l1.setAttribute("colspan", "4");
    l1.innerHTML = "总计";
    var l2 = document.createElement("td");
    l2.innerHTML = count;
    line_total.appendChild(l1);
    line_total.appendChild(l2);
    tb.appendChild(line_total);

}
var current_edit_index = -1;

function onclickrecord() {
    if (current_edit_index != -1) {
        var hs = document.getElementById("status").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        for (var i = 0; i < hs.length; i++) {
            hs[i].value = '0';
            var temp = hs[i].getElementsByTagName("td");
            for (var j = 0; j < temp.length; j++) {
                temp[j].style.background = '#fff';
            }
            current_edit_index = -1;
        }
    }
    if (selected_record.value == '0') {
        selected_record.value = '1';
        var eles = selected_record.getElementsByTagName('td');
        for (var i = 0; i < eles.length; i++) {
            eles[i].style.background = '#0099FF'
        }

    } else {
        selected_record.value = '0';
        var eles = selected_record.getElementsByTagName('td');
        for (var i = 0; i < eles.length; i++) {
            eles[i].style.background = '#fff'
        }
        current_edit_index = -1;
    }
}

function OnClickDeleteRecord() {
    if (current_edit_index != -1) {
        alert('有记录修改中，请修改完成后再选择需要删除的记录进行删除');
        return;
    }
    var list = document.getElementById("status");
    var rec = list.getElementsByTagName("tr");
    for (var i = 1; i < rec.length - 1; i++) {
        if (rec[i].value == '1') {
            var index = parseInt(rec[i].getElementsByTagName('td')[0].innerHTML);
            res_mistake_no[index - 1] = '-1';
        }
    }
    var temp_mistake_no = [];
    var temp_program_no = [];
    var temp_count = [];
    var temp_employee = [];
    var temp_mistake_name = [];
    var temp_program_name = [];
    var temp_employeeno = [];
    for (var i = 0; i < res_mistake_no.length; i++) {
        if (res_mistake_no[i] != '-1') {
            temp_mistake_name[temp_mistake_name.length] = res_mistake_name[i];
            temp_mistake_no[temp_mistake_no.length] = res_mistake_no[i];
            temp_program_name[temp_program_name.length] = res_program_name[i];
            temp_program_no[temp_program_no.length] = res_program_no[i];
            temp_employee[temp_employee.length] = res_employee[i];
            temp_count[temp_count.length] = res_count[i];
            temp_employeeno[temp_employeeno.length] = res_employeeno[i];
        }
    }
    res_count = temp_count;
    res_employee = temp_employee;
    res_mistake_name = temp_mistake_name;
    res_mistake_no = temp_mistake_no;
    res_program_name = temp_program_name;
    res_program_no = temp_program_no;
    res_employeeno = temp_employeeno;
    flush_status();
}

function OnClickPlus() {
    var num = document.getElementById("number");
    var number = parseInt(num.value);
    if (!number) {
        number = 0;
    }
    number = number + 1;
    num.value = number;
}

function OnClickMinus() {
    var num = document.getElementById("number");
    var number = parseInt(num.value);
    if (!number) {
        number = 0;
    }
    if (number > 1) {
        number = number - 1;
    }
    num.value = number;
}
var number;

function OnClickNum(input) {
    var num = number.value.toString();
    num = num + parseInt(input.innerHTML);
    number.value = num;
    if (number.id == 'search_label') {
        var base = document.getElementById("mistake_4");
        base.innerHTML = '';
        flush_search_area(xmlfile);
    }
    number.focus();
}

function onclicknumclear() {
    number.value = '';
    number.focus();
}

function OnClickSearchDel() {
    number.value = number.value.slice(0, -1);
    if (number.id == 'search_label') {
        var base = document.getElementById("mistake_4");
        base.innerHTML = '';
        flush_search_area(xmlfile);
    }
    number.focus();
}

function compare_search(v1, v2) {
    if (v1.length == 0) {
        return true;
    } else {
        //  alert('hello');
        return v2.indexOf(v1) >= 0;
    }
}
var fontsizein = '15px';

function flush_search_area(info) {
    var domParser = new DOMParser();
    var xmlDoc = domParser.parseFromString(info, 'text/xml');
    var target = document.getElementById("search_label").value;
    //document.getElementById("search_label").blur();
    var mistakes = xmlDoc.getElementsByTagName("QCQuestion");
    var base = document.getElementById("mistake_4");
    for (var i = 0; i < mistakes.length; i++) {
        if (compare_search(target, mistakes[i].getAttribute("no"))) {
            if (mistakes[i].getAttribute("class") == '0') {
                var div = document.createElement("div");
                div.style.width = button_width;
                div.style.float = "left";
                var label = document.createElement("label");
                label.innerHTML = mistakes[i].getAttribute("no");
                label.style.width = button_width;
                label.style.textAlign = "center";
                //var base = document.getElementById("mistake_1");
                var button = document.createElement("button");
                button.setAttribute("class", " button button-rounded button-flat-primary button-tiny");
                div.style.marginLeft = '10px';
                div.style.marginTop = '10px';
                button.style.width = button_width;
                button.style.height = button_height;
                button.innerHTML = mistakes[i].getAttribute("code");
                button.style = fontsizein;
                button.setAttribute("name", mistakes[i].getAttribute("code"));
                button.value = mistakes[i].getAttribute("no");
                button.onclick = function () {
                    to_append_mistake[0] = this.value;
                    to_append_mistake[1] = this.getAttribute("name");
                    var hint = document.getElementById("hint_mistake");
                    hint.innerHTML = to_append_mistake[1];
                    //   $("#program_index").click();
                }
                button.setAttribute("data-toggle", "tooltip");
                button.setAttribute("data-placement", "top");
                button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
                div.appendChild(button);
                div.appendChild(label);
                base.appendChild(div);
            } else if (mistakes[i].getAttribute("class") == '1') {
                var div = document.createElement("div");
                div.style.width = button_width;
                div.style.float = "left";
                var label = document.createElement("label");
                label.innerHTML = mistakes[i].getAttribute("no");
                label.style.width = button_width;
                label.style.textAlign = "center";
                //var base = document.getElementById("mistake_2");
                var button = document.createElement("button");
                button.setAttribute("class", " button button-rounded button-flat-highlight button-tiny");
                div.style.marginLeft = '10px';
                div.style.marginTop = '10px';
                button.style.width = button_width;
                button.style.height = button_height;
                button.innerHTML = mistakes[i].getAttribute("code");
                button.setAttribute("name", mistakes[i].getAttribute("code"));
                button.value = mistakes[i].getAttribute("no");
                button.onclick = function () {
                    to_append_mistake[0] = this.value;
                    to_append_mistake[1] = this.getAttribute("name");
                    var hint = document.getElementById("hint_mistake");
                    hint.innerHTML = to_append_mistake[1];
                    //   $("#program_index").click();
                }
                button.setAttribute("data-toggle", "tooltip");
                button.setAttribute("data-placement", "top");
                button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
                div.appendChild(button);
                div.appendChild(label);
                base.appendChild(div);
            } else if (mistakes[i].getAttribute("class") == '2') {
                var div = document.createElement("div");
                div.style.width = button_width;
                div.style.float = "left";
                var label = document.createElement("label");
                label.innerHTML = mistakes[i].getAttribute("no");
                label.style.width = button_width;
                label.style.textAlign = "center";
                //var base = document.getElementById("mistake_3");
                var button = document.createElement("button");
                button.setAttribute("class", " button button-rounded button-flat-caution button-tiny");
                div.style.marginLeft = '10px';
                div.style.marginTop = '10px';
                button.style.width = button_width;
                button.style.height = button_height;
                button.innerHTML = mistakes[i].getAttribute("code");
                button.setAttribute("name", mistakes[i].getAttribute("code"));
                button.value = mistakes[i].getAttribute("no");
                button.onclick = function () {
                    to_append_mistake[0] = this.value;
                    to_append_mistake[1] = this.getAttribute("name");
                    var hint = document.getElementById("hint_mistake");
                    hint.innerHTML = to_append_mistake[1];
                    //   $("#program_index").click();
                }
                button.setAttribute("data-toggle", "tooltip");
                button.setAttribute("data-placement", "top");
                button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
                div.appendChild(button);
                div.appendChild(label);
                base.appendChild(div);
            }
        }
    }
    $("#mistake_index").click();
    $("#searcher_page").click();
    var options = {
        animation: true,
        trigger: 'hover', //触发tooltip的事件
        html: true
    };
    $('.button').tooltip(options);
}

function OnCommit() {
    //$('#commit_button').button('loading');
    //$('.alert').alert()
    submit();
}
var last_code ;
function submit() {
    if (!style_measure_illeagl()) {
        alert('尺寸测量有数据不明确');
        return 0;
    }
    //var xmlhttp = new XMLHttpRequest();
    //xmlhttp.open("POST", '/commit_res/', true);
    //xmlhttp.setRequestHeader("Content-type", "text/xml");
    var hs = document.getElementById("scan_input");
    var resultxml = 'codenumber=' + document.getElementById('scan_input').value + '&';
    if ($.trim(document.getElementById('scan_input').value) == '') {
        alert('条码为空，无法提交');
        return;
    }
    resultxml += 'batch=' + document.getElementById('scan_id').innerHTML + '&';
    resultxml += 'size=' + document.getElementById('scan_model').innerHTML + '&';
    resultxml += 'count=' + document.getElementById('scan_count').innerHTML + '&';
    resultxml += 'group=' + document.getElementById('scan_group').innerHTML + '&';
    resultxml += 'inspectorno=' + document.getElementById('session_inspector').getElementsByTagName('data')[0].getAttribute('value') + '&';
    resultxml += 'inspectorname=' + document.getElementById('session_inspector').getElementsByTagName('data')[1].getAttribute('value') + '&';
    resultxml += 'type=1&';
    resultxml += 'res_json=';
    var temp_res_json = [];
    for (var i = 0; i < res_mistake_no.length; i++) {
        temp_res_json.push(
            {work_no:res_program_no[i],mistake_no:res_mistake_no[i],count:res_count[i],employee_name:res_employee[i],employee_no:res_employeeno[i]}
        );
        //resultxml = resultxml + "<" + 're mist' + '="' + res_mistake_no[i] + '\" prog = \"' + res_program_no[i] + '\" count = \"' + res_count[i] + '\" employeeno=\"' + res_employeeno[i] + '\" employee=\"' + res_employee[i] + '\"/>';
    }
    resultxml += JSON.stringify(temp_res_json) + "&";
    resultxml += 'measure_json=';
    //resultxml += JSON.stringify(json);
    resultxml += '&size=' + document.getElementById('scan_model').innerHTML;
    console.log(resultxml);
    last_code = $.trim(document.getElementById('scan_input').value);
    $.ajax({
        url: '/commit_res/',
        type: 'POST',
        data: resultxml,
        success: function () {
            
            Messenger().post({
                message: last_code+"提交成功",
                hideAfter: 1,
                hideOnNavigate: true
            });
        },
        error: function (err,info) {
            if (info == "timeout"){
                Messenger().post({
                    message: last_code+"网络状况不良，请重试",
                    hideAfter: 3,
                    hideOnNavigate: true
                });
            }else{
                Messenger().post({
                    message: last_code+"服务器出错",
                    hideAfter: 3,
                    hideOnNavigate: true
                });
            }

        },
        timeout: 15000,
        async: true
    });
    initiallize();
    /*
     xmlhttp.onload = function(e) {
     //console.log(JSON.stringify(esrcElement));
     if (e.srcElement.status == "200") {
     Messenger().post({
     message: "提交成功",
     hideAfter: 1,
     hideOnNavigate: true
     });
     } else {
     Messenger().post({
     message: "提交失败",
     hideAfter: 1,
     hideOnNavigate: true
     });
     }
     }
     try {
     xmlhttp.send(resultxml);
     } catch (e) {
     console.log(e);
     Messenger().post({
     message: "提交失败",
     hideAfter: 1,
     hideOnNavigate: true
     });
     }*/
    //$('#commit_button').button('reset');


}

function OnClickClear() {
    if (current_edit_index != -1) {
        alert('请修改完记录后再添加');
        return;
    }
    if (confirm("确定要删除所有记录？")) {
        res_mistake_no = [];
        res_program_no = [];
        res_count = [];
        res_employee = [];
        res_mistake_name = [];
        res_program_name = [];
        res_employeeno = [];
        flush_status();
    }
}

function OnClickChange() {
    if (current_edit_index == -1) {
        alert('请选择一条记录之后进行修改');
        return;
    }
    if (document.getElementById('hint_employee').getElementsByTagName('input').length != 0) {
        alert('责任人未确定，无法添加到记录中');
        return;
    }
    if (parseInt(document.getElementById("number").value) > parseInt(document.getElementById("scan_count").innerHTML)) {
        alert('数据有误');
        return;
    }
    res_count[current_edit_index] = document.getElementById("number").value;
    res_mistake_no[current_edit_index] = to_append_mistake[0];
    res_mistake_name[current_edit_index] = to_append_mistake[1];
    res_program_name[current_edit_index] = to_append_program[1];
    res_program_no[current_edit_index] = to_append_program[0];
    res_employee[current_edit_index] = to_append_program[2];
    res_employeeno[current_edit_index] = to_append_program[3];
    flush_status();
    current_edit_index = -1;
    to_append_mistake = ['-1', ''];
    to_append_program = ['-1', '', ''];
    document.getElementById("number").value = '1';
    document.getElementById("hint_mistake").innerHTML = '';
    document.getElementById("hint_program").innerHTML = '';
    document.getElementById("hint_employee").innerHTML = '';
    document.getElementById("explorer_index").getElementsByTagName("a")[1].click();
}

function OnClickNumConfirm() {
    if (number.id == 'scan_input' && number.disabled == false) {
        var ele = document.getElementById("scan_input"); //禁用输入框，防止二次输入
        if (ele.value.length != code_length) {
            alert("条码有误，请重新输入");
            initiallize();
            return;
        }
        ele.disabled = true;
        ele.blur();
        flush_info();
        //build_page(xmlfile);
        var rescan = document.getElementById("rescan");
        rescan.disabled = false;
        $("#program_index").click();
        $('#search_label').focus();
    } else if (number.id == 'search_employee_input') {
        var group = document.getElementById('scan_group').innerHTML;
        var num = number.value;
        var xhr = new XMLHttpRequest()
        xhr.open('GET', "/get_employee/?group=" + group + '&no=' + num, false);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //document.write(xhr.responseText.toString());
                if (xhr.responseText == '0') {
                    alert('不存在此员工');
                    search_employee_input.value = '';
                    search_employee_input.focus();
                } else if (xhr.responseText.toString().split('@')[0] == '1') {
                    if (confirm('此员工不属于本生产组,依旧要添加？')) {
                        search_employee_input.value = '';
                        document.getElementById('hint_employee').innerHTML = '<a>' + xhr.responseText.toString().split('@')[1] + '</a>';
                        document.getElementById('hint_employee').getElementsByTagName('a')[0].style.cursor = 'pointer';
                        document.getElementById('hint_employee').getElementsByTagName('a')[0].onclick = function () {
                            var par = this.parentNode;
                            this.parentNode.innerHTML = '';
                            par.appendChild(search_employee_input);
                            search_employee_input.focus();
                        };
                        to_append_program[2] = xhr.responseText.toString().split('@')[1];
                        to_append_program[3] = xhr.responseText.toString().split('@')[2];
                    } else {
                        search_employee_input.value = '';
                        search_employee_input.focus();
                    }
                } else {
                    search_employee_input.value = '';
                    document.getElementById('hint_employee').innerHTML = '<a>' + xhr.responseText.toString().split('@')[0] + '</a>';
                    document.getElementById('hint_employee').getElementsByTagName('a')[0].style.cursor = 'pointer';
                    document.getElementById('hint_employee').getElementsByTagName('a')[0].onclick = function () {
                        var par = this.parentNode;
                        this.parentNode.innerHTML = '';
                        par.appendChild(search_employee_input);
                        search_employee_input.focus();
                    };
                    to_append_program[2] = xhr.responseText.toString().split('@')[0];
                    to_append_program[3] = xhr.responseText.toString().split('@')[1];
                }
            }
        };
        xhr.send();
    }
}