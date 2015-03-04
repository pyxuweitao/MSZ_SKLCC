window.onload = function() {

    if (window.location.search.length > 1) {
        var search = window.location.search;
        content_id = search.split('&')[0].split('=')[1];
        dept = decodeURI(search.split('&')[1].split('=')[1]);
        inspectorno = search.split('&')[2].split('=')[1];
        inspectorname = decodeURI(search.split('&')[3].split('=')[1]);
        batch = search.split('&')[4].split('=')[1];
        console.log(batch);
        con_total_num = search.split('&')[5].split('=')[1];
        con_sample_num = search.split('&')[6].split('=')[1];
        initiallize();
        flush_page_by_content_id();
        console.log('cone');
        return;
    }
    initiallize();
    var options = {
        animation: true,
        trigger: 'hover', //触发tooltip的事件
        html: true
    };
    $('.btn').tooltip(options);
    $('.menu').tooltip(options);
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    $(change_input).popover({
        animation: true,
        content: key_pass,
        trigger: 'manual',
        html: true,
        placement: 'bottom'
    });
    $('#total_num').on('change focus blur input', function() {
        sample = get_sample_count_by_total_count();
        //alert(sample);
        document.getElementById('check_num').value = sample;
    });

};

function get_sample_count_by_total_count() {
    if (!parseInt(document.getElementById('total_num').value)) {
        return 0;
    }
    var count = parseInt(document.getElementById('total_num').value);
    if (count >= 2 && count <= 8) {
        return 0;
    } else if (count >= 9 && count <= 15) {
        return 2;
    } else if (count >= 16 && count <= 25) {
        return 5;
    } else if (count >= 26 && count <= 50) {
        return 8;
    } else if (count >= 51 && count <= 90) {
        return 13;
    } else if (count >= 91 && count <= 150) {
        return 20;
    } else if (count >= 151 && count <= 280) {
        return 32;
    } else if (count >= 281 && count <= 500) {
        return 50;
    } else if (count >= 501) {
        return 50;
    }
    return 0;
}

function flush_page_by_content_id() {
    document.getElementById('department').innerHTML = '<option>' + dept + '</option>';
    console.log(document.getElementById('department').innerHTML);
    document.getElementById('batch').innerHTML = '';
    document.getElementById('batch').innerHTML = '<option>' + batch + '</option>';
    document.getElementById('inspector').innerHTML = '<option value="' + inspectorno + '">' + inspectorname + '</option>';
    document.getElementById('total_num').value = con_total_num;
    document.getElementById('check_num').value = con_sample_num;
    document.getElementById('is_clear').disabled = true;
    document.getElementById('serial_month').disabled = true;
}
var xmlfile = '';
var to_append_mistake = ['-1', ''];
var to_append_program = ['-1', '', ''];
var code_length = 10;

var res_mistake_no = [];
var res_program_no = [];
var res_count = [];
var res_employee = [];
var res_mistake_name = [];
var res_program_name = [];

var state_no = '';

function initiallize() {

    document.getElementById('pass').click();
    document.getElementById('pass').checked = true;
    var hs = document.getElementById("toparea").getElementsByTagName("select");
    for (var i = 0; i < hs.length; i++) {
        hs[i].disabled = false;
    }
    hs = document.getElementById("toparea").getElementsByTagName("input");
    for (var i = 0; i < hs.length; i++) {
        hs[i].disabled = false;
    }
    hs = document.getElementById("toparea").getElementsByTagName("button");
    for (var i = 0; i < hs.length; i++) {
        hs[i].disabled = false;
    }
    document.getElementById('explorer_index').getElementsByTagName('a')[8].click();
    var tabs = document.getElementById("explorer_content").getElementsByTagName("div");
    for (var i = 0; i < tabs.length - 3; i++) {
        tabs[i].innerHTML = '';
    }
    state_no = '';
    $("number").value = '1';
    var buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
    document.getElementById("confirm").disabled = false;
    document.getElementById("status").innerHTML = '<thead> <tr> <th>序号</th><th>工序</th> <th>疵点</th>  <th>数量</th> </tr> </thead>  <tbody></tbody>';
    res_mistake_no = [];
    res_program_no = [];
    res_count = [];
    res_employee = [];
    res_mistake_name = [];
    res_program_name = [];
    if (window.location.search.length < 1) {
        onchangeslelction();
    }
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        //console.log(cookies[i].split('=')[0]);
        //console.log($.trim(cookies[i].split('=')[0]));
        if (cookies[i].split('=')[0] == 'month_chosen') {
            console.log(cookies[i].split('=')[1]);
            $('#serial_month option').each(function() {
                this.selected = false;
                if (this.value == cookies[i].split('=')[1]) {
                    this.selected = true;
                }
            });
        }
        if (cookies[i].split('=')[0] == 'batch_of_last') {
            $("#batch option").each(function() {
                this.selected = false;
                if (this.innerHTML == cookies[i].split('=')[1]) {
                    this.selected = true;
                }
            });
        }
    }
    to_append_mistake = ['-1', ''];
    to_append_program = ['-1', '', ''];
    document.getElementById("hint_mistake").innerHTML = '';
    document.getElementById("hint_program").innerHTML = '';
    $('.btn').mouseout();
    hs = document.getElementById("toparea").getElementsByTagName("input");
    for (var i = 0; i < hs.length; i++) {
        hs[i].value = '';
    }
    $('#baldric button').each(function() {
        this.disabled = false;
    });
    document.getElementById('is_recheck').checked = false;
}

function onclicknumclear() {
    number.value = '';
    number.focus();
}

function onchangeslelction() {
    var department = $("#department").find("option:selected").text();
    var batch = $("#batch").find("option:selected").text();
    var jsonhttp = new XMLHttpRequest();
    jsonhttp.onreadystatechange = function() {
        if (jsonhttp.readyState == 4 && jsonhttp.status == 200) {
            var jsonfile = jsonhttp.responseText.toString();
            build_page(jsonfile);
            //alert();
            document.cookie = "month_chosen=" + document.getElementById('serial_month').value;
        }
    }
    var hs = document.getElementById("scan_input");
    jsonhttp.open("GET", '/recheck_update_batch_and_inspector/?' + 'department=' + department + '&is_clear=' + document.getElementById('is_clear').checked.toString() + '&month=' + document.getElementById("serial_month").value, false);
    jsonhttp.send();
}

function build_page(info) {
    document.getElementById("inspector").innerHTML = '';
    document.getElementById("batch").innerHTML = '';
    var json = eval('(' + info + ')');
    //alert(json.length);
    for (var i = 0; i < json.inspector.length; i++) {
        var temp = document.createElement("option")
        temp.innerHTML = json.inspector[i].inspector;
        temp.value = json.inspector[i].inspector_no;
        document.getElementById("inspector").appendChild(temp);
    }
    for (var i = 0; i < json.batch.length; i++) {
        temp = document.createElement("option")
        temp.innerHTML = json.batch[i].batch;
        temp.value = json.batch[i].batch;
        document.getElementById("batch").appendChild(temp);
    }

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

function onclickconfirm() {

    var total_num = parseInt(document.getElementById("total_num").value);
    var check_num = parseInt(document.getElementById("check_num").value);
    if (!(total_num >= check_num) || check_num <= 0 || $("#inspector").find("option:selected").text().length == 0 || $("#batch").find("option:selected").text().length == 0) {
        alert("选择的数据有误");
        return;
    }
    document.cookie = "batch_of_last=" + document.getElementById('batch').value;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.cookie = "batch_of_last=" + document.getElementById("batch").value;
            xmlfile = xmlhttp.responseText.toString();
            var domParser = new DOMParser();
            var xmlDoc = domParser.parseFromString(xmlfile, 'text/xml');
            flush_catalog_mistake(xmlDoc);
            flush_catalog_program(xmlDoc);

            //activate();
            document.getElementById("search_label").focus();
            document.getElementById("search_label").blur();
            var options = {
                animation: true,
                trigger: 'hover', //触发tooltip的事件
                html: true
            };
            $('.button').tooltip(options);
            document.getElementById('explorer_index').getElementsByTagName('a')[1].click();
            var bg = flush_measure_list(xmlDoc);
            if (bg) {
                //bind_to_size();    
            } else {
                activate();
            }
            if (window.location.search.length > 1) {
                flush_record(xmlDoc);
                flush_style_measure_history(xmlDoc);
            }
            activate();
        }
    };
    if (!(window.location.search.length > 1)) {
        xmlhttp.open('GET', '/flush_buttons_recheck/?batch=' + $("#batch").find("option:selected").text(), true);
    } else {
        xmlhttp.open('GET', '/flush_buttons_recheck/?batch=' + $("#batch").find("option:selected").text() + '&contentid=' + content_id, true);
    }
    xmlhttp.send();
}

function flush_measure_list(xmlDoc) {
    if (xmlDoc.getElementsByTagName('size').length == 0) {
        return 0;
    }
    var size_list = xmlDoc.getElementsByTagName('size')[0].getAttribute('size_list').split(';');
    var selectx = document.createElement('select');
    selectx.id = "size_flush_select";
    for (var i = 0; i < size_list.length; i++) {
        var op = document.createElement('option');
        op.innerHTML = size_list[i];
        selectx.appendChild(op);
    }
    selectx.setAttribute('class', 'form-control');
    selectx.style.width = '200px';
    selectx.style.display = 'inline';
    document.getElementById('measure_size').innerHTML = '选择本次检验的尺码：';
    document.getElementById('measure_size').appendChild(selectx);

    var div = document.createElement('div');
    div.id = 'partion_input';
    div.style.overflow = 'auto';
    div.style.marginTop = '10px';
    document.getElementById('measure_size').appendChild(div);
    selectx.onchange = function() {
        return get_partition();
    }
    get_partition();
    return 1;
}

function bind_to_size() {

    document.getElementById('explorer_index').getElementsByTagName('a')[8].click();
    $('#explorer_index a').each(function() {
        this.disabled = true;
    });
}

function style_measure_illeagl() {
    try {
        if (!document.getElementById('partion_input').getElementsByTagName('table')[0]) {
            return true;
        }
    } catch (e) {
        return true;
    }
    var records = 0;
    $('a.del_col_a').each(function() {
        records += 1;
        //console.log(1);
    });
    if (records <= Math.round(parseFloat(document.getElementById("check_num").value) * 0.1)) {
        return false;
    }
    var tds = document.getElementById('partion_input').getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('td');
    for (var i = 0; i < tds.length; i++) {
        if ($.trim(tds[i].innerHTML) == '') {
            return false;
        }
    }
    return true;
}
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
    $('#partion_input td.record').each(function(e) {
        if (this.getElementsByTagName("input").length == 0) {
            var tempN = this;
            $("<input/>").css({
                border: 'none',
                width: '40px',
                "background-color": 'transparent'
                    //height:'45px'
            }).appendTo(tempN).number_keyboard({
                placement: 'auto',
                type: "type_with_number_and_point"
            });
        }
    });
    // $('#partion_input td.record').click(function(e) {
    //     //console.log(e.target);
    //     if (e.target.getAttribute('isrecord') == '1' && !change_is_shown) {
    //         var value_temp = this.innerHTML;
    //         this.innerHTML = '';
    //         change_input.value = value_temp;
    //         this.appendChild(change_input);
    //         change_input.focus();
    //         $(change_input).popover('show');
    //         change_is_shown = true;
    //     }
    // }).each(function() {
    //     this.style.width = '60px';
    //     this.style.height = '45px';
    // });
}

function get_partition() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_partition_table/?styleno=' + document.getElementById('batch').value.split('-')[0] + '&size=' + document.getElementById('size_flush_select').value, false);
    var x = document.getElementById('size_flush_select').value;
    xhr.onload = function() {
            var domParser = new DOMParser();
            var xmlDoc = domParser.parseFromString(xhr.responseText, 'text/xml');
            flush_style_measure(xmlDoc);
        }
        // if (document.getElementById('partion_input').getElementsByTagName('table').length == 0) {
        //     xhr.send();
        // } else {
        //     if (true) {
        //         document.getElementById('partion_input').innerHTML = '';
        //         document.getElementById('measure_size').removeChild(document.getElementById('measure_size').getElementsByTagName('button')[0]);
        //         xhr.send();
        //     } else {
        //         $('#size_flush_select option').each(function() {
        //             if (this.innerHTML == x) {
        //                 console.log(x);
        //                 this.selected = 'selected';
        //             }
        //         });
        //     }
        // }
    xhr.send();
}

function flush_style_measure(xmlDoc) {
    if (document.getElementById("measure_size").getElementsByTagName("table").length == 0) {
        var table = document.createElement('table');
        table.setAttribute('class', 'table table-bordered');
        table.style.border = 'none';
        table.style.width = '100px';
        table.innerHTML = '<thead><tr><th style="min-width: 120px;;border:#ddd 1px solid">工序</th><th style="min-width: 60px;max-width:120px;border:#ddd 1px solid">标准</th><th style="min-width: 60px;max-width:120px;border:#ddd 1px solid">公差</th><th style="max-width:120px;border:#ddd 1px solid;min-width: 60px;">对称</th><th style="border:none"><a style="cursor:pointer" id="measure_partition_add_col_button"> <span class="glyphicon glyphicon-plus-sign"> </span></a></th></tr></thead>';
        var str = xmlDoc.getElementsByTagName('measure');
        var tbody = document.createElement('tbody');
        for (var i = 0; i < str.length; i++) {
            var tr = document.createElement('tr');
            var td0 = document.createElement('td');
            //td0.style.position = 'absolute';
            //td0.style.marginTop = '0px';
            td0.style.width = '120px';
            td0.style.height = '30px';
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
            var btn = document.createElement('button');
            btn.setAttribute('class', 'btn btn-success');
            btn.innerHTML = '尺寸测量完毕，开始录入疵点';
            btn.onclick = function() {
                if (style_measure_illeagl()) {
                    return activate();
                } else {
                    alert('有数据不明确或检验次数达不到最低要求');
                    return null;
                }
            };
        }
        //document.getElementById('measure_size').appendChild(btn);
        document.getElementById('partion_input').appendChild(table);
        $('#measure_partition_add_col_button').tooltip({
            animation: true,
            html: true,
            title: '<label style="font-size:20px">点击添加一条测量记录</label>'
        }).click(function() {
            var rows = table.getElementsByTagName('tr');
            var th = document.createElement('th');
            th.style.border = '#ddd 1px solid';
            th.innerHTML = '<span>' + (rows[0].getElementsByTagName('th').length - 4) + '</span>';
            th.style.minWidth = '80px';
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
                td0.setAttribute('class', 'record new_input');
                td1.setAttribute('class', 'record new_input');
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
            }).click(function() {
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
    }else{
        $("#measure_size").find("table").each(function(){
            var table = this;
            var str = xmlDoc.getElementsByTagName('measure');
            var tbody_trs = this.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
            for (var i=0;i<str.length;i++){
                for (var j=0;j<tbody_trs.length;j++){
                    var tds = tbody_trs[j].getElementsByTagName("td");
                    if ($.trim(tds[0].innerHTML) == $.trim(str[i].getAttribute("partition"))){
                        tds[1].innerHTML = str[i].getAttribute('measure_res');
                        tds[2].innerHTML = str[i].getAttribute('common_difference');
                        tds[3].innerHTML = str[i].getAttribute('symmetry');
                    }
                }
            }
        });
    }
}

function activate() {
    var hs = document.getElementById("mainarea").getElementsByTagName("button");
    for (var i = 0; i < hs.length; i++) {
        hs[i].disabled = false;
    }
    hs = document.getElementById("toparea").getElementsByTagName("select");
    for (var i = 0; i < hs.length; i++) {
        hs[i].disabled = true;
    }

    hs = document.getElementById("toparea").getElementsByTagName("button");
    for (var i = 0; i < hs.length; i++) {
        hs[i].disabled = true;
    }
    document.getElementById("program_index").click();
    $('#explorer_index a').each(function() {
        // body...
        this.disabled = false;
    });
    document.getElementById("explorer_index").getElementsByTagName("a")[1].click();

}
button_width = '70px';
button_height = '45px';

function flush_record(xmlDoc) {
    var records = xmlDoc.getElementsByTagName('record');
    for (var i = 0; i < records.length; i++) {
        res_mistake_no[i] = records[i].getAttribute('QCno');
        res_mistake_name[i] = records[i].getAttribute('QC');
        res_program_no[i] = records[i].getAttribute('Workno');
        res_program_name[i] = records[i].getAttribute('Work');
        res_count[i] = records[i].getAttribute('no');
        flush_status();
    }
}

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
            button.setAttribute("data-toggle", "tooltip");
            button.setAttribute("data-placement", "top");

            div.style.marginLeft = '10px';
            div.style.marginTop = '10px';
            button.style.width = button_width;
            button.style.height = button_height;
            button.innerHTML = mistakes[i].getAttribute("code");
            button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
            button.setAttribute("name", mistakes[i].getAttribute("code"));
            button.value = mistakes[i].getAttribute("no");
            button.onclick = function() {
                to_append_mistake[0] = this.value;
                to_append_mistake[1] = this.getAttribute("name");
                var hint = document.getElementById("hint_mistake");
                hint.innerHTML = to_append_mistake[1];
                //   $("#program_index").click();
            }
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
            button.setAttribute("data-toggle", "tooltip");
            button.setAttribute("data-placement", "top");

            div.style.marginLeft = '10px';
            div.style.marginTop = '10px';
            button.style.width = button_width;
            button.style.height = button_height;
            button.innerHTML = mistakes[i].getAttribute("code");
            button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
            button.setAttribute("name", mistakes[i].getAttribute("code"));
            button.value = mistakes[i].getAttribute("no");
            button.onclick = function() {
                to_append_mistake[0] = this.value;
                to_append_mistake[1] = this.getAttribute("name");
                //var hint = document.getElementById("hint_label");
                var hint = document.getElementById("hint_mistake");
                hint.innerHTML = to_append_mistake[1];
                //document.getElementById("hint_program").innerHTML = to_append_program[1];
                //document.getElementById("hint_employee").innerHTML = to_append_program[2];
                //   $("#program_index").click();
            }
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
            button.setAttribute("data-toggle", "tooltip");
            button.setAttribute("data-placement", "top");

            div.style.marginLeft = '10px';
            div.style.marginTop = '10px';
            button.style.width = button_width;
            button.style.height = button_height;
            button.innerHTML = mistakes[i].getAttribute("code");
            button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
            button.setAttribute("name", mistakes[i].getAttribute("code"));
            button.value = mistakes[i].getAttribute("no");
            button.onclick = function() {
                to_append_mistake[0] = this.value;
                to_append_mistake[1] = this.getAttribute("name");
                //                var hint = document.getElementById("hint_label");
                var hint = document.getElementById("hint_mistake");
                hint.innerHTML = to_append_mistake[1];
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

function flush_status() {
    var table = document.getElementById("status");
    table.innerHTML = '<thead> <tr> <th>序号</th>  <th>工序</th> <th>疵点</th>  <th>数量</th> </tr> </thead>  <tbody></tbody> </xml>';
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
        //line.appendChild(l3);
        line.appendChild(l4);
        line.appendChild(l5);
        line.value = '0';
        line.onclick = function() {
            if (typeof(T) != 'undefined') {
                clearTimeout(T);
            }
            selected_record = this;
            T = setTimeout('onclickrecord()', 200);
        };
        line.ondblclick = function() {
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
                document.getElementById("hint_mistake").innerHTML = to_append_mistake[1];
                document.getElementById("hint_program").innerHTML = to_append_program[1];
                //document.getElementById("hint_employee").innerHTML = to_append_program[2];
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
                //document.getElementById("hint_employee").innerHTML = '';
                document.getElementById("number").value = 1;
            }
        };
        tb.appendChild(line);
    }
    var line_total = document.createElement("tr");
    var l1 = document.createElement("td");
    l1.setAttribute("colspan", "3");
    l1.innerHTML = "总计";
    var l2 = document.createElement("td");
    l2.innerHTML = count;
    line_total.appendChild(l1);
    line_total.appendChild(l2);
    tb.appendChild(line_total);
}

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

function flush_catalog_program(xmlDoc) {
    var programs = xmlDoc.getElementsByTagName("ProduceStyle");
    for (var i = 0; i < programs.length; i++) {
        var base = document.getElementById("program_1");
        var button = document.createElement("button");
        button.innerHTML = programs[i].getAttribute("WorkName");
        button.value = programs[i].getAttribute("WorkLineNo");
        //alert(programs[i].getAttribute("WorkLineNo"));
        button.setAttribute("name", programs[i].getAttribute("WorkName"));
        button.setAttribute("employee", programs[i].getAttribute("Employee"));
        button.setAttribute("class", "button button-rounded button-flat-action button-tiny");
        button.style.marginLeft = '10px';
        button.style.marginTop = '10px';
        button.style.width = button_width;
        button.style.height = '45px';
        button.onclick = function() {
            to_append_program[0] = this.value;
            to_append_program[1] = this.getAttribute("name");
            to_append_program[2] = this.getAttribute("employee");
            var hint = document.getElementById("hint_mistake");
            document.getElementById("hint_program").innerHTML = to_append_program[1];
            document.getElementById("explorer_index").getElementsByTagName("a")[3].click();
            //document.getElementById("hint_employee").innerHTML = to_append_program[2];
            $("#mistake_index").click();
        };
        button.setAttribute("data-toggle", "tooltip");
        button.setAttribute("data-placement", "top");
        button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
        base.appendChild(button);
    }
}


function OnClickIndex(input) {
    var ex = document.getElementById("explorer_index");
    var cata = ex.getElementsByTagName("li");
    for (var i = 0; i < cata.length; i++) {
        cata[i].style.display = "block";
    }
}

function OnClickInert() {
    if (current_edit_index != -1) {
        alert('请修改完记录后再添加');
        return;
    }
    var count = parseInt(document.getElementById("number").value);
    var maxcount = document.getElementById("check_num").value;
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
            if (res_mistake_no[i] == to_append_mistake[0] && res_program_no[i] == to_append_program[0]) {
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
        } else {
            if ((parseInt(res_count[pos]) + parseInt(count)) > parseInt(maxcount)) {
                alert('数据错误');
                return;
            }
            res_count[pos] = (parseInt(res_count[pos]) + parseInt(count)).toString();
        }
        flush_status();
        $("#program_index").click();
        document.getElementById("number").value = '1';
    }
    to_append_mistake = ['-1', ''];
    to_append_program = ['-1', '', ''];
    document.getElementById("hint_mistake").innerHTML = '';
    document.getElementById("hint_program").innerHTML = '';
    document.getElementById("explorer_index").getElementsByTagName("a")[1].click();
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
    for (var i = 0; i < res_mistake_no.length; i++) {
        if (res_mistake_no[i] != '-1') {
            temp_mistake_name[temp_mistake_name.length] = res_mistake_name[i];
            temp_mistake_no[temp_mistake_no.length] = res_mistake_no[i];
            temp_program_name[temp_program_name.length] = res_program_name[i];
            temp_program_no[temp_program_no.length] = res_program_no[i];
            temp_employee[temp_employee.length] = res_employee[i];
            temp_count[temp_count.length] = res_count[i];
        }
    }
    res_count = temp_count;
    res_employee = temp_employee;
    res_mistake_name = temp_mistake_name;
    res_mistake_no = temp_mistake_no;
    res_program_name = temp_program_name;
    res_program_no = temp_program_no;
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

function inputfocus(input) {
    number = input;
    //alert('s');
}

function OnClickNum(input) {
    //number = document.getElementById("search_label");
    var num = number.value;
    num = num + parseInt(input.innerHTML);
    number.value = num;
    var base = document.getElementById("mistake_4");
    base.innerHTML = '';
    if (number.id == "search_label") {
        flush_search_area(xmlfile);
    }
    number.focus();
}

function OnClickSearchDel() {

    number.value = number.value.slice(0, -1);
    var base = document.getElementById("mistake_4");
    base.innerHTML = '';
    if (number.id == "search_label") {
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
                button.setAttribute("data-toggle", "tooltip");
                button.setAttribute("data-placement", "top");
                div.style.marginLeft = '10px';
                div.style.marginTop = '10px';
                button.style.width = button_width;
                button.style.height = button_height;
                button.innerHTML = mistakes[i].getAttribute("code");
                button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
                button.setAttribute("name", mistakes[i].getAttribute("code"));
                button.value = mistakes[i].getAttribute("no");
                button.onclick = function() {
                    to_append_mistake[0] = this.value;
                    to_append_mistake[1] = this.getAttribute("name");
                    var hint = document.getElementById("hint_mistake");
                    hint.innerHTML = to_append_mistake[1];
                    //   $("#program_index").click();
                }
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
                button.setAttribute("data-toggle", "tooltip");
                button.setAttribute("data-placement", "top");

                div.style.marginLeft = '10px';
                div.style.marginTop = '10px';
                button.style.width = button_width;
                button.style.height = button_height;
                button.innerHTML = mistakes[i].getAttribute("code");
                button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
                button.setAttribute("name", mistakes[i].getAttribute("code"));
                button.value = mistakes[i].getAttribute("no");
                button.onclick = function() {
                    to_append_mistake[0] = this.value;
                    to_append_mistake[1] = this.getAttribute("name");
                    var hint = document.getElementById("hint_mistake");
                    hint.innerHTML = to_append_mistake[1];
                    //   $("#program_index").click();
                }
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
                button.setAttribute("data-toggle", "tooltip");
                button.setAttribute("data-placement", "top");
                div.style.marginLeft = '10px';
                div.style.marginTop = '10px';
                button.style.width = button_width;
                button.style.height = button_height;
                button.innerHTML = mistakes[i].getAttribute("code");
                button.setAttribute("data-original-title", "<label style = 'font-size:20px'>" + button.innerHTML + "</label>");
                button.setAttribute("name", mistakes[i].getAttribute("code"));
                button.value = mistakes[i].getAttribute("no");
                button.onclick = function() {
                    to_append_mistake[0] = this.value;
                    to_append_mistake[1] = this.getAttribute("name");
                    var hint = document.getElementById("hint_mistake");
                    hint.innerHTML = to_append_mistake[1];
                    //   $("#program_index").click();
                }
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
var conclusion = 'True';

function OnCommit() {
    if (parseInt(document.getElementById("total_num").value) < parseInt(document.getElementById("check_num").value)) {
        alert('请检查输入的批量与样本量');
        return;
    }
    if (conclusion == '') {
        alert('请选择抽验结论');
        return;
    }
    //TODO: 需要释放初始化代码
    if (res_count.length == 0) {
        if (true) {
            //TODO: 这里的判定先取消
            // if (style_measure_illeagl()) {
            //     submit();
            //     initiallize();
            // } else {
            //     alert('有数据不明确或检验次数达不到最低要求');
            // }
            submit();
            initiallize();
        } else {
            return;
        }
    } else {
        // if (style_measure_illeagl()) {
        //     submit();
        //     initiallize();
        // } else {
        //     alert('有数据不明确或检验次数达不到最低要求');
        // }
        submit();
        initiallize();
    }
}

function submit() {

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open("POST", '/commit_res_recheck/', false);
    xmlhttp.setRequestHeader("Content-type", "text/xml");
    var resultxml = 'xml=<xml><info><group>' + $("#department").find("option:selected").text() + '</group>';
    var time = new Date();
    if (window.location.search.length == 0) {
        resultxml += '<id>' + time.getFullYear().toString() + (time.getMonth() + 1).toString() + time.getDate().toString() + (time.getHours() + 1).toString() + (time.getMinutes() + 1).toString() + time.getSeconds().toString() + time.getMilliseconds().toString() + Math.floor(Math.random() * 10000).toString() + '</id>';
    } else {
        resultxml += '<id>' + content_id + '</id>';
    }
    resultxml += '<no>' + $("#batch").find("option:selected").text() + '</no>';
    resultxml += '<inspector_no>' + document.getElementById("inspector").value + '</inspector_no>';
    resultxml += '<totalnumber>' + document.getElementById("total_num").value + '</totalnumber>';
    resultxml += '<conclusion>' + conclusion + '</conclusion>';
    resultxml += '<is_recheck>' + document.getElementById('is_recheck').checked + '</is_recheck>';
    try {
        resultxml += '<size>' + document.getElementById('size_flush_select').value + '</size>';
    } catch (e) {

    }
    resultxml += '<sample>' + document.getElementById("check_num").value + '</sample></info><RC>';
    for (var i = 0; i < res_mistake_no.length; i++) {
        resultxml = resultxml + "<" + 're mistake_no' + '="' + res_mistake_no[i] + '\" program_no = \"' + res_program_no[i] + '\" count = \"' + res_count[i] + '\" program_name = \"' + res_program_name[i] + '\" mistake_name=\"' + res_mistake_name[i] + '\" />';
    }
    resultxml += "</RC></xml>&json=";
    var json = [];
    $('#partion_input table tbody tr').each(function() {
        var tds = this.getElementsByTagName('td');
        var data = [];
        if (parseFloat(tds[3].innerHTML) >= 1e-6) {
            for (var i = 4; i < tds.length; i += 2) {
                //alert(i)
                if ($.trim(tds[i].getElementsByTagName("input")[0].value) != '' && $.trim(tds[i + 1].getElementsByTagName("input")[0].value) != '') {
                    data.push([
                        $.trim(tds[i].getElementsByTagName("input")[0].value),
                        $.trim(tds[i + 1].getElementsByTagName("input")[0].value)
                    ]);
                }
            }
        } else {
            for (var i = 4; i < tds.length; i++) {
                if ($.trim(tds[i].getElementsByTagName("input")[0].value) != '') {
                    data.push(
                        [tds[i].getElementsByTagName("input")[0].value]
                    );
                }
            }
        }
        json.push({
            name: tds[0].innerHTML,
            res: data
        });
    });
    resultxml += JSON.stringify(json);
    //console.log(resultxml);
    xmlhttp.send(resultxml);
    if (window.location.search.length > 1) {
        window.close();
    }
    // alert('sss');
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
        flush_status();
    }
}
var current_edit_index = -1;

function OnClickChange() {
    if (current_edit_index == -1) {
        alert('请选择一条记录之后进行修改');
        return;
    }
    if (parseInt(document.getElementById("number").value) > parseInt(document.getElementById("check_num").value)) {
        alert('数据有误');
        return;
    }
    res_count[current_edit_index] = document.getElementById("number").value;
    res_mistake_no[current_edit_index] = to_append_mistake[0];
    res_mistake_name[current_edit_index] = to_append_mistake[1];
    res_program_name[current_edit_index] = to_append_program[1];
    res_program_no[current_edit_index] = to_append_program[0];
    res_employee[current_edit_index] = to_append_program[2];
    flush_status();
    current_edit_index = -1;
    to_append_mistake = ['-1', ''];
    to_append_program = ['-1', '', ''];
    document.getElementById("number").value = '1';
    document.getElementById("hint_mistake").innerHTML = '';
    document.getElementById("hint_program").innerHTML = '';
    //document.getElementById("hint_employee").innerHTML = '';
    document.getElementById("explorer_index").getElementsByTagName("a")[1].click();
}

function append_bald_to_table() {
    var tr = document.createElement('tr');
    tr.setAttribute('employee_no', document.getElementById('bald_add_employee').value);
    tr.setAttribute('employee_name', $('#bald_add_employee').find('option:selected').text());
    tr.setAttribute('mistake_name', $.trim($('#bald_add_mistake').find('option:selected').text()));
    tr.setAttribute('mistake_no', document.getElementById('bald_add_mistake').value);
    tr.setAttribute('count', parseInt(document.getElementById('bald_add_count').value));
    var employee = document.createElement('td');
    employee.innerHTML = $('#bald_add_employee').find('option:selected').text();
    var mistake = document.createElement('td');
    mistake.innerHTML = $('#bald_add_mistake').find('option:selected').text();
    var count = document.createElement('td');
    count.innerHTML = parseInt(document.getElementById('bald_add_count').value);
    var del = document.createElement("a");
    del.href = '#';
    del.style.float = 'right';
    del.innerHTML = '删除此行';
    del.onclick = function() {
        this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
    };
    count.appendChild(del);
    tr.appendChild(employee);
    tr.appendChild(mistake);
    tr.appendChild(count);
    document.getElementById("bald_table").getElementsByTagName('tbody')[0].appendChild(tr);
}

function bald_add() {
    if (parseInt(document.getElementById('bald_add_count').value) <= 0 || !parseInt(document.getElementById('bald_add_count').value)) {
        alert('疵点数错误');
        return;
    }
    var count = 0;
    var is_exist = false;
    var exist_row;
    var rows = document.getElementById("bald_table").getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        count += parseInt(rows[i].getAttribute('count'));
        if (rows[i].getAttribute('employee_no') == document.getElementById('bald_add_employee').value && rows[i].getAttribute('mistake_no') == document.getElementById('bald_add_mistake').value) {
            exist_row = rows[i];
            is_exist = true;
        }
    }
    count += parseInt(document.getElementById('bald_add_count').value);
    if (!is_exist) {
        append_bald_to_table()
    } else {
        exist_row.getElementsByTagName('td')[2].innerText = parseInt(exist_row.getElementsByTagName('td')[2].innerText) + parseInt(document.getElementById('bald_add_count').value);
        var del = document.createElement("a");
        del.href = '#';
        del.style.float = 'right';
        del.innerHTML = '删除此行';
        del.onclick = function() {
            this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
        };
        exist_row.getElementsByTagName('td')[2].appendChild(del);
    }
}

function bald_submit() {
    var count = 0;
    var rows = document.getElementById("bald_table").getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        count += parseInt(rows[i].getAttribute('count'));
    }
    if (!parseInt(document.getElementById("bald_count").value) || parseInt(document.getElementById("bald_count").value) < count) {
        alert('总数不正确或总数少于疵点数');
        return;
    }
    var json = 'json=';
    json += '{"count":["' + parseInt(document.getElementById("bald_count").value) + '"],"record":[';
    var has_record = false;
    $('#bald_table tbody tr').each(function() {
        has_record = true;
        json += '{"employeeno":"' + this.getAttribute('employee_no') + '",';
        json += '"employeename":"' + this.getAttribute('employee_name') + '",';
        json += '"mistakeno":"' + this.getAttribute('mistake_no') + '",';
        json += '"mistakename":"' + $.trim(this.getAttribute('mistake_name').split('.')[1]) + '",';
        json += '"count":"' + this.getAttribute('count') + '"},';
    });
    if (has_record) {
        json = json.slice(0, -1);
    }
    json += ']';
    json += '}';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                alert('提交成功');

            }
        }
        //alert(json);
    xmlhttp.open('POST', '/commit_bald_recheck/', true);
    xmlhttp.send(json);
}