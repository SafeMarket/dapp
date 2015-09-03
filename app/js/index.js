(function(){

var app = angular.module('app',['safemarket'])

app.controller('StorefrontsController',function($scope,safemarket){
	window.safemarket = safemarket

	$scope.storefronts = safemarket.getStorefronts()
	$scope.newStorefront = {}

	$scope.createStorefront = function(){

		safemarket
			.createStorefront($scope.newStorefront)
			.then(function(){
				$scope.storefronts = safemarket.getStorefronts()
				console.log($scope.storefronts)
			},function(){
				console.log(arguments)
			})
	}
})

}());
