/**
 * Created by Administrator on 2014/6/4.
 */
alert('opened');
var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                alert(xmlhttp.responseText);
            }
        };
        xmlhttp.open('GET',
                '/recheck_update_batch_and_inspector/?department=%E7%94%9F%E4%BA%A7%E9%83%A81%E7%BB%84');
        xmlhttp.send();