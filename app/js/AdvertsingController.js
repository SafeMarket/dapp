(function(){
	
angular.module('app').controller('AdvertisingController',function($scope,billboard,modals,user){

	$scope.billboard = billboard
	$scope.displayCurrencies = user.getDisplayCurrencies()

	$scope.openBillboardBidModal = function(slot){
		modals.openBillboardBid(slot).result.then(function(){
			$scope.billboard.refresh()
		})
	}

})

})();