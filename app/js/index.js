(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','angular-growl','ngRoute'])

app.config(function(growlProvider,$routeProvider) {
    
    growlProvider.globalTimeToLive(3000);

    $routeProvider
    	.when('/',{
    		templateUrl:'home.html'
    	})
    	.when('/storefronts/:addr',{
	    	templateUrl:'storefront.html'
	    	,controller:'StorefrontController'
	    })

});

app.controller('MainController',function($scope,modals){

	$scope.accounts = web3.eth.accounts
	$scope.account = web3.eth.accounts[0]

	$scope.openStorefrontModal = function(){
		modals.openStorefront()
	}

	$scope.openCourtModal = function(){
		modals.openCourt()
	}

	$scope.openSettingsModal = function(){
		modals.openSettings()
	}

})

app.controller('StorefrontModalController',function($scope,safemarket,ticker,growl,$modal,$modalInstance,storefront,user){
	
	ticker.getRates().then(function(rates){
		$scope.currencies = Object.keys(rates)
	})

	if(storefront){
		$scope.isEditing
		$scope.name = storefront.meta.name
		$scope.currency = storefront.meta.currency
		$scope.products = storefront.meta.products
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
			safemarket.Storefront.check(meta)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		if(storefront){
			var estimatedGas = storefront.contract.setMeta.estimateGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')

			if(!doContinue) return;

			$scope.isSyncing = true

			storefront
				.setMeta(meta)
				.then(function(storefront){
					$scope.isSyncing = false
					$modalInstance.close(storefront)
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})
		}else{
			var estimatedGas = Storefront.estimateCreationGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')
	
			$scope.isSyncing = true

			safemarket
				.Storefront.create(meta)
				.then(function(storefront){
					window.location.hash = '/storefronts/'+storefront.addr
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

app.controller('CourtModalController',function($scope,safemarket,ticker,growl,$modal,$modalInstance,court,user){
	

	if(court){
		$scope.isEditing
		$scope.name = court.meta.name
		$scope.info = court.meta.info
		$scope.feeTenths = $scope.feeTenths
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
			safemarket.Court.check(meta,feeTenths)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		if(court){
			var estimatedGas = court.contract.setMeta.estimateGas(meta,feeTenths)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')

			if(!doContinue) return;

			$scope.isSyncing = true

			court
				.set(meta,feeTenths)
				.then(function(court){
					$scope.isSyncing = false
					$modalInstance.close(court)
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})
		}else{
			var estimatedGas = Court.estimateCreationGas(meta)
				,doContinue = confirm('This will take about '+estimatedGas+' gas. Continue?')
	
			$scope.isSyncing = true

			safemarket
				.Court.create(meta,feeTenths)
				.then(function(storefront){
					window.location.hash = '/storefronts/'+court.addr
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

app.controller('StorefrontController',function($scope,safemarket,user,$routeParams,modals){
	$scope.addr = $routeParams.addr
	$scope.user = user

	$scope.openStorefrontModal = function(){
		modals
			.openStorefront($scope.storefront)
			.result.then(function(storefront){
				$scope.storefront = storefront
			})


	}

	try{
		$scope.storefront = new Storefront($routeParams.addr)
	}catch(e){
		console.log(e)
		return
	}

	$scope.$watch('storefront.products',function(products){
		var total = new BigNumber(0)

		if(products)
			products.forEach(function(product){
				var subtotal = product.price.times(product.quantity)
				total = total.plus(subtotal)
			})

		$scope.total = total

	},true)

	$scope.$watch('total',function(total){
		console.log(total)
		if(!total) return

		console.log('convert')

		safemarket
			.utils.convertCurrency(total,{from:$scope.storefront.meta.currency,to:'ETH'})
			.then(function(totalInEther){
				console.log('ether',totalInEther)
				$scope.totalInEther = totalInEther
			},function(){
				console.log('x')
			}).catch(function(error){
				console.error(error)
			})

		safemarket
			.utils.convertCurrency(total,{from:$scope.storefront.meta.currency,to:user.currency})
			.then(function(totalInUserCurrency){
				$scope.totalInUserCurrency = totalInUserCurrency
			})

	})
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
	this.openStorefront = function(storefront){
		 return $modal.open({
			size: 'md'
			,templateUrl: 'storefrontModal.html'
			,controller: 'StorefrontModalController'
			,resolve: {
				storefront:function(){
					return storefront
				}
			}
		});
	}

	this.openCourt = function(court){
		 return $modal.open({
			size: 'md'
			,templateUrl: 'courtModal.html'
			,controller: 'CourtModalController'
			,resolve: {
				court:function(){
					return court
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
		window.location.hash = '/storefronts/'+$scope.storefrontAddress
	}
})

app.service('user',function(){
	this.currency = 'EUR'
})

})();