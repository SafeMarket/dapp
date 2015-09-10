(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','angular-growl','ngRoute'])

app.config(function(growlProvider,$routeProvider) {
    
    growlProvider.globalTimeToLive(3000);

    $routeProvider.when('/storefronts/:addr',{
    	templateUrl:'storefront.html'
    	,controller:'StorefrontController'
    })

});

app.controller('StorefrontsController',function($scope,safemarket,$modal){
	window.safemarket = safemarket

	function openStorefrontModal(){
		var modalInstance = $modal.open({
			size: 'large',
			templateUrl: 'storefrontModal.html',
			controller: 'StorefrontModalController'
	    });
	}

	$scope.openStorefrontModal = openStorefrontModal
})

app.controller('StorefrontModalController',function($scope,safemarket,growl,$modal,$modalInstance){
	$scope.currencies = safemarket.currencies
	$scope.currency = 'USD'
	$scope.products = [{}]

	$scope.submit = function(){
		var meta = {
			name:$scope.name
			,currency:$scope.currency
			,products:$scope.products
		}
		
		try{
			safemarket.Storefront.checkMeta(meta)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		safemarket
			.Storefront.estimateGas(meta)
			.then(function(gas){
				var doContinue = confirm('Creating this storefront will require about '+gas+' gas. Continue?')
				if(!doContinue)
					simpleModal.dismiss()
				else
					safemarket
						.createStorefront(meta,gas)
						.then(function(storefront){
							window.location.hash = '/storefronts/'+storefront.addr
							simpleModal.dismiss()
						})
			})

		$modalInstance.dismiss()

		var simpleModal = $modal.open({
			size: 'large',
			templateUrl: 'simpleModal.html',
			controller: 'SimpleModalController',
			resolve: {
				title:function(){
					return 'Saving Storefront'
				}
				,body:function(){
					return 'This might take a minute or two.'
				}
			}
	    });

	}
})

app.controller('SimpleModalController',function($scope,title,body){
	$scope.title = title
	$scope.body = body
})

app.controller('StorefrontController',function($scope,safemarket,$routeParams){
	this.addr = $routeParams.addr
	try{
		$scope.storefront = safemarket.getStorefront($routeParams.addr)
	}catch(e){

	}
})

}());
