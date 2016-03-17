angular.module('app').controller('StoreController',function($scope,$filter,$state,utils,Store,Submarket,user,$stateParams,modals,growl,helpers,constants){

	$scope.storeScope = $scope

	$scope.submarketOptions = [{addr:constants.nullAddr,label:'No escrow',escrowFeeCentiperun:0}];
	$scope.submarketOption = $scope.submarketOptions[0]
	$scope.storeAddr = $stateParams.storeAddr
	$scope.productsTotal = web3.toBigNumber(0);

	console.log($scope)

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

    $scope.store = new Store($stateParams.storeAddr)

	$scope.store.updatePromise.then(function(store){

		console.log(store)

		$scope.store.meta.data.submarketAddrs.forEach(function(submarketAddr){
			console.log('submarketAddr',submarketAddr)
			var submarket = new Submarket(submarketAddr)
			$scope.submarketOptions.push({
				addr:submarketAddr
				,label:'@'+submarket.alias
				,escrowFeeCentiperun:submarket.infosphered.data.escrowFeeCentiperun.toNumber()
			})
		})

		
		$scope.transport = store.transports[0]

		setDisplayCurrencies()


	})

	function setDisplayCurrencies(){
		$scope.displayCurrencies = _.uniq([user.getCurrency(),$scope.store.currency,'ETH']);
	}

	$scope.openStoreModal = function(){
		modals
			.openStore($scope.store)
			.result.then(function(store){
				$scope.store = store
				setDisplayCurrencies()
			})
	}



});