(function(){

angular.module('app').controller('BarController',function($scope,helpers,Submarket,Store){
	$scope.submit = function(){
		var alias = $scope.alias
			,addr = AliasReg.getAddr(alias)
			,runtimeBytecode = web3.eth.getCode(addr)

		switch(runtimeBytecode){
			case Submarket.runtimeBytecode:
				window.location.hash=helpers.getUrl('submarket',addr)
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