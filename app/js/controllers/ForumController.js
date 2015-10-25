(function(){
	angular.module('app').controller('ForumController',function($scope,modals,user,growl){
		$scope.addrs = user.getAddrs()
	})
})();