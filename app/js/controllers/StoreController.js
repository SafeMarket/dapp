(function(){

angular.module('app').controller('StoreController',function($scope,$filter,safemarket,user,$routeParams,modals,growl,helpers){

	$scope.storeScope = $scope

	$scope.marketOptions = [{addr:safemarket.utils.nullAddr,label:'No escrow'}];
	$scope.marketOption = $scope.marketOptions[0]
	$scope.storeAddr = $routeParams.storeAddr
	$scope.marketAddr = $routeParams.marketAddr || safemarket.utils.nullAddr;
	$scope.productsTotal = new BigNumber(0);

	$scope.store = new safemarket.Store($routeParams.storeAddr)

	$scope.store.updatePromise.then(function(store){

		$scope.store.meta.marketAddrs.forEach(function(marketAddr){
			$scope.marketOptions.push({addr:marketAddr,label:'@'+safemarket.utils.getAlias(marketAddr)})
		})

		$scope.store.meta.transports.forEach(function(transport){
			var priceInStoreCurrency = new BigNumber(transport.price)
				,priceInUserCurrency = safemarket.utils.convertCurrency(priceInStoreCurrency,{from:$scope.store.meta.currency,to:user.data.currency})
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

	if($routeParams.marketAddr)
		(new safemarket.Market($routeParams.marketAddr)).updatePromise.then(function(market){
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