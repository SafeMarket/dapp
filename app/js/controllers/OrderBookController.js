(function(){

angular.module('app').controller('OrderBookController',function($scope,OrderBookEntry){
	$scope.orderBookEntries = []

	OrderBookEntry.fetch($scope.filter).then(function(orderBookEntries){
		$scope.orderBookEntries = orderBookEntries
	});
})

})();