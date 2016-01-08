(function(){
	angular.module('app').controller('ForumController',function($scope,user,utils){
		$scope.identities = []

		user.getAddrs().forEach(function(addr){
			var identity = {
				addr:addr
				,type:utils.getTypeOfAddr(addr)
			}

			if(identity.type === null)
				return true;

			if(identity.type==='user')
				identity.label = addr
			else{
				identity.label = '@'+utils.getAlias(addr)
				identity.contract = utils.getContract(addr)
			}

			$scope.identities.push(identity)
		})

		$scope.identity = $scope.identities[0]
	})
})();