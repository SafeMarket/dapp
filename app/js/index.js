(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','angular-growl','ngRoute'])

app.config(function(growlProvider,$routeProvider) {
    
    growlProvider.globalTimeToLive(3000);

    $routeProvider
    	.when('/',{
    		templateUrl:'home.html'
    	})
    	.when('/stores/:storeAddr',{
	    	templateUrl:'store.html'
	    	,controller:'StoreController'
	    })
	    .when('/markets/:marketAddr',{
	    	templateUrl:'market.html'
	    	,controller:'MarketController'
	    }).when('/markets/:marketAddr/stores/:storeAddr',{
	    	templateUrl:'store.html'
	    	,controller:'StoreController'
	    })

});

app.controller('MainController',function($scope,modals){

	$scope.accounts = web3.eth.accounts
	$scope.account = web3.eth.accounts[0]

	$scope.openStoreModal = function(){
		modals.openstore()
	}

	$scope.openMarketModal = function(){
		modals.openMarket()
	}

	$scope.openSettingsModal = function(){
		modals.openSettings()
	}

})

app.controller('StoreModalController',function($scope,safemarket,ticker,growl,$modal,$modalInstance,store,user){
	
	ticker.getRates().then(function(rates){
		$scope.currencies = Object.keys(rates)
	})

	if(store){
		$scope.isEditing
		$scope.name = store.meta.name
		$scope.currency = store.meta.currency
		$scope.products = store.meta.products
	}else{
		$scope.currency = user.data.currency
		$scope.products = []
		addProduct()
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	function addProduct(){
		$scope.products.push({
			id:BigNumber.random().times('100000000').round().toString()
		})
	}
	$scope.addProduct = addProduct

	$scope.submit = function(){
		var meta = {
			name:$scope.name
			,currency:$scope.currency
			,products:$scope.products
			,identity:user.createIdentity()
		}
		
		try{
			safemarket.Store.check(meta)
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
					$scope.$apply()
				}).catch(function(error){
					console.error(error)
				})
		}else{
			var estimatedGas = Store.estimateCreationGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')
	
			$scope.isSyncing = true

			safemarket
				Store.create(meta)
				.then(function(store){
					window.location.hash = '/stores/'+store.addr
					$modalInstance.dismiss()
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
					$scope.$apply()
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
		$scope.feePercentage = parseFloat(market.meta.feePercentage)
		$scope.bondInEther = parseInt(web3.fromWei(market.bond,'ether'))
		$scope.stores = market.meta.stores
		$scope.isOpen = market.meta.isOpen
	}else{
		$scope.feePercentage = 3
		$scope.bondInEther = 100
		$scope.stores = []
		$scope.isOpen = true
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		var meta = {
			name:$scope.name
			,info:$scope.info
			,feePercentage: $scope.feePercentage.toString()
			,isOpen:$scope.isOpen
			,stores:$scope.stores
			,identity:user.createIdentity()
		}
		,bond = web3.toWei($scope.bondInEther,'ether')
		,isOpen=!!$scope.isOpen
		
		try{
			safemarket.Market.check(meta)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		if(market){
			var estimatedGas = market.contract.setMeta.estimateGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')

			if(!doContinue) return;

			$scope.isSyncing = true

			market
				.set(meta)
				.then(function(market){
					$scope.isSyncing = false
					$modalInstance.close(market)
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
					$scope.$apply()
				}).catch(function(error){
					console.error(error)
				})
		}else{
			var estimatedGas = Market.estimateCreationGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')
	
			if(!doContinue) return;

			$scope.isSyncing = true

			safemarket
				.Market.create(meta)
				.then(function(market){
					console.log(market)
					window.location.hash = '/markets/'+market.addr
					$modalInstance.dismiss()
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
					$scope.$apply()
				}).catch(function(error){
					console.error(error)
				})

		}

	

	}
})

app.controller('SettingsModalController',function($scope,safemarket,growl,$modal,$modalInstance,user,ticker){
	
	ticker.getRates().then(function(rates){
		$scope.currencies = Object.keys(rates)
	})

	$scope.user = user

	$scope.submit = function(){
		user.save()
		$modalInstance.close()
	}
})

app.controller('SimpleModalController',function($scope,title,body){
	$scope.title = title
	$scope.body = body
})

app.controller('StoreController',function($scope,safemarket,user,$routeParams,modals){

	try{
		$scope.store = new safemarket.Store($routeParams.storeAddr)

		if($routeParams.marketAddr)
			$scope.market = new safemarket.Market($routeParams.marketAddr)
	}catch(e){
		console.log(e)
		return
	}

	$scope.addr = $routeParams.storeAddr
	$scope.user = user

	$scope.createOrder = function(){

	}

	$scope.openStoreModal = function(){
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
			.utils.convertCurrency(total,{from:$scope.store.meta.currency,to:user.data.currency})
			.then(function(totalInUserCurrency){
				$scope.totalInUserCurrency = totalInUserCurrency
			})

	})
})

app.controller('MarketController',function($scope,safemarket,user,$routeParams,modals){
	
	try{
		$scope.market = new safemarket.Market($routeParams.marketAddr)
	}catch(e){
		console.log(e)
		return
	}

	$scope.addr = $routeParams.marketAddr
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
			,controller: 'StoreModalController'
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

	this.openOrder = function(store,market){
		 return $modal.open({
			size: 'md'
			,templateUrl: 'orderModal.html'
			,controller: 'OrderModalController'
			,resolve: {
				store:function(){
					return store
				}
				,market:function(){
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

app.filter('fromWei',function(){
	return function(amount,to){
		return web3.fromWei(amount,to).toString()
	}
})

app.service('user',function(){
	
	var userJson = localStorage.getItem('user')
		,userData = JSON.parse(userJson)

	if(userData){
		this.data = userData
	}else{
		this.data = {}
	}

	if(!this.data.currency)
		this.data.currency = 'USD'

	if(!this.data.identities)
		this.data.identities = []

	this.save = function(){
		localStorage.setItem('user',JSON.stringify(this.data))
	}

	this.createIdentity = function(){
		var identity = web3.shh.newIdentity()
		
		this.data.identities.push(identity)
		this.save()

		return identity
	}


})

})();