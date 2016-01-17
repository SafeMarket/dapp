( function() {

angular.module('app')
	.controller('StoreController',function($scope,$filter,$state,utils,Store,Submarket,user,$stateParams,modals,growl,helpers) {

	$scope.storeScope = $scope

	//TODO: is this line really necessary?
	$scope.affiliateCode = ""
	$scope.submarketOptions = [{addr:utils.nullAddr,label:'No escrow'}];
	$scope.submarketOption = $scope.submarketOptions[0]
	$scope.storeAddr = $stateParams.storeAddr
	$scope.submarketAddr = $stateParams.submarketAddr || utils.nullAddr;
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

		$scope.store.meta.submarketAddrs.forEach(function(submarketAddr){
			$scope.submarketOptions.push({addr:submarketAddr,label:'@'+utils.getAlias(submarketAddr)})
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

	if($stateParams.submarketAddr)
		(new Submarket($stateParams.submarketAddr)).updatePromise.then(function(submarket){
			$scope.submarket = submarket
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