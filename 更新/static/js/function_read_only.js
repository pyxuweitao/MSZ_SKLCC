var to_append_program_no = [];
var to_append_mistake_no = [];
var to_append_count = [];
var to_append_mistake_name = [];
var to_append_program_name = [];
var to_append_employee_name = [];
var to_append_employee_no = [];
var catalog_mistake = [];
var catalog_mistake_name = [];
var catalog_employee = [];
var inspector_no = '';
var group = '';
var no = '';
var total_count = 0;
var isstrong = [];
var catalog_programe_no = [];
window.onbeforeunload = function () {
    if (window.location.search != '?history') {
        opener.location.reload(true);
    }
};

var xmlfile = "<?xml version='1.0'?><xml><info><group>XX组</group><count>50</count><date>2014-4-2</date><no>SGG-333</no><inspector>李某某</inspector><inspector_no>检验员工号</inspector_no></info><RC><record2 name='致命03' no='23' employee_name='陆恺' employee_no='11' count='4' program_no='10' program_name='工序10' /><record0 name='轻微01' no='01' employee_name='赵某' employee_no='01' count='1' program_no='01' program_name='工序1' /><record0 name='轻微02' no='02' employee_name='钱某' employee_no='02' count='3' program_no='02' program_name='工序2' /><record0 name='轻微03' no='03' employee_name='孙某' employee_no='03' count='5' program_no='03' program_name='工序3' /><record1 name='严重01' no='11' employee_name='李某某' employee_no='04' count='7' program_no='04' program_name='工序4' /><record1 name='严重02' no='12' employee_name='钱某' employee_no='05' count='3' program_no='02' program_name='工序2' /><record1 name='严重03' no='13' employee_name='吴某' employee_no='06' count='4' program_no='05' program_name='工序5' /><record1 name='严重04' no='14' employee_name='郑某' employee_no='07' count='5' program_no='06' program_name='工序6' /><record1 name='严重05' no='15' employee_name='王某' employee_no='08' count='2' program_no='07' program_name='工序7' /><record2 name='致命01' no='21' employee_name='徐维涛' employee_no='09' count='1' program_no='08' program_name='工序8' /><record2 name='致命02' no='22' employee_name='陈旭山' employee_no='10' count='3' program_no='09' program_name='工序9' /><record2 name='致命04' no='24' employee_name='是朕' employee_no='12' count='6' program_no='11' program_name='工序11' /><record2 name='致命04' no='24' employee_name='陆恺' employee_no='11' count='4' program_no='10' program_name='工序10' /></RC></xml>";
window.onload = function () {

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            xmlfile = xmlhttp.responseText.toString();
            xmlfile = xmlfile.replace(/unknown/g, '未知');
            build_page(xmlfile);

        }
    };
    var code = window.location.hash.toString();
    code = code.slice(1, -1);
    //alert(code)
    if (window.location.search != '?history') {
        xmlhttp.open("GET", '/update_table?code=' + code + '&state=' + window.location.search.toString().slice(1), true);
        xmlhttp.send();
    }else{
        xmlhttp.open("GET", '/update_table_history?code=' + code + '&state=' + window.location.search.toString().slice(1), true);
        xmlhttp.send();
    }

};
function build_page() {
    // alert('1');
    build_table();
    flush();
    //bind_cells();
}


function build_table() {
    var domparser = new DOMParser();
    var xmlDoc = domparser.parseFromString(xmlfile, 'text/xml');
    // alert("woca");
    build_index(xmlDoc);
    build_mistakes(xmlDoc);
    build_content(xmlDoc);
    build_info(xmlDoc);
    var content = document.getElementById("content");
    var totalrow = document.createElement("tr");
    totalrow.id = 'totalline';

    var td = document.createElement("td");
    td.setAttribute("colspan", '3');
    td.innerHTML = "总计";
    totalrow.appendChild(td);

    for (var i = -1; i < catalog_mistake.length; i++) {
        var cell = document.createElement("td");
        totalrow.appendChild(cell);
    }
    content.appendChild(totalrow);
}
function build_info(xmlDoc) {
    var ele = document.getElementById("group");
    var target = xmlDoc.getElementsByTagName("group");
    ele.innerHTML = '组别：' + target[0].childNodes[0].nodeValue;
    group = target[0].childNodes[0].nodeValue;
    ele = document.getElementById("count");
    target = xmlDoc.getElementsByTagName("count");
    ele.innerHTML = '检验数量：' + target[0].childNodes[0].nodeValue;
    total_count = parseInt(target[0].childNodes[0].nodeValue);
    ele = document.getElementById("date");
    target = xmlDoc.getElementsByTagName("date");
    ele.innerHTML = '日期：' + target[0].childNodes[0].nodeValue;
    ele = document.getElementById("inspector");
    target = xmlDoc.getElementsByTagName("inspector");
    ele.innerHTML = '检验员：' + target[0].childNodes[0].nodeValue;
    ele = document.getElementById("no");
    target = xmlDoc.getElementsByTagName("no");
    ele.innerHTML = '批号：' + target[0].childNodes[0].nodeValue;
    no = target[0].childNodes[0].nodeValue;
    target = xmlDoc.getElementsByTagName("inspector_no");
    inspector_no = target[0].childNodes[0].nodeValue;
    target = xmlDoc.getElementsByTagName('check_type')[0].childNodes[0].nodeValue;
    document.getElementsByTagName("h1")[0].innerHTML = '成品检验一检记录表';
    document.getElementById('type').innerHTML += target;
}

function build_content(xmlDoc) {
    mistakes = xmlDoc.getElementsByTagName("record2");
    appendrecord(mistakes);
    var mistakes = xmlDoc.getElementsByTagName("record0");
    appendrecord(mistakes);
    mistakes = xmlDoc.getElementsByTagName("record1");
    appendrecord(mistakes);

}
function appendrecord(mistakes) {
    var base = document.getElementById("content");
    var row;
    for (var i = 0; i < mistakes.length; i++) {
        var exist = false;
        var rows = document.getElementById('content').getElementsByTagName('tr');
        for (var m = 0; m < rows.length; m++) {
            if (rows[m].getAttribute('employee_no') == mistakes[i].getAttribute('employee_no') && rows[m].getAttribute('program_no') == mistakes[i].getAttribute('program_no')) {
                row = rows[m];
                exist = true;
            }
        }
        if (!exist) {
            var row_temp = document.createElement("tr");
            row_temp.setAttribute("employee_no", mistakes[i].getAttribute("employee_no"));
            row_temp.setAttribute("program_no", mistakes[i].getAttribute("program_no"));
            var employee_name = document.createElement("td");
            employee_name.innerHTML = mistakes[i].getAttribute("employee_name");
            row_temp.appendChild(employee_name);
            var employee_no = document.createElement("td");
            employee_no.innerHTML = mistakes[i].getAttribute("employee_no");
            row_temp.appendChild(employee_no);
            var program_name = document.createElement("td");
            program_name.innerHTML = mistakes[i].getAttribute("program_name");
            row_temp.appendChild(program_name);
            row_temp.appendChild(document.createElement("td"));
            for (var j = 0; j < catalog_mistake.length; j++) {
                if (j == getposition(catalog_mistake, mistakes[i].getAttribute("no"))) {
                    var cell = document.createElement("td");
                    cell.innerHTML = mistakes[i].getAttribute("count");
                    cell.setAttribute("mistake_no", catalog_mistake[j]);
                    cell.setAttribute("mistake_name", catalog_mistake_name[j]);
                    cell.setAttribute("isrecord", '1');
                    cell.value = '0';
                    row_temp.appendChild(cell);
                } else {
                    var cell = document.createElement("td");
                    cell.setAttribute("mistake_no", catalog_mistake[j]);
                    cell.setAttribute("mistake_name", catalog_mistake_name[j]);
                    cell.innerHTML = '';
                    cell.setAttribute("isrecord", '1');
                    cell.value = '0';
                    row_temp.appendChild(cell);
                }
            }
            catalog_programe_no.push(mistakes[i].getAttribute("program_no"));
            catalog_employee.push(mistakes[i].getAttribute("employee_no"));
            base.appendChild(row_temp);
        } else {
            var pos = getposition(catalog_mistake, mistakes[i].getAttribute("no"));
            row.getElementsByTagName("td")[4 + pos].innerHTML = mistakes[i].getAttribute("count");
        }
    }
}
function getposition(arry, target) {
    for (var i = 0; i < arry.length; i++) {
        // alert(i+"woca");
        if (arry[i] == target) {
            return i;
        }
    }
    return -1;
}
function build_mistakes(xmlDoc) {
    var record0 = xmlDoc.getElementsByTagName("record0");
    var cata_table = document.getElementById("catalog");
    var l1 = 0;
    var l2 = 0;
    for (var i = 0; i < record0.length; i++) {
        if (getposition(catalog_mistake, record0[i].getAttribute("no")) == -1) {
            catalog_mistake[catalog_mistake.length] = record0[i].getAttribute("no");
            catalog_mistake_name[catalog_mistake_name.length] = record0[i].getAttribute("name");
            //alert('0');
            var ele = document.createElement("td");
            ele.innerHTML = record0[i].getAttribute("name");
            cata_table.appendChild(ele);
        }
    }
    l1 = record0.length;
    var record1 = xmlDoc.getElementsByTagName("record1");
    for (var i = 0; i < record1.length; i++) {
        if (getposition(catalog_mistake, record1[i].getAttribute("no")) == -1) {
            catalog_mistake[catalog_mistake.length] = record1[i].getAttribute("no");
            catalog_mistake_name[catalog_mistake_name.length] = record1[i].getAttribute("name");
            //alert('0');
            var ele = document.createElement("td");
            ele.innerHTML = record1[i].getAttribute("name");
            cata_table.appendChild(ele);
        }
    }
    l2 = record1.length;
    var record2 = xmlDoc.getElementsByTagName("record2");
    for (var i = 0; i < record2.length; i++) {
        if (getposition(catalog_mistake, record2[i].getAttribute("no")) == -1) {
            // alert(record2[i].getAttribute("name"));
            isstrong[isstrong.length] = record2[i].getAttribute("no");
            catalog_mistake[catalog_mistake.length] = record2[i].getAttribute("no");
            catalog_mistake_name[catalog_mistake_name.length] = record2[i].getAttribute("name");
            //alert('0');
            var ele = document.createElement("td");
            ele.innerHTML = record2[i].getAttribute("name");
            cata_table.appendChild(ele);
        }
    }
}
function build_index(xmlDoc) {
    var record0 = xmlDoc.getElementsByTagName("record0");
    var cata_table = document.getElementById("header");
    var temp = [];
    var length = 0;
    //alert('0');
    if (record0.length > 0) {
        var ele = document.createElement("td");
        for (var i = 0; i < record0.length; i++) {
            if (getposition(temp, record0[i].getAttribute("no")) == -1) {
                length = length + 1;
                temp[temp.length] = record0[i].getAttribute("no");
            }
        }
        ele.setAttribute("colspan", length.toString());
        ele.innerHTML = "轻微不良";
        cata_table.appendChild(ele);
    }
    var record1 = xmlDoc.getElementsByTagName("record1");
    temp = [];
    length = 0;
    if (record1.length > 0) {
        var ele = document.createElement("td");
        for (var i = 0; i < record1.length; i++) {
            if (getposition(temp, record1[i].getAttribute("no")) == -1) {
                length = length + 1;
                temp[temp.length] = record1[i].getAttribute("no");
            }
        }
        ele.setAttribute("colspan", length.toString());
        ele.innerHTML = "严重不良";
        cata_table.appendChild(ele);
    }
    temp = [];
    length = 0;
    var record2 = xmlDoc.getElementsByTagName("record2");
    //alert('0');
    if (record2.length > 0) {
        var ele = document.createElement("td");
        for (var i = 0; i < record2.length; i++) {
            if (getposition(temp, record2[i].getAttribute("no")) == -1) {
                length = length + 1;
                temp[temp.length] = record2[i].getAttribute("no");
            }
        }
        ele.setAttribute("colspan", length.toString());
        ele.innerHTML = "致命不良";
        cata_table.appendChild(ele);
    }
}
function flush() {

    var content = document.getElementById("content");
    var recordrows = content.getElementsByTagName("tr");
    for (var i = 0; i < recordrows.length - 1; i++) {
        var total = recordrows[i].getElementsByTagName("td")[3];
        total.innerHTML = '0';
        var records = recordrows[i].getElementsByTagName("td");
        for (var j = 4; j < records.length; j++) {
            if (!parseInt(records[j].innerHTML)) {
                total.innerHTML = 0 + parseInt(total.innerHTML);
            } else {
                total.innerHTML = parseInt(records[j].innerHTML) + parseInt(total.innerHTML);
            }
        }
    }
    for (var i = 0; i < recordrows.length - 1; i++) {
        var rs = recordrows[i].getElementsByTagName("td");
        for (var j = 0; j < rs.length; j++) {
            if ((getposition(isstrong, rs[j].getAttribute("mistake_no")) != -1) && (parseInt(rs[j].innerHTML) > 0)) {
                // alert(rs[j].getAttribute("mistake_name"));
                recordrows[i].className = "danger";
                break;
            } else {
                recordrows[i].className = "";
            }
        }
    }
    var totalline = document.getElementById("totalline");
    var cells = totalline.getElementsByTagName("td");
    for (var i = 1; i < cells.length; i++) {

        cells[i].innerHTML = getcoltotal(i);
        //if (i == 1){
        //   total_count = parseInt(cells[i].innerHTML);
        //}
    }
    document.getElementById("percent").innerHTML = "返修率：" + (gettotal() / total_count * 100).toFixed(2) + '%';

}
function gettotal() {
    var record = document.getElementById("content").getElementsByTagName("td");
    var count = 0;
    for (var i = 0; i < record.length; i++) {
        if (record[i].getAttribute("isrecord") == '1') {
            if (parseInt(record[i].innerHTML)) {
                count += parseInt(record[i].innerHTML);
            }
        }
    }
    return count;
}
function getcoltotal(index) {
    //alert(index+2);
    var content = document.getElementById("content");
    var rows = content.getElementsByTagName("tr");
    var count = 0;
    //alert(parseInt(rows[0].getElementsByTagName("td")[index+2].innerHTML));
    for (var i = 0; i < rows.length - 1; i++) {
        if (parseInt(rows[i].getElementsByTagName("td")[index + 2].innerHTML)) {
            count = count + parseInt(rows[i].getElementsByTagName("td")[index + 2].innerHTML);
        }
    }
    return count;
}
function bind_cells() {
    var body = document.getElementById("content");
    var cells = body.getElementsByTagName("td");
    for (var i = 0; i < cells.length; i++) {
        cells[i].value = '0';
        cells[i].onclick = function () {
            if (this.getAttribute("isrecord") == '1') {
                if (this.value == '0') {
                    temp = parseInt(this.innerHTML);
                    // alert(temp);
                    var value = this.innerHTML;
                    //  alert('here');
                    var input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.style.width = "50px";
                    input.value = value;
                    input.click();
                    input.onblur = function () {
                        var parent = this.parentNode;
                        this.parentNode.value = '0';
                        if (confirm("确定要修改数据吗？")) {

                            parent.innerHTML = this.value;
                            // alert(parent.innerHTML);

                            if (parseInt(parent.innerHTML) != temp) {
                                if (parseInt(parent.innerHTML) || parseInt(parent.innerHTML) == 0) {
                                    //alert('这个表格被修改了');
                                    if (gettotal() > total_count) {
                                        alert('数据有误');
                                        parent.click();
                                    } else {
                                        append_to_send(parent);
                                        //alert('s');
                                        flush();
                                    }

                                } else {
                                    alert('数据输入有误');
                                    parent.click();
                                }
                            } else {
                                return;
                            }

                        } else {
                            if (parseInt(temp)) {
                                parent.innerHTML = temp;
                            } else {
                                parent.innerHTML = '';
                            }
                        }
                    }
                    input.onkeypress = function (evt) {
                        if (evt.keyCode == 13) {
                            this.blur();

                        } else {
                            return;
                        }
                    }
                    this.innerHTML = '';
                    this.appendChild(input);
                    input.focus();
                    this.value = '1';
                }
                else {
                    return;
                }
            }
        }

    }
}

function append_to_send(input) {
    var pos = to_append_count.length;
    var par = input.parentNode;
    for (var i = 0; i < to_append_count.length; i++) {
        if (to_append_mistake_no[i] == input.getAttribute("mistake_no") && to_append_program_no[i] == par.getAttribute("program_no")) {
            pos = i;
            break;
        }
    }
    to_append_mistake_name[pos] = input.getAttribute("mistake_name");
    to_append_program_name[pos] = input.parentNode.getElementsByTagName("td")[2].innerHTML;
    to_append_employee_name[pos] = input.parentNode.getElementsByTagName("td")[0].innerHTML;
    to_append_employee_no[pos] = input.parentNode.getElementsByTagName("td")[1].innerHTML;
    to_append_count[pos] = parseInt(input.innerHTML).toString();
    to_append_mistake_no[pos] = input.getAttribute("mistake_no");
    to_append_program_no[pos] = par.getAttribute("program_no");
    //alert("append_complete");
}


function commit() {

    var res = "xml=<xml><info><state>";
    if (to_append_count.length == 0) {
        res += '0</state>' + '<no>' + window.location.hash.toString().slice(1, -1) + '</no>' + '</info></xml>';
    } else {
        res += '1</state>' + '<no>' + window.location.hash.toString().slice(1, -1) + '</no>' + '</info>';
        res += '<RC>';

        for (var i = 0; i < to_append_count.length; i++) {
            res += '<record program_no="' + to_append_program_no[i] + '\" mistake_no=\"' + to_append_mistake_no[i] + '\" count=\"' + to_append_count[i] + '\" mistake_name="' + to_append_mistake_name[i] + '" program_name="' + to_append_program_name[i] + '" employee_name="' + to_append_employee_name[i] + '" employee_no="' + to_append_employee_no[i] + '"/>';
        }
        res += '</RC></xml>';
    }
    //alert(res);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //alert('reload');
            var xmlhttp1 = new XMLHttpRequest();
            xmlhttp1.onreadystatechange = function () {
                if (xmlhttp1.readyState == 4 && xmlhttp1.status == 200) {
                    window.close();
                }
            }
            // alert('hhh');
            xmlhttp1.open("GET", '/pass_table?code=' + window.location.hash.toString().slice(1, -1), false);
            //xmlhttp.setRequestHeader("Content-type", "text/xml");
            xmlhttp1.send();
        }
    }
    // alert('hhh');
    xmlhttp.open("POST", '/save_table/', false);
    xmlhttp.setRequestHeader("Content-type", "text/xml");
    xmlhttp.send(res);
}


function pass() {
    if (confirm("确定通过？")) {
        commit();

    }
}

function OnClickSave() {
    var res = "xml=<xml><info><state>";
    if (to_append_count.length == 0) {
        res += '0</state>' + '<no>' + window.location.hash.toString().slice(1, -1) + '</no>' + '</info></xml>';
    } else {
        res += '1</state>' + '<no>' + window.location.hash.toString().slice(1, -1) + '</no>' + '</info>';
        res += '<RC>';

        for (var i = 0; i < to_append_count.length; i++) {
            res += '<record program_no="' + to_append_program_no[i] + '\" mistake_no=\"' + to_append_mistake_no[i] + '\" count=\"' + to_append_count[i] + '\" mistake_name="' + to_append_mistake_name[i] + '" program_name="' + to_append_program_name[i] + '" employee_name="' + to_append_employee_name[i] + '" employee_no="' + to_append_employee_no[i] + '"/>';
        }
        res += '</RC></xml>';
    }
    //alert(res);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            window.location.reload(true);
        }
    }
    // alert('hhh');
    xmlhttp.open("POST", '/save_table/', false);
    xmlhttp.setRequestHeader("Content-type", "text/xml");
    xmlhttp.send(res);
}