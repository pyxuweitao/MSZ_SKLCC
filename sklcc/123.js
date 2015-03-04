/**
 * Created by xuweitao on 14-12-20.
 */
function make(id) {
    $("#nima tbody tr").each(function () {
        var tds = this.getElementsByTagName("input");
        tds[0].value = id;
        for (var i=1;i<tds.length;i++){
            tds[i].value = Math.round(Math.random()*1000);
        }
    });
}