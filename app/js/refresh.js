window.addEventListener("load",function(){

document.getElementById('refreshButton').onclick = function(){
	document.getElementById('refreshIcon').classList.add('spin');
	window.location.reload();
}

},false);