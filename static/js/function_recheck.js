/**
 * Created by Administrator on 14-4-23.
 */
var xmlfile = "<?xml version='1.0'?><xml><record id='001' total='200' sample='40'><program no='01' name='工序01'><mistake2 name='致命03' no='23' count='4' /><mistake0 name='轻微01' no='01' count='1' /><mistake0 name='轻微02' no='02' count='3' /></program><program no='02' name='工序02'><mistake0 name='轻微03' no='03' employee_name='孙某' employee_no='03' count='5' program_no='03' program_name='工序3' /></program></record><record id='002' total='200' sample='40'><program no='01' name='工序01'><mistake2 name='致命03' no='23' count='4' /><mistake1 name='严重01' no='11' count='7' /><mistake1 name='严重02' no='12' count='3' /></program><program no='03' name='工序03'><mistake0 name='轻微03' no='03' count='5' /></program></record></xml>";
catalog_mistake = [];
catalog_mistake_name = [];
isstrong = [];


var res_count = [];
var res_mistake_no = [];
var res_program_no = [];
var res_id = [];

window.onload = function () {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            xmlfile = xmlhttp.responseText.toString();
            xmlfile = xmlfile.replace(/unknown/g, '未知');
            var domparser = new DOMParser();
            xmlDoc = domparser.parseFromString(xmlfile, 'text/xml');
            build_info(xmlDoc);
            build_index(xmlDoc);
            build_mistakes(xmlDoc);
            build_cells(xmlDoc);
            appendrecord(xmlDoc);
            //bind_cells();
            flush();

        }
    }
    var code = window.location.hash.toString();
    code = code.slice(1);
    //alert(code)
    xmlhttp.open("GET", '/update_recheck_info?code=' + code + '&state=' + window.location.search.toString().slice(1), true);
    xmlhttp.send();

}
function build_info(xmlDoc) {
    var hs = xmlDoc.getElementsByTagName("group")[0].firstChild.nodeValue;
    document.getElementById("group").innerHTML = "组别：" + hs;
    dept = hs;
    var hs = xmlDoc.getElementsByTagName("no")[0].firstChild.nodeValue;
    document.getElementById("no").innerHTML = "批号：" + hs;
    batch = hs;
    var hs = xmlDoc.getElementsByTagName("inspector")[0].firstChild.nodeValue;
    document.getElementById("inspector").innerHTML = "一检人员：" + hs;
    inspectorname = hs;
    var hs = xmlDoc.getElementsByTagName("date")[0].firstChild.nodeValue;
    document.getElementById("date").innerHTML = "日期：" + hs;
    inspectorno = xmlDoc.getElementsByTagName("inspectorno")[0].firstChild.nodeValue

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

function build_index(xmlDoc) {
    var mistake0 = xmlDoc.getElementsByTagName("mistake0");

    var cata_table = document.getElementById("header_line");
    //alert(cata_table);
    var temp = [];
    var length = 0;
    //alert('0');
    if (mistake0.length > 0) {
        var ele = document.createElement("td");
        for (var i = 0; i < mistake0.length; i++) {
            if (getposition(temp, mistake0[i].getAttribute("no")) == -1) {
                length = length + 1;
                temp[temp.length] = mistake0[i].getAttribute("no");
            }
        }
        ele.setAttribute("colspan", length.toString());
        ele.innerHTML = "轻微不良";
        cata_table.appendChild(ele);
    }
    var mistake1 = xmlDoc.getElementsByTagName("mistake1");

    temp = [];
    length = 0;
    if (mistake1.length > 0) {
        var ele = document.createElement("td");
        for (var i = 0; i < mistake1.length; i++) {
            if (getposition(temp, mistake1[i].getAttribute("no")) == -1) {
                length = length + 1;
                temp[temp.length] = mistake1[i].getAttribute("no");
            }
        }
        ele.setAttribute("colspan", length.toString());
        ele.innerHTML = "严重不良";
        cata_table.appendChild(ele);
    }
    temp = [];
    length = 0;
    var mistake2 = xmlDoc.getElementsByTagName("mistake2");
    //alert(mistake2.length.toString()+'----------------');
    //alert('0');
    if (mistake2.length > 0) {
        var ele = document.createElement("td");
        for (var i = 0; i < mistake2.length; i++) {
            if (getposition(temp, mistake2[i].getAttribute("no")) == -1) {
                length = length + 1;
                temp[temp.length] = mistake2[i].getAttribute("no");
            }
        }
        ele.setAttribute("colspan", length.toString());
        ele.innerHTML = "致命不良";
        cata_table.appendChild(ele);
    }
    var hs = document.createElement("td");
    hs.innerHTML = '抽验结论';
    hs.setAttribute("rowspan", '2');
    cata_table.appendChild(hs);
}
function build_mistakes(xmlDoc) {
    var record0 = xmlDoc.getElementsByTagName("mistake0");
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
    var record1 = xmlDoc.getElementsByTagName("mistake1");
    //alert(record1.length);
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
    //l2 = record1.length;
    //alert(l2);
    var record2 = xmlDoc.getElementsByTagName("mistake2");
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
function getposition(arry, target) {
    for (var i = 0; i < arry.length; i++) {
        // alert(i+"woca");
        if (arry[i] == target) {
            return i;
        }
    }
    return -1;
}
function build_cells(xmlDoc) {
    var record = xmlDoc.getElementsByTagName("record");
    var content = document.getElementById("content");
    for (var i = 0; i < record.length; i++) {
        var prog = record[i].getElementsByTagName("program");
        for (var j = 0; j < prog.length; j++) {
            if (j == 0) {
                var line = document.createElement("tr");
                var hs = document.createElement("td");
                hs.innerHTML = record[i].getAttribute("total") + '/' + record[i].getAttribute("sample");
                line.appendChild(hs);
                hs.setAttribute("rowspan", prog.length.toString());
                hs = document.createElement("td");
                hs.innerHTML = prog[j].getAttribute("name");
                line.appendChild(hs);
                hs = document.createElement("td");
                hs.setAttribute("istotal", '1');
                line.setAttribute("record_id", record[i].getAttribute("id"));
                line.appendChild(hs);
                for (var k = 0; k < catalog_mistake.length; k++) {
                    var cell = document.createElement("td");
                    cell.setAttribute("isrecord", '1');
                    cell.setAttribute("mistake_no", catalog_mistake[k].toString());
                    cell.setAttribute("program_no", prog[j].getAttribute("no"));
                    cell.setAttribute("record_id", record[i].getAttribute("id"));
                    //alert(cell.getAttribute("program_no"));
                    line.appendChild(cell);
                }
                hs = document.createElement("td");
                hs.setAttribute("rowspan", prog.length.toString());
                if (record[i].getAttribute("state") == '1') {
                    // alert(record[i].getAttribute("state")+'======================');
                    hs.innerHTML = '<select><option value = "1" selected = "selected">通过</option><option value = "0">不通过</option></select>';
                }
                else {
                    hs.innerHTML = '<select><option value = "1" >通过</option><option value = "0" selected = "selected">不通过</option></select>';
                }
                var link = document.createElement('a');
                link.href='/recheck/?content_id='+record[i].getAttribute("id")+'&dept='+dept+'&inspectorno='+inspectorno+'&inspectorname='+inspectorname+'&batch='+batch+'&total_num='+record[i].getAttribute("total")+'&sample_num='+parseInt(record[i].getAttribute("sample"));
                link.innerHTML = '<br/>修改本次检验结果';
                hs.appendChild(link);
                line.appendChild(hs);
            }
            else {
                var line = document.createElement("tr");
                var hs = document.createElement("td");
                hs.innerHTML = prog[j].getAttribute("name");
                line.appendChild(hs);
                hs = document.createElement("td");
                hs.setAttribute("istotal", '1');
                line.appendChild(hs);
                for (var k = 0; k < catalog_mistake.length; k++) {
                    var cell = document.createElement("td");
                    cell.setAttribute("isrecord", '1');
                    cell.setAttribute("mistake_no", catalog_mistake[k]);
                    cell.setAttribute("program_no", prog[j].getAttribute("no"));
                    cell.setAttribute("record_id", record[i].getAttribute("id"));
                    //alert(cell.getAttribute("program_no"));
                    line.appendChild(cell);
                }
            }
            content.appendChild(line);
        }
    }
}
function appendrecord(xmlDoc) {
    var record = xmlDoc.getElementsByTagName("record");

    for (var i = 0; i < record.length; i++) {

        var program = record[i].getElementsByTagName("program");
        for (var j = 0; j < program.length; j++) {
            var mistakes = [];
            //alert(mistakes);
            mistakes = program[j].getElementsByTagName("mistake0");
            for (var k = 0; k < mistakes.length; k++) {
                var cells = document.getElementsByTagName("td");
                for (var g = 0; g < cells.length; g++) {

                    if (cells[g].getAttribute("isrecord") == '1') {

                        if (cells[g].getAttribute("mistake_no") == mistakes[k].getAttribute("no") && cells[g].getAttribute("program_no") == program[j].getAttribute("no") && cells[g].getAttribute("record_id") == record[i].getAttribute("id")) {
                            cells[g].innerHTML = mistakes[k].getAttribute("count");
                        }
                    }
                }
            }
            mistakes = program[j].getElementsByTagName("mistake1");
            for (var k = 0; k < mistakes.length; k++) {
                var cells = document.getElementsByTagName("td");
                for (var g = 0; g < cells.length; g++) {

                    if (cells[g].getAttribute("isrecord") == '1') {

                        if (cells[g].getAttribute("mistake_no") == mistakes[k].getAttribute("no") && cells[g].getAttribute("program_no") == program[j].getAttribute("no") && cells[g].getAttribute("record_id") == record[i].getAttribute("id")) {
                            cells[g].innerHTML = mistakes[k].getAttribute("count");
                        }
                    }
                }
            }
            mistakes = program[j].getElementsByTagName("mistake2");
            for (var k = 0; k < mistakes.length; k++) {
                var cells = document.getElementsByTagName("td");
                for (var g = 0; g < cells.length; g++) {

                    if (cells[g].getAttribute("isrecord") == '1') {

                        if (cells[g].getAttribute("mistake_no") == mistakes[k].getAttribute("no") && cells[g].getAttribute("program_no") == program[j].getAttribute("no") && cells[g].getAttribute("record_id") == record[i].getAttribute("id")) {
                            cells[g].innerHTML = mistakes[k].getAttribute("count");
                        }
                    }
                }
            }
        }
    }

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

                                    var hs = xmlDoc.getElementsByTagName("record");
                                    var sample_count;
                                    for (var i = 0; i < hs.length; i++) {
                                        if (hs[i].getAttribute("id") == parent.getAttribute("record_id")) {
                                            sample_count = parseInt(hs[i].getAttribute("sample"));
                                            break;
                                        }
                                    }
                                   // alert('这个表格被修改了');
                                    //alert(gettotalcout(parent));
                                    if (parseInt(parent.innerHTML) > sample_count) {
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
function gettotalcout(node) {
    var records = node.parentNode.getElementsByTagName("td");
    var result = 0;
    for (var i = 0; i < records.length; i++) {
        if (records[i].getAttribute("isrecord") == '1') {
            if (parseInt(records[i].innerHTML)) {
                result += parseInt(records[i].innerHTML);
            }
        }
    }
    return result;
}
function flush() {
    var records = document.getElementById("content").getElementsByTagName("tr");
    for (var i = 0; i < records.length; i++) {
        var cells = records[i].getElementsByTagName("td");
        if (cells[0].getAttribute("rowspan")) {
            cells[2].innerHTML = gettotalcout(cells[0]);
        } else {
            cells[1].innerHTML = gettotalcout(cells[0]);
        }
        records[i].setAttribute("class", " ");
    }
    var foot = document.getElementsByTagName("table")[0].getElementsByTagName("tfoot")[0];
    //alert(foot);
    if (foot) {
        document.getElementsByTagName("table")[0].removeChild(foot);
    }
    foot = document.createElement("tfoot");
    document.getElementsByTagName("table")[0].appendChild(foot);
    var row = document.createElement("tr");
    var hs = document.createElement("td");
    hs.setAttribute("colspan", "2");
    hs.innerHTML = '总计';
    row.appendChild(hs);
    for (var i = 2; i < records[0].getElementsByTagName("td").length - 1; i++) {
        var temp = document.createElement("td");
        temp.innerHTML = getcount(i);
        row.appendChild(temp);
    }
    row.appendChild(document.createElement("td"));
    foot.appendChild(row);
}

function getcount(i) {
    var res = 0;
    var records = document.getElementById("content").getElementsByTagName("tr");
    for (var num = 0; num < records.length; num++) {
        if (records[num].getAttribute("record_id")) {
            //alert('rowspan');
            if (parseInt(records[num].getElementsByTagName("td")[i].innerHTML) || parseInt(records[num].getElementsByTagName("td")[i].innerHTML) == 0) {
                res += parseInt(records[num].getElementsByTagName("td")[i].innerHTML);
            }
        } else {
            //alert('non-rowspan');
            if (parseInt(records[num].getElementsByTagName("td")[i - 1].innerHTML) || parseInt(records[num].getElementsByTagName("td")[i - 1].innerHTML) == 0) {
                res += parseInt(records[num].getElementsByTagName("td")[i - 1].innerHTML);
            }
        }
    }
    return res;
}

function append_to_send(input) {
    var pos = res_count.length;
    for (var i = 0; i < res_count.length; i++) {
        if (res_mistake_no[i] == input.getAttribute("mistake_no") && res_program_no[i] == input.getAttribute("program_no") && res_id[i] == input.getAttribute("record_id")) {
            pos = i;
            break;
        }
    }
    res_count[pos] = parseInt(input.innerHTML);
    res_program_no[pos] = input.getAttribute("program_no");
    res_mistake_no[pos] = input.getAttribute("mistake_no");
    res_id[pos] = input.getAttribute("record_id");
    //alert (res_count[pos] + ' ' + res_mistake_no[pos] + ' ' + res_program_no[pos]);

}
function OnClickSubmit() {
    var resxml = 'xml=<xml>';
//    resxml += '<serialno>'+window.location.hash.slice(1)+'</serialno>';
    for (var i = 0; i < res_count.length; i++) {
        resxml += '<rc id = \"' + res_id[i] + '\" count=\"' + res_count[i] + '\" program=\"' + res_program_no[i] + '\" mistake = ' + '\"' + res_mistake_no[i] + '\" />';
    }
    var hs = document.getElementById("content").getElementsByTagName("tr");
    for (var i = 0; i < hs.length; i++) {
        if (hs[i].getAttribute("record_id")) {
            resxml += '<result id=\"' + hs[i].getAttribute("record_id") + '\" state=\"' + hs[i].getElementsByTagName("select")[0].value + '\" />';
        }
    }
    resxml += '</xml>';
    //alert(resxml);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //alert('close');
            //window.opener='';
            window.close();
        }
    }
    // alert('hhh');
    xmlhttp.open("POST", '/commit_gather_recheck_table/', true);
    xmlhttp.setRequestHeader("Content-type", "text/xml");
    xmlhttp.send(resxml);
    //alert(resxml);
}

window.onbeforeunload = function () {
    opener.location.reload(true);
}

function OnClickSave() {
    var resxml = 'xml=<xml>';
//    resxml += '<serialno>'+window.location.hash.slice(1)+'</serialno>';
    for (var i = 0; i < res_count.length; i++) {
        //alert(res_count[i]);
        resxml += '<rc id = \"' + res_id[i] + '\" count=\"' + res_count[i] + '\" program=\"' + res_program_no[i] + '\" mistake = ' + '\"' + res_mistake_no[i] + '\" />';
    }
    var hs = document.getElementById("content").getElementsByTagName("tr");
    for (var i = 0; i < hs.length; i++) {
        if (hs[i].getAttribute("record_id")) {
            resxml += '<result id=\"' + hs[i].getAttribute("record_id") + '\" state=\"' + hs[i].getElementsByTagName("select")[0].value + '\" />';
        }
    }
    resxml += '</xml>';
    //alert(resxml);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //alert('close');
            //window.opener='';
            window.location.reload(true);
        }
    }
    // alert('hhh');
    xmlhttp.open("POST", '/save_recheck_table/', true);
    xmlhttp.setRequestHeader("Content-type", "text/xml");
    xmlhttp.send(resxml);
   // alert(resxml);
}