(function(){

function bindRefresh(){

	document.getElementById('refreshButton').onclick = function(){
		document.getElementById('refreshIcon').classList.add('spin');
		window.location.reload();
	}

	clearInterval(bindRefreshInterval)
}

var bindRefreshInterval = setInterval(bindRefresh,500)

document.addEventListener("DOMContentLoaded",bindRefresh,false);

})();