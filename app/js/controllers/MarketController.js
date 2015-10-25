(function(){

angular.module('app').controller('MarketController',function($scope,safemarket,user,$routeParams,modals){
	
	$scope.market = new safemarket.Market($routeParams.marketAddr,true)
	$scope.addr = $routeParams.marketAddr
	$scope.user = user

	$scope.openMarketModal = function(){
		modals
			.openMarket($scope.market)
			.result.then(function(market){
				$scope.market.update()
			})
	}

	$scope.openAliasesModal = function(){
		modals
			.openAliases($scope.market)
			.result.then(function(){
				$scope.market.update()
			})
	}
})


})();