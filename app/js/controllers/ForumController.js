(function(){
	angular.module('app').controller('ForumController',function($scope,user,safemarket){
		$scope.identities = user.getIdentities()

		$scope.identity = $scope.identities[0]
	})
})();