(function(){

angular.module('app').controller('ResolutionModalController',function($scope,$modalInstance,order,user){

	$scope.order = order
	$scope.percentBuyerRaw = .5

	var multipler = Math.pow(10,10)

	$scope.$watch('percentBuyerRaw',function(percentBuyerRaw){
		$scope.percentBuyer = web3.toBigNumber(parseInt(percentBuyerRaw*multipler)).div(multipler)
		$scope.percentStoreOwner = $scope.percentBuyer.minus(1).times(-1)
	})

	$scope.displayCurrencies = [user.getCurrency()]

	if(user.getCurrency()!=='ETH')
		$scope.displayCurrencies.push('ETH')

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		$scope.isSyncing = true
		order.resolve($scope.percentBuyer.times(100).round()).then(function(){
			$modalInstance.close()
		})
	}

})


})();