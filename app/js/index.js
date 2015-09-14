(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','angular-growl','ngRoute'])

app.config(function(growlProvider,$routeProvider) {
    
    growlProvider.globalTimeToLive(3000);

    $routeProvider
    	.when('/',{
    		templateUrl:'home.html'
    	})
    	.when('/stores/:addr',{
	    	templateUrl:'store.html'
	    	,controller:'storeController'
	    })
	    .when('/markets/:addr',{
	    	templateUrl:'market.html'
	    	,controller:'MarketController'
	    })

});

app.controller('MainController',function($scope,modals){

	$scope.accounts = web3.eth.accounts
	$scope.account = web3.eth.accounts[0]

	$scope.openstoreModal = function(){
		modals.openstore()
	}

	$scope.openMarketModal = function(){
		modals.openMarket()
	}

	$scope.openSettingsModal = function(){
		modals.openSettings()
	}

})

app.controller('storeModalController',function($scope,safemarket,ticker,growl,$modal,$modalInstance,store,user){
	
	ticker.getRates().then(function(rates){
		$scope.currencies = Object.keys(rates)
	})

	if(store){
		$scope.isEditing
		$scope.name = store.meta.name
		$scope.currency = store.meta.currency
		$scope.products = store.meta.products
	}else{
		$scope.currency = user.currency
		$scope.products = [{}]
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		var meta = {
			name:$scope.name
			,currency:$scope.currency
			,products:$scope.products
		}
		
		try{
			safemarket.store.check(meta)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		if(store){
			var estimatedGas = store.contract.setMeta.estimateGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')

			if(!doContinue) return;

			$scope.isSyncing = true

			store
				.setMeta(meta)
				.then(function(store){
					$scope.isSyncing = false
					$modalInstance.close(store)
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})
		}else{
			var estimatedGas = store.estimateCreationGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')
	
			$scope.isSyncing = true

			safemarket
				.store.create(meta)
				.then(function(store){
					window.location.hash = '/stores/'+store.addr
					$modalInstance.dismiss()
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})

		}

	

	}
})

app.controller('MarketModalController',function($scope,safemarket,ticker,growl,$modal,$modalInstance,market,user){
	

	if(market){
		$scope.isEditing = true
		$scope.name = market.meta.name
		$scope.info = market.meta.info
		$scope.feeTenths = market.feeTenths
	}else{
		$scope.feeTenths = 30
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		var meta = {
			name:$scope.name
			,info:$scope.info
		}
		
		try{
			safemarket.Market.check(meta,$scope.feeTenths)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		if(market){
			var estimatedGas = market.contract.setMeta.estimateGas(meta,feeTenths)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')

			if(!doContinue) return;

			$scope.isSyncing = true

			market
				.set(meta,$scope.feeTenths)
				.then(function(market){
					$scope.isSyncing = false
					$modalInstance.close(market)
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})
		}else{
			var estimatedGas = Market.estimateCreationGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')
	
			$scope.isSyncing = true

			safemarket
				.Market.create(meta,$scope.feeTenths)
				.then(function(market){
					console.log(market)
					window.location.hash = '/markets/'+market.addr
					$modalInstance.dismiss()
				},function(error){
					console.error(error)
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})

		}

	

	}
})

app.controller('SettingsModalController',function($scope,safemarket,growl,$modal,$modalInstance){
	$scope.currencies = safemarket.currencies
	$scope.currency = 'USD'
	$scope.products = [{}]

	$scope.submit = function(){

	}
})

app.controller('SimpleModalController',function($scope,title,body){
	$scope.title = title
	$scope.body = body
})

app.controller('storeController',function($scope,safemarket,user,$routeParams,modals){

	try{
		$scope.store = new safemarket.Store($routeParams.addr)
	}catch(e){
		console.log(e)
		return
	}

	$scope.addr = $routeParams.addr
	$scope.user = user

	$scope.openstoreModal = function(){
		modals
			.openstore($scope.store)
			.result.then(function(store){
				$scope.store = store
			})


	}

	$scope.$watch('store.products',function(products){
		var total = new BigNumber(0)

		if(products)
			products.forEach(function(product){
				var subtotal = product.price.times(product.quantity)
				total = total.plus(subtotal)
			})

		$scope.total = total

	},true)

	$scope.$watch('total',function(total){
		if(!total) return


		safemarket
			.utils.convertCurrency(total,{from:$scope.store.meta.currency,to:'ETH'})
			.then(function(totalInEther){
				$scope.totalInEther = totalInEther
			},function(){
			}).catch(function(error){
				console.error(error)
			})

		safemarket
			.utils.convertCurrency(total,{from:$scope.store.meta.currency,to:user.currency})
			.then(function(totalInUserCurrency){
				$scope.totalInUserCurrency = totalInUserCurrency
			})

	})
})

app.controller('MarketController',function($scope,safemarket,user,$routeParams,modals){
	
	try{
		$scope.market = new safemarket.Market($routeParams.addr)
	}catch(e){
		console.log(e)
		return
	}

	$scope.addr = $routeParams.addr
	$scope.user = user

	$scope.openMarketModal = function(){
		modals
			.openMarket($scope.market)
			.result.then(function(market){
				$scope.market = market
			})


	}
})

app.filter('currency',function(){
	return function(amount,currency){
		if(amount===undefined) return undefined

		if(currency === 'ETH')
			return amount.toFixed(4).toString()
		else
			return amount.toFixed(2).toString()
	}
})

app.service('modals',function($modal){
	this.openstore = function(store){
		 return $modal.open({
			size: 'md'
			,templateUrl: 'storeModal.html'
			,controller: 'storeModalController'
			,resolve: {
				store:function(){
					return store
				}
			}
		});
	}

	this.openMarket = function(market){
		 return $modal.open({
			size: 'md'
			,templateUrl: 'marketModal.html'
			,controller: 'MarketModalController'
			,resolve: {
				market:function(){
					return market
				}
			}
		});
	}

	this.openSettings = function(){
		return $modal.open({
			size: 'md'
			,templateUrl: 'settingsModal.html'
			,controller: 'SettingsModalController'
	    });
	}
})

app.controller('BarController',function($scope){
	$scope.submit = function(){
		window.location.hash = '/stores/'+$scope.storeAddress
	}
})

app.service('user',function(){
	this.currency = 'EUR'
})

})();