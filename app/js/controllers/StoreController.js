(function(){

angular.module('app').controller('StoreController',function($scope,$filter,$state,utils,Store,Market,user,$stateParams,modals,growl,helpers){

	$scope.storeScope = $scope

	$scope.marketOptions = [{addr:utils.nullAddr,label:'No escrow'}];
	$scope.marketOption = $scope.marketOptions[0]
	$scope.storeAddr = $stateParams.storeAddr
	$scope.marketAddr = $stateParams.marketAddr || utils.nullAddr;
	$scope.productsTotal = new BigNumber(0);

	$scope.store = new Store($stateParams.storeAddr)

	$scope.tabs = [
        { heading: "About", route:"store.about", active:false },
        { heading: "Products", route:"store.products", active:false },
        { heading: "Reviews", route:"store.reviews", active:false },
        { heading: "All Orders", route:"store.orders", active:false },
    ];

    $scope.go = function(route){
        $state.go(route);
    };

    $scope.$on("$stateChangeSuccess", function() {
        $scope.tabs.forEach(function(tab) {
            tab.active = $state.is(tab.route);
        });
    });

	$scope.store.updatePromise.then(function(store){

		$scope.store.meta.marketAddrs.forEach(function(marketAddr){
			$scope.marketOptions.push({addr:marketAddr,label:'@'+utils.getAlias(marketAddr)})
		})

		$scope.store.meta.transports.forEach(function(transport){
			var priceInStoreCurrency = new BigNumber(transport.price)
				,priceInUserCurrency = utils.convertCurrency(priceInStoreCurrency,{from:$scope.store.meta.currency,to:user.data.currency})
				,priceFormatted = $filter('currency')(priceInUserCurrency,user.data.currency)
		})
		$scope.transport = store.meta.transports[0]

		$scope.$watch('store.meta.currency',function(){

			$scope.displayCurrencies = [store.meta.currency];

			if($scope.displayCurrencies.indexOf(user.data.currency) === -1)
				$scope.displayCurrencies.push(user.data.currency)

			if($scope.displayCurrencies.indexOf('ETH') === -1)
				$scope.displayCurrencies.push('ETH')
		})

	})

	if($stateParams.marketAddr)
		(new Market($stateParams.marketAddr)).updatePromise.then(function(market){
			$scope.market = market
		})

	$scope.openStoreModal = function(){
		modals
			.openStore($scope.store)
			.result.then(function(store){
				$scope.store = store
			})


	}

})

})();