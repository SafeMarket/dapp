(function(){

angular.module('app').controller('SubmarketController',function($scope,$state,Submarket,user,$stateParams,modals){
	
	$scope.submarket = new Submarket($stateParams.submarketAddr,true)
	$scope.addr = $stateParams.submarketAddr
	$scope.user = user

	$scope.openSubmarketModal = function(){
		modals
			.openSubmarket($scope.submarket)
			.result.then(function(submarket){
				$scope.submarket.update()
			})
	}

	$scope.openAliasesModal = function(){
		modals
			.openAliases($scope.submarket)
			.result.then(function(){
				$scope.submarket.update()
			})
	}

	$scope.tabs = [
        { heading: "About", route:"submarket.about", active:false },
        { heading: "Stores", route:"submarket.stores", active:false },
        { heading: "Forum", route:"submarket.forum", active:false },
        { heading: "All Orders", route:"submarket.orders", active:false },
    ];

    $scope.go = function(route){
        $state.go(route);
    };

    $scope.$on("$stateChangeSuccess", function() {
        $scope.tabs.forEach(function(tab) {
            tab.active = $state.is(tab.route);
        });
    });
})


})();