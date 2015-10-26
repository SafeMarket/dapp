(function(){
	angular.module('app').controller('ForumController',function($scope,user,safemarket){
		$scope.identities = []

		user.getAddrs().forEach(function(addr){
			var identity = {
				addr:addr
				,type:safemarket.utils.getTypeOfAddr(addr)
			}

			if(identity.type === null)
				return true;

			if(identity.type==='user')
				identity.label = addr
			else{
				identity.label = '@'+safemarket.utils.getAlias(addr)
				identity.contract = safemarket.utils.getContract(addr)
			}

			$scope.identities.push(identity)
		})

		$scope.identity = $scope.identities[0]
	})
})();