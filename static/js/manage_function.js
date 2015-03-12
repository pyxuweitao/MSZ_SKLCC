window.onload = function () {
    var options = {
        animation: true,
        trigger: 'hover' //触发tooltip的事件
    };
    $('.user_info').tooltip(options);
    var index = parseInt(window.location.hash.slice(1));

    var tabs = document.getElementById("navs").getElementsByTagName("a");
    if (index || index == 0) {
        tabs[index].click();
    }
    // alert(window.location.search.slice(1).length);
    if (window.location.search.slice(1).length != 0) {
        alert(decodeURI(window.location.search.slice(1)));
    }
    document.getElementById('add_user_info_id').onkeyup = function(event){
        event.stopPropagation();
        document.getElementById('account_name').value = document.getElementById('add_user_info_id').value;
    };
    $(".authority_button").popover();
    $("#add_user_authority_copy").combobox();
    $('#authority_table').DataTable({
        "oLanguage": {
            "sLengthMenu": "每页显示 _MENU_ 条记录", "sZeroRecords": "对不起，查询不到任何相关数据",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录", "sInfoEmtpy": "找不到相关数据",
            "sInfoFiltered": "数据表中共为 _MAX_ 条记录)",
            "sProcessing": "正在加载中...",
            "sSearch": "搜索",
            "sUrl": "",
            "oPaginate": {
                "sFirst": "第一页",
                "sPrevious": " 上一页 ",
                "sNext": " 下一页 ",
                "sLast": " 最后一页 " }
        },
        'bDestroy': true,
        'bRetrieve': true
    });
    $('#authority_table tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected');
    });

};
var authority_list = -1;
function onclickchangeuser(input) {
    var parent = input.parentNode;
    var inputs = parent.getElementsByTagName("input");
    var isempty = false;
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value.replace(/\s/ig, "") == '' && i != 2) {
            isempty = true;
        }
    }
    if (!isempty) {
        if (confirm('确定提交？')) {
            input.parentNode.submit();
            document.getElementById("change_info_dismiss").click();
        }
    } else {
        alert('有选项未填写');
    }
}

function OnClickUserInfo(input) {
    var info = input.getElementsByTagName('td');
    document.getElementById("change_user_info_id").value = info[0].innerHTML;
    document.getElementById("change_user_info_name").value = info[1].innerHTML;
    document.getElementById("change_user_info_account").value = info[2].innerHTML;

    document.getElementById("user_change_activater").click();
}

function onclickadduser(input) {
    var inputs = input.parentNode.parentNode.getElementsByTagName("input");
    var isempty = false;
    //fixed by xuweitao
    //for (var i = 0; i < inputs.length; i++) {
    //跳过两个Input，从...复制权限一栏可以不填
    for (var i = 2; i < inputs.length; i++) {
        if (inputs[i].value.replace(/\s/ig, "") == '') {
            isempty = true;
        }
    }
    if (!isempty) {
        input.parentNode.parentNode.parentNode.submit();
    } else {
        alert("有项目未填写");
    }
}

function ip_port_change_button(input) {
    var inputs = input.parentNode.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
    }
    input.parentNode.getElementsByTagName('button')[1].disabled = false;

}

function ondeleteuser(input) {
    // var user_code = input.parentNode.getElementsByTagName("input")[0].value;
    if (confirm('确定要删除用户？')) {
        input.parentNode.getElementsByTagName("input")[1].value = '';
        input.parentNode.submit();
        document.getElementById("change_info_dismiss").click();
    }
}

function onclickdeptinfo(input) {
    // alert('s');
    info = input.getElementsByTagName("td");
    document.getElementById("dept_change_no").value = info[0].innerHTML;
    document.getElementById("dept_change_name").value = info[1].innerHTML;
    document.getElementById("dept_change_activator").click();

}

function onclickchangedept() {
    var form = document.getElementById("dept_change_form");
    var inputs = form.getElementsByTagName("input");
    if (inputs[0].value.replace(/\s/ig, "") != '' && inputs[1].value.replace(/\s/ig, "") != '') {
        form.submit();
    } else {
        alert('有项目尚未填写');
    }
}

function onclickdeletedept() {
    if (confirm('确定删除部门？')) {
        var form = document.getElementById("dept_change_form");
        var inputs = form.getElementsByTagName("input");
        inputs[1].value = '';
        form.submit();
    }
}
function onclickadddept() {
    var form = document.getElementById("dept_add_form");
    var inputs = form.getElementsByTagName("input");
    if (inputs[0].value.replace(/\s/ig, "") != '' && inputs[1].value.replace(/\s/ig, "") != '') {
        form.submit();
    } else {
        alert('有项目尚未填写');
    }
}


function onchooseall(input) {
    var hs = input.parentNode.getElementsByTagName("input");
    for (var i = 1; i < hs.length; i++) {
        hs[i].checked = input.checked;
    }
}

function onclickaddauthority(input) {
    document.getElementById("authority_change_username").value = input.parentNode.parentNode.getElementsByTagName("td")[0].innerHTML;
    var authorities = input.parentNode.parentNode.getElementsByTagName("td")[3].getElementsByTagName("label");
    var items = document.getElementById("authority_change_form").getElementsByTagName("input");
    for (var i = 0; i < items.length; i++) {
        items[i].checked = false;
    }
    for (var i = 0; i < authorities.length; i++) {
        var range = authorities[i].getAttribute("range").split("&");
        //alert(range);
        var id = authorities[i].getAttribute("no");
        for (var j = 0; j < range.length; j++) {
            for (var k = 0; k < items.length; k++) {
                if (items[k].value.split(">")[0] == id && items[k].value.split(">")[1] == range[j]) {
                    items[k].checked = true;
                }
            }
        }
    }
    document.getElementById("authority_change_activater").click();
}

function authority_filter_work() {
    var search_tar = [];
    $("#authority_filter input").each(function () {
        if (this.checked) {
            search_tar.append(this.value);
        }
    });
    $('#authority_table tbody tr').each(function () {

    });
}

function onclickauthority_change_mass() {
    $('#changeauthority_mass').modal('show');
}

function change_mass_auth_sub() {
    var options = document.getElementById("changeauthority_mass").getElementsByTagName('input');
    var res = '';
    for (var i = 0; i < options.length; i++) {
        if (options[i].name == 'item' && options[i].checked == true) {
            res += '&item=' + options[i].value;
        }
    }
    $('#authority_table tbody tr.selected').each(function () {
        var ajax_request = '/change_authority/';
        res += '&username='+this.getElementsByTagName('td')[0].innerHTML;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('POST', ajax_request, false);
        xmlHttp.send(res);
    });
    window.location.reload(1);

}

function flush_rule(m) {
    var options = m.parentNode.parentNode.getElementsByTagName('select');
    var td1 = document.createElement('td');
    td1.innerHTML = options[0].options[options[0].selectedIndex].text;
    td1.setAttribute('no', options[0].value);
    var td2 = document.createElement('td');
    td2.innerHTML = options[1].options[options[1].selectedIndex].text;
    td2.setAttribute('no', options[1].value);
    var a = document.createElement('a');
    a.style.float = '#';
    a.href = '#';
    a.onclick = function () {
        this.parentNode.parentNode.removeChild(this.parentNode.parentNode);
        flush_rule(m);
    };
    var tr = document.createElement('tr');
    tr.appendChild(td1);
    tr.appendChild(td2);
    var ops = options[0].getElementsByTagName('option');
    for (var i = 0; i < ops.length; i++) {
        ops[i].style.display = 'block';
    }
    for (var i = 0; i < ops.length; i++) {
        var rows = document.getElementById('miss_reward_man_table').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        for (var m = 0; m < rows.length; m++) {
            if (rows[m].getElementsByTagName('td')[0].getAttribute('no') == ops[i].value) {
                ops[i].style.display = 'none';
            } else {
                ops[i].selected = true;
            }
        }
    }
}


function onappendreward_re(m) {
    var options = m.parentNode.parentNode.getElementsByTagName('select');
    var td1 = document.createElement('td');
    td1.innerHTML = options[0].options[options[0].selectedIndex].text;
    td1.setAttribute('no', options[0].value);
    var td2 = document.createElement('td');
    td2.innerHTML = options[1].options[options[1].selectedIndex].text;
    td2.setAttribute('no', options[1].value);
    var a = document.createElement('a');
    a.style.float = 'right';
    a.href = '#';
    a.innerHTML = '删除';
    a.onclick = function () {
        this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
    };
    td2.appendChild(a);
    var tr = document.createElement('tr');
    tr.appendChild(td1);
    tr.appendChild(td2);
    var exist = false;

    var rows = document.getElementById('miss_reward_man_table').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var m = 0; m < rows.length; m++) {
        if (rows[m].getElementsByTagName('td')[0].getAttribute('no') == options[0].value) {
            alert('已经存在此人');
            exist = true;
        }
    }

    if (!exist) {
        document.getElementById('miss_reward_man_table').getElementsByTagName('tbody')[0].appendChild(tr);

    }
}
function rule_sub() {
    var rows = document.getElementById('miss_reward_man_table').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    var res = '';
    for (var i = 0; i < rows.length; i++) {
        res += '&item=' + rows[i].getElementsByTagName('td')[0].getAttribute('no') + '>' + rows[i].getElementsByTagName('td')[0].innerHTML;
        res += '>' + rows[i].getElementsByTagName('td')[1].getAttribute('no')
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', '/add_rule/?' + res, false);
    xmlhttp.send();
    alert('修改成功');
    window.location.reload(1);
}