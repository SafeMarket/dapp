(function(){

angular.module('app').controller('OrderBookController',function($scope,safemarket){
	$scope.orderBookEntries = []

	safemarket.OrderBookEntry.fetch($scope.filter).then(function(orderBookEntries){
		$scope.orderBookEntries = orderBookEntries
	});
})

})();