(function(){

angular.module('app').controller('MarketController',function($scope,$state,safemarket,user,$stateParams,modals){
	
	$scope.market = new safemarket.Market($stateParams.marketAddr,true)
	$scope.addr = $stateParams.marketAddr
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

	$scope.tabs = [
        { heading: "About", route:"market.about", active:false },
        { heading: "Stores", route:"market.stores", active:false },
        { heading: "Forum", route:"market.forum", active:false },
        { heading: "All Orders", route:"market.orders", active:false },
    ];

    $scope.go = function(route){
        $state.go(route);
    };

    $scope.$on("$stateChangeSuccess", function() {
        $scope.tabs.forEach(function(tab) {
            tab.active = $state.is(tab.route);
        });
    });
})


})();