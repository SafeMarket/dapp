(function(){
	
angular.module('app').controller('AdvertisingController',function($scope,billboard){
	$scope.billboard = billboard

	console.log(billboard)
})

})();