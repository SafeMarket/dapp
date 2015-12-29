(function(){

angular.module('app').controller('AffiliateController',function($scope,helpers,safemarket){
	$scope.submit = function(){
		var alias = $scope.alias
			,addr = AliasReg.getAddr(alias)
			,runtimeBytecode = web3.eth.getCode(addr)

		switch(runtimeBytecode){
			case safemarket.Market.runtimeBytecode:
				window.location.hash=helpers.getUrl('market',addr)
				break;
			case safemarket.Store.runtimeBytecode:
				window.location.hash=helpers.getUrl('store',addr)
				break;
			default:
				//A submit action is optional
				//window.location.hash="/404/"+alias
		}
	}
})

})();