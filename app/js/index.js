(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','angular-growl','ngRoute','yaru22.angular-timeago'])

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
	    }).when('/orders/:orderAddr',{
	    	templateUrl:'order.html'
	    	,controller:'OrderController'
	    })

});

app.run(function(user){

})

app.controller('MainController',function($scope,modals,user){

	$scope.user = user

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

app.directive('amounts',function(utils){
	return {
		templateUrl:'amounts.html'
		,scope:{
			value:'='
			,from:'='
			,to:'='
		},link:function(scope,element,attributes){
			scope.amounts = {}

			scope.$watch('value',function(value){
				if(!value) return

				scope.to.forEach(function(currency){
					utils.convertCurrency(value,{from:scope.from,to:currency}).then(function(amount){
						scope.amounts[currency] = amount
					})
				})
			})
		}
	}
})

app.controller('StoreModalController',function($scope,$filter,safemarket,ticker,growl,$modal,$modalInstance,store,user){
	
	ticker.getRates().then(function(rates){
		$scope.currencies = Object.keys(rates)
	})

	$scope.disputeSecondsOptions = [
		{value:'0'}
		,{value:'86400'}
		,{value:'172800'}
		,{value:'259200'}
		,{value:'604800'}
		,{value:'1209600'}
		,{value:'1814400'}
		,{value:'2592000'}
	]

	$scope.disputeSecondsOptions.forEach(function(disputeSecondsOption){
		disputeSecondsOption.label = $filter('disputeSeconds')(disputeSecondsOption.value)
	})

	if(store){
		$scope.isEditing = true
		$scope.name = store.meta.name
		$scope.currency = store.meta.currency
		$scope.products = store.meta.products
		$scope.disputeSeconds = store.meta.disputeSeconds
	}else{
		$scope.currency = user.data.currency
		$scope.products = []
		$scope.disputeSeconds = "1209600"
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
			,disputeSeconds:$scope.disputeSeconds
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
	$scope.accounts = web3.eth.accounts

	$scope.submit = function(){
		user.save()
		$modalInstance.close()
	}

	$scope.addKeypair = function(){
		$scope.isAddingKeypair = true
		user.addKeypair().then(function(){
			$scope.isAddingKeypair = false
		})
	}

	$scope.deleteKeypair = function(index){
		var doContinue = confirm('Are you sure? If this keypair was used to encrypt any messages, you will no longer be able to decrypt them')
		if(!doContinue) return

		user.data.keypairs.splice(index,1)
		user.save()
		user.loadKeypairs()
	}

})

app.controller('SimpleModalController',function($scope,title,body){
	$scope.title = title
	$scope.body = body
})

app.controller('StoreController',function($scope,safemarket,user,$routeParams,modals,utils,Order,growl){

	try{
		$scope.store = new safemarket.Store($routeParams.storeAddr)

		if($routeParams.marketAddr)
			$scope.market = new safemarket.Market($routeParams.marketAddr)
	}catch(e){
		return
	}

	$scope.addr = $routeParams.storeAddr
	$scope.displayCurrencies = [$scope.store.meta.currency]

	if($scope.displayCurrencies.indexOf(user.data.currency) === -1)
		$scope.displayCurrencies.push(user.data.currency)

	if($scope.displayCurrencies.indexOf('ETH') === -1)
		$scope.displayCurrencies.push('ETH')

	$scope.createOrder = function(){
		var meta = {
			storeAddr:$scope.store.addr
			,marketAddr: $scope.market ? $scope.market.addr : utils.nullAddress
			,products:[]
			,identity:user.createIdentity()
		},merchant = $scope.store.merchant
		,admin = $scope.market ? $scope.market.amin : utils.nullAddress
		,fee = 0

		$scope.store.products.forEach(function(product){
			if(product.quantity===0) return true

			meta.products.push({
				id:product.id
				,quantity:product.quantity.toString()
			})
		})

		try{
			Order.check(meta,merchant,admin,fee)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		var estimatedGas = Order.estimateCreationGas(meta,merchant,admin,fee)
		 	,doContinue = confirm('This will take around '+estimatedGas+' gas. Continue?')

		if(!doContinue) return

		$scope.isSyncing = true
			
		Order.create(meta,merchant,admin,fee).then(function(order){
		 	window.location.hash = '/orders/'+order.addr
		})

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

		$scope.totalInStoreCurrency = total

	},true)

})

app.controller('MarketController',function($scope,safemarket,user,$routeParams,modals){
	
	try{
		$scope.market = new safemarket.Market($routeParams.marketAddr)
	}catch(e){
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

app.controller('OrderController',function($scope,safemarket,user,$routeParams,modals){
	
	try{
		$scope.order = new safemarket.Order($routeParams.orderAddr)
	}catch(e){
		return
	}

	$scope.displayCurrencies = [$scope.order.store.meta.currency]

	if($scope.displayCurrencies.indexOf(user.data.currency) === -1)
		$scope.displayCurrencies.push(user.data.currency)

	if($scope.displayCurrencies.indexOf('ETH') === -1)
		$scope.displayCurrencies.push('ETH')

	$scope.$watch('order.messages.length',function(){
		if([$scope.order.buyer,$scope.order.merchant,$scope.order.admin].indexOf(user.data.account)!==-1)
			$scope.order.decryptMessages(user.keys.private)
	})

	$scope.submitMessage = function(){
		safemarket.pgp.encrypt(user.keys.public,$scope.messageText).then(function(pgpMessage){
			$scope.order.addMessage(pgpMessage).then(function(){
				$scope.order.update()
			})
		})
	}

})

app.directive('timestamp',function(){
	return {
		scope:{timestamp:'='}
		,templateUrl:'timestamp.html'
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
			size: 'lg'
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

app.service('user',function(safemarket,$q){
	
	var userJson = localStorage.getItem('user')
		,userData = JSON.parse(userJson)
		,user = this

	if(userData){
		this.data = userData
	}else{
		this.data = {}
	}

	if(!this.data.account)
		this.data.account = web3.eth.defaultAccount ? web3.eth.defaultAccount : web3.eth.accounts[0]

	if(!this.data.currency)
		this.data.currency = 'USD'

	if(!this.data.keypairs)
		this.data.keypairs = []

	this.save = function(){
		localStorage.setItem('user',JSON.stringify(this.data))
	}

	this.generateKeypair = function(){
		var deferred = $q.defer()

		safemarket.pgp.generateKeypair().then(function(keypair){
			deferred.resolve(keypair)
		})

		return deferred.promise
	}

	this.addKeypair = function(){
		var user = this
			,deferred = $q.defer()

		this.generateKeypair().then(function(keypair){
			user.data.keypairs.push({
				private: keypair.privateKeyArmored
				,public: keypair.publicKeyArmored
				,timestamp: (new Date).getTime()
			})
			user.save()
			user.loadKeypairs()
			deferred.resolve()
		})

		return deferred.promise
	}

	this.loadKeypairs = function(){
		var keypairs = []

		if(this.data.keypairs)
			this.data.keypairs.forEach(function(keypairData){
				keypairs.push(new Keypair(keypairData))
			})
		
		this.keypairs = keypairs
	}

	this.loadKeypairs()

	function Keypair(keypairData){
		this.data = keypairData
		this.private = openpgp.key.readArmored(keypairData.private).keys[0]
		this.public = openpgp.key.readArmored(keypairData.public).keys[0]
	}

	Keypair.prototype.toggleIsRetired = function(){
		this.data.isRetired = ! this.data.isRetired
	}

})

app.filter('capitalize', function() {
 	return function(input, scope) {
    	if (input!=null)
    	input = input.toLowerCase();
    	return input.substring(0,1).toUpperCase()+input.substring(1);
  	}
});

})();