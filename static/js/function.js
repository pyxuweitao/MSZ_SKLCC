var to_append_program_no = [];
var to_append_mistake_no = [];
var to_append_count = [];
var to_append_mistake_name = [];
var to_append_program_name = [];
var to_append_employee_name = [];
var to_append_employee_no = [];
var catalog_mistake = [];
var catalog_mistake_name = [];
var catalog_programe_no = [];
var catalog_employee = [];
var inspector_no = '';
var group = '';
var no = '';
var total_count = 0;
var isstrong = [];
window.onbeforeunload = function () {
    opener.location.reload(true);
};
var is_shown = false;
var xmlfile = '';
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
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;height:34px;" onclick = "return onclickpadel()"><span class="glyphicon glyphicon-arrow-left"></span></button>';
key_pass += '<button type = "button" class="btn btn-default" style="margin-right: 10px;margin-bottom: 5px;height:34px;" onclick="return onclickfin()"><span class="glyphicon glyphicon-ok"></span></button>';
function onclickpano(n){
    document.getElementById('change_num').value = document.getElementById('change_num').value + parseInt(n.innerHTML);
    document.getElementById('change_num').focus();
}
function onclickpadel (n) {
    document.getElementById('change_num').value = document.getElementById('change_num').value.slice(0,-1);
    document.getElementById('change_num').focus();
}
function onclickfin(n){
    var num = parseInt(document.getElementById('change_num').value);
    if ((num || num == 0) && (num <= total_count)){
        var par = document.getElementById('change_num').parentNode;
        document.getElementById('change_num').parentNode.innerHTML = num;
        change_num.value = '';
        is_shown = false;
        flush();
        append_to_send(par);
        $('#change_num').popover('hide');
        //total_count = gettotal();
    }else{
        alert('数据有误');
        $('#change_num').popover('show');
         document.getElementById('change_num').focus();
    }
}
function flush_barcode(n){
     var domparser = new DOMParser();
    var xmlDoc = domparser.parseFromString(n, 'text/xml');
    var list = xmlDoc.getElementsByTagName("barcode");
    var table = document.createElement("table");
    $(table).addClass("table table-bordered");
    var temp = document.createElement("tr");
    for (var i = 0;i<list.length;i++){
        var x = document.createElement("td");
        x.innerHTML = list[i].getAttribute("code");
        temp.appendChild(x);
        if ((i+1)%7 == 0){
            table.appendChild(temp);
            temp = document.createElement("tr");
        }
    }
    if (temp.innerHTML != ""){
        table.appendChild(temp);
    }
    document.getElementById("barcode").innerHTML = "本单包含的条码：<br>"
    document.getElementById("barcode").appendChild(table);
    //document.getElementById("barcode").innerHTML = temp;
}
window.onload = function () {
    document.getElementsByTagName('body')[0].appendChild(change_num);
    $('#change_num').popover({
        animation:true,
        content:key_pass,
        trigger:'manual',
        placement:'bottom',
        html:true,
        title:'数量修改'
    });
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            xmlfile = xmlhttp.responseText.toString();
            xmlfile = xmlfile.replace(/unknown/g, '未知');
            build_page(xmlfile);
            flush_barcode(xmlfile);
        }
    }
    var code = window.location.hash.toString();
    code = code.slice(1, -1);
    //alert(code)
    xmlhttp.open("GET", '/update_table?code=' + code + '&state=' + window.location.search.toString().slice(1), true);
    xmlhttp.send();

}
function build_page() {
    // alert('1');
    build_table();
    flush();
    bind_cells();
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
var change_num = document.createElement('input');
change_num.id = 'change_num';
change_num.style.width = '50px';
change_num.onchange = function(event){
    event.stopPropagation();
}
function bind_cells() {
    var body = document.getElementById("content");
    var cells = body.getElementsByTagName("td");
    for (var i = 0; i < cells.length; i++) {
        cells[i].value = '0';
        cells[i].onclick = function (event) {
            if(event.target.getAttribute('isrecord') == '1'){
                if (!is_shown){
                    this.innerHTML = '';
                    this.appendChild(change_num);
                    $('#change_num').popover('show');
                    change_num.focus();
                    is_shown = true;
                }
            }
        }
    }
}

function append_to_send(input) {
    //alert(input.getAttribute('employee_no'));
    var pos = to_append_count.length;
    var par = input.parentNode;
    for (var i = 0; i < to_append_count.length; i++) {
        if (to_append_mistake_no[i] == input.getAttribute("mistake_no") && to_append_program_no[i] == par.getAttribute("program_no")) {
            pos = i;
            break;
        }
    }
    to_append_mistake_name[pos] = input.getAttribute("mistake_name");
    to_append_program_no[pos] = par.getAttribute("program_no");
    if (to_append_program_no[pos] == '0') {
        to_append_program_name[pos] = 'unknown';
        to_append_employee_name[pos] = 'unknown';
        to_append_employee_no[pos] = 'unknown';
    } else {
        to_append_program_name[pos] = input.parentNode.getElementsByTagName("td")[2].innerHTML;
        to_append_employee_name[pos] = input.parentNode.getElementsByTagName("td")[0].innerHTML;
        to_append_employee_no[pos] = input.parentNode.getElementsByTagName("td")[1].innerHTML;
    }

    //to_append_employee_no[pos] = input.parentNode.getElementsByTagName("td")[1].innerHTML;
    to_append_count[pos] = parseInt(input.innerHTML).toString();
    to_append_mistake_no[pos] = input.getAttribute("mistake_no");

}

function OnClickSubmit() {
    if (!is_shown) {
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
        // alert(res);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //alert('close');
                //window.opener='';
                window.close();
            }
        }
        // alert('hhh');
        xmlhttp.open("POST", '/commit_table/', false);
        xmlhttp.setRequestHeader("Content-type", "text/xml");
        xmlhttp.send(res);
    }else{
        alert('数据修改中');
    }
}

function OnClickSave() {
    if (!is_shown) {
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
                window.location.reload(true);
            }
        }
        // alert('hhh');
        xmlhttp.open("POST", '/save_table/', false);
        xmlhttp.setRequestHeader("Content-type", "text/xml");
        xmlhttp.send(res);
    }else{
        alert('数据修改中');
    }
}