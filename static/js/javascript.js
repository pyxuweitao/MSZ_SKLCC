// JavaScript Document
function OnOver (id){
	//alert('ss');
	var hs = id.getElementsByTagName("li");
	hs[0].style.background="#1380CB";
	for (var i=1;i<hs.length;i++){
		hs[i].style.display="block";
	}
}
function OnOut (id){
	//alert('ss');
	var hs = id.getElementsByTagName("li");
	hs[0].style.background="#2A95DE";
	for (var i=1;i<hs.length;i++){
		hs[i].style.display="none";
	}
}

function OnClickMIS(){
	var ele = document.getElementById("mainframe");
	ele.src = "url_dataentry";
	document.frames('mainframe').location.reload()
}

function OnClickRead(){
	var ele = document.getElementById("mainframe");
	ele.src = "Status_url";
	document.frames('mainframe').location.reload();
}