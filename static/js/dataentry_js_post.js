// JavaScript Document
var to_append_mist = ['-1', ''];
var to_append_prog = ['-1', ''];
var res_mist = [];
var res_prog = [];
var res_count = [];
var MIS_LIST = [];
var PROG_LIST = [];
var xmlfile = '<XML><info> <scan_id> 123 </scan_id><scan_count> 23 </scan_count><scan_group > 2 </scan_group><scan_total_number> 34 </scan_total_number><scan_package_id>78 </scan_package_id><scan_model>555 </scan_model></info><QC><QCQuestion code="商标订错位置" class="0" no="39"/><QCQuestion code="松紧带做反" class="0" no="31"/><QCQuestion code="刮丝" class="0" no="16" id="special"/><QCQuestion code="上错商标" class="1" no="21"/><QCQuestion code="发黄" class="0" no="40"/><QCQuestion code="断线" class="0" no="4"/><QCQuestion code="用错肩带" class="0" no="36"/><QCQuestion code="接线" class="0" no="9"/><QCQuestion code="翻杯" class="0" no="18"/><QCQuestion code="漏液" class="0" no="50"/><QCQuestion code="返线" class="0" no="8"/><QCQuestion code="掉水钻" class="0" no="45"/><QCQuestion code="缺勾" class="1" no="32"/><QCQuestion code="套灯模破洞" class="1" no="55"/><QCQuestion code="针洞" class="0" no="17"/><QCQuestion code="色差" class="0" no="22"/><QCQuestion code="9扣穿反" class="0" no="38"/><QCQuestion code="漏点烫" class="0" no="54"/><QCQuestion code="原残" class="0" no="14"/><QCQuestion code="材料用错" class="1" no="52"/><QCQuestion code="鱼线" class="1" no="15"/><QCQuestion code="包" class="1" no="29"/><QCQuestion code="片上错" class="1" no="41"/><QCQuestion code="脏污" class="0" no="5"/><QCQuestion code="穿错层" class="0" no="26"/><QCQuestion code="混号" class="1" no="28"/><QCQuestion code="毛漏" class="0" no="3"/><QCQuestion code="其它" class="0" no="35"/><QCQuestion code="漏序" class="1" no="27"/><QCQuestion code="形状差" class="0" no="10"/><QCQuestion code="拆破" class="0" no="53"/><QCQuestion code="尺寸" class="0" no="12"/><QCQuestion code="扎住胶骨" class="0" no="25"/><QCQuestion code="不对称" class="0" no="2"/><QCQuestion code="反吊坠" class="0" no="37"/><QCQuestion code="下炕" class="0" no="13"/><QCQuestion code="线毛长" class="0" no="7"/><QCQuestion code="打折" class="0" no="11"/><QCQuestion code="跳针" class="0" no="1"/><QCQuestion code="剪破" class="0" no="6"/><QCQuestion code="反商标" class="0" no="30"/><QCQuestion code="漏杯" class="0" no="19"/><QCQuestion code="勾袢绱反" class="1" no="34"/><QCQuestion code="破洞" class="1" no="33"/><QCQuestion code="反肩带/腰带" class="1" no="20"/><QCQuestion code="错序" class="0" no="46"></QC></XML>';
var page_flag = 0;
var current_menu_flag = -1;
window.onload = function() {
    //  alert('g');
    //绑定所有的内容按钮
    var content_buttons = document.getElementById("content_buttons");
    var buttons = content_buttons.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].innerHTML = '';
    }
    var tab_switchers = document.getElementsByClassName("explorer_tab_switcher");
    for (var i = 0; i < tab_switchers.length; i++) {
        tab_switchers[i].style.display = "none";
    }
}

function content_mist(str, type, no) {
    this.name = str;
    this.type = type;
    this.no = no;
}

function content_prog(str, no) {
    this.name = str;
    this.no = no;
}

function flush_info(input) { //刷新表格的函数
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            build_page(xmlhttp.responseText.toString());
        }
    }
    var hs = document.getElementById("scan_input");
    // alert('hhh');
    xmlhttp.open("GET", '/update_info/' + '?code=' + hs.value, true);
    xmlhttp.send();
}

function build_page(input) {
    var domParser = new DOMParser();
    var xmlDoc = domParser.parseFromString(input, 'text/xml'); //测试之用
    var ele = xmlDoc.getElementsByTagName('scan_id');
    var id1 = document.getElementById("scan_id");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    ele = xmlDoc.getElementsByTagName('scan_count');
    id1 = document.getElementById("scan_count");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    ele = xmlDoc.getElementsByTagName('scan_group');
    id1 = document.getElementById("scan_group");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    ele = xmlDoc.getElementsByTagName('scan_total_number');
    id1.innerHTML = ele[0].firstChild.nodeValue;
    ele = xmlDoc.getElementsByTagName('scan_package_id');
    id1 = document.getElementById("scan_package_id");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    ele = xmlDoc.getElementsByTagName('scan_model');
    id1 = document.getElementById("scan_model");
    id1.innerHTML = ele[0].firstChild.nodeValue;
    var PROG_NAME = xmlDoc.getElementsByTagName('STRING');
    var PROG_NO = xmlDoc.getElementsByTagName('NO');
    for (var i = 0; i < PROG_NO.length; i++) {
        var temp = new content_prog(PROG_NAME[i].firstChild.nodeValue, PROG_NO[i].firstChild.nodeValue);
        PROG_LIST[PROG_LIST.length] = temp;
    }
    //----------------------------------------------------------------------
    domParser = new DOMParser();
    xmlDoc = domParser.parseFromString(xmlfile, 'text/xml');
    var buttons_MIS = xmlDoc.getElementsByTagName('QCQuestion');
    //alert(buttons_MIS.length);
    var temp = [];
    //alert(buttons_MIS.length);
    var count = 0;
    for (var i = 0; i < buttons_MIS.length; i++) {
        var name = buttons_MIS[i].getAttribute("code");
        //alert(name);
        var type = buttons_MIS[i].getAttribute("class");
        var no = buttons_MIS[i].getAttribute("no");
        temp = new content_mist(name, type, no);
        //alert(temp.length);
        MIS_LIST[MIS_LIST.length] = temp;
    }

}

function OnScan(evt) {
    if (evt.keyCode == 13) {
        //     alert('hs.value')//提示输入框内的文本
        // flush_info();
        var ele = document.getElementById("scan_input");
        ele.disabled = true;
        // flush_info();
        //禁用输入框，防止二次输入
        document.getElementById("MIS_INDEX").click();
        document.getElementsByClassName("explorer_tab_switcher")[0].click(); //自动切换
    }
}

function OnClickMis_Prog(node) {
    //  alert('ss');
    to_append_mist[0] = node.value;
    to_append_mist[1] = node.innerHTML;
    flush_hint();
}

function OnClickInsert() {
    var exist = false;
    var pos = res_mist.length;
    var hs = document.getElementById("number").value;
    for (var i = 0; i < res_mist.length; i++) {
        if (res_mist[i] == to_append_mist[0] && res_prog[i] == to_append_prog[0]) {
            exist = true;
            pos = i;
            break;
        }
    }
    if (!exist) {
        res_mist[res_mist.length] = to_append_mist[0];
        res_prog[res_prog.length] = to_append_prog[0];
        res_count[res_count.length] = hs;
    } else {
        res_count[pos] = (parseInt(res_count[pos]) + parseInt(hs)).toString();
    }
    flush_status();
}

function clear_content_button() {

    var ele = document.getElementById("content_buttons");
    var buttons = ele.getElementsByTagName("ul");
    buttons[0].innerHTML = '';

}

function OnClickTabSwitchers(input) {
    alert('fd');
    clear_content_button();
	var ele = document.getElementById("content_buttons");
    var buttons = ele.getElementsByTagName("ul");
	for (var i = 0; i < MIS_LIST.length; i++) {
        //for (var j=0;j<MIS_LIST[i].length;j++){
        switch (input.value) {
        case 0:
            //alert('s');
            //alert(MIS_LIST[i][j].type);
            if (MIS_LIST[i].type == '0') {
                //alert('s');
                var newli = document.createElement("li");
                var newbutton = document.createElement("button");
                newbutton.className = "btn solid green";
                newbutton.innerHTML = MIS_LIST[i].name;
                newbutton.value = MIS_LIST[i].no;
                newbutton.onclick = function() {
                    to_append_mist[0] = this.value;
                    to_append_mist[1] = this.innerHTML;
                    var hint = document.getElementById("hint_label");
                    hint.innerHTML = to_append_mist[1] + '--' + to_append_prog[1];
                }
                newli.appendChild(newbutton);
                buttons[0].appendChild(newli);
            }
            break;
        case 2:
            //alert('s');
            //alert(MIS_LIST[i][j].type);
            if (MIS_LIST[i].type == '1') {
                //alert('s');
                var newli = document.createElement("li");
                var newbutton = document.createElement("button");
                newbutton.className = "btn solid red";
                newbutton.innerHTML = MIS_LIST[i].name;
                newbutton.value = MIS_LIST[i].no;
                newbutton.onclick = function() {
                    to_append_mist[0] = this.value;
                    to_append_mist[1] = this.innerHTML;
                    var hint = document.getElementById("hint_label");
                    hint.innerHTML = to_append_mist[1] + '--' + to_append_prog[1];
                }
                newli.appendChild(newbutton);
                buttons[0].appendChild(newli);
            }
            break;

        }
    }

    alert('g');
    if (input.value == 4) {
        for (var i = 0; i < PROG_LIST.length; i++) {
            var newli = document.createElement("li");
            var newbutton = document.createElement("button");
            newbutton.className = "btn solid red";
            newbutton.innerHTML = PROG_LIST[i].name;
            newbutton.value = PROG_LIST[i].no;
            newbutton.onclick = function() {
                // alert(this.value);
                to_append_prog[0] = this.value;
                to_append_prog[1] = this.innerHTML;
                var hint = document.getElementById("hint_label");
                hint.innerHTML = to_append_mist[1] + '--' + to_append_prog[1];
            }
            newli.appendChild(newbutton);
            buttons[0].appendChild(newli);
        }
    }
}

function OnClickMisIndex() {
    var tab_switchers = document.getElementsByClassName("explorer_tab_switcher");
    //alert(tab_switchers.length);
    tab_switchers[0].innerHTML = "轻微不良";
    tab_switchers[0].value = 0;
    tab_switchers[1].innerHTML = "严重不良";
    tab_switchers[1].value = 1;
    tab_switchers[2].innerHTML = "致命不良";
    tab_switchers[2].value = 2;
    tab_switchers[3].innerHTML = "常用疵点";
    tab_switchers[3].value = 3;
    for (var i = 0; i < tab_switchers.length; i++) {
        tab_switchers[i].style.display = "block";
    }
}

function OnClickProgIndex() {
    var tab_switchers = document.getElementsByClassName("explorer_tab_switcher");
    tab_switchers[0].innerHTML = "工序";
    tab_switchers[0].value = 4;
    tab_switchers[0].style.display = "block";
    tab_switchers[1].innerHTML = "常用工序";
    tab_switchers[1].value = 5;
    tab_switchers[1].style.display = "block";
    tab_switchers[2].style.display = "none";
    tab_switchers[3].style.display = "none";
}

function flush_status() {
    var status = document.getElementById("status_list");
    status.innerHTML = '<tr><th colspan="3">录入统计</th></tr><tr><th>工序</th><th>疵点</th><th>数量</th></tr>';
    for (var i = 0; i < res_count.length; i++) {
        var misname = document.createElement("td");
        var progname = document.createElement("td");
        var count = document.createElement("td");
        var row = document.createElement("tr");
        row.className = "status_record";
        // alert('kl');
        for (var j = 0; j < MIS_LIST.length; j++) {
            // for (var k =0;k<MIS_LIST[j].length;k++){
            if (MIS_LIST[j].no == res_mist[i]) {
                misname.innerHTML = MIS_LIST[j].name;
                break;
            }
        }

        for (var j = 0; j < PROG_LIST.length; j++) {
            if (PROG_LIST[j].no == res_prog[i]) {
                progname.innerHTML = PROG_LIST[j].name;
                break;
            }
        }
        // alert('sd');
        count.innerHTML = res_count[i];
        row.appendChild(progname);
        row.appendChild(misname);
        row.appendChild(count);
        status.appendChild(row);
    }
}
function OnClickPlus() {
    var num = document.getElementById("number");
    var number = parseInt(num.value);
    number = number + 1;
    num.value = number;
}
function OnClickMinus() {
    var num = document.getElementById("number");
    var number = parseInt(num.value);
    if (number > 1) {
        number = number - 1;
    }
    num.value = number;

}
function OnClickNum(input) {
  
   
}
function OnCommit() {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            alert(xmlhttp.responseText);
        }
    }
    // alert('hhh');
    xmlhttp.open("POST", '/commit_res/', false);
    xmlhttp.setRequestHeader("Content-type", "text/xml");
    var resultxml = "<xml>";
    for (var i = 0; i < res_mist.length; i++) {
        resultxml = resultxml + '<Record mis = "' + res_mist[i] + '" prog = "' + res_prog[i] + '" count = "' + res_count[i] + '" />';
    }
    resulexml = resultxml + "</xml>";
    xmlhttp.send(resultxml);
	 alert("connmit");
   var hs = document.getElementById("scan_input");
   hs.value="";
   hs.disabled=false;
}
//------------------------------------------------------------------------------------
