(function(){

document.addEventListener("DOMContentLoaded",function (){
	document.getElementById('refreshButton').onclick = function(){
		document.getElementById('refreshIcon').classList.add('spin');
		window.location.reload();
	}
},false);

})();