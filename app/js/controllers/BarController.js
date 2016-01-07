(function(){

angular.module('app').controller('BarController',function($scope,helpers,Market,Store){
	$scope.submit = function(){
		var alias = $scope.alias
			,addr = AliasReg.getAddr(alias)
			,runtimeBytecode = web3.eth.getCode(addr)

		switch(runtimeBytecode){
			case Market.runtimeBytecode:
				window.location.hash=helpers.getUrl('market',addr)
				break;
			case Store.runtimeBytecode:
				window.location.hash=helpers.getUrl('store',addr)
				break;
			default:
				window.location.hash="/404/"+alias
		}
	}
})

})();