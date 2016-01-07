(function(){

angular.module('app').controller('ImportMarketModalController',function($scope,$modalInstance,growl,user,utils){


	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		try{
			utils.check({
				alias:$scope.alias
			},{
				alias:{
					presence:true
					,type:'alias'
					,aliasOfContract:'Market'
				}
			})
		}catch(e){
			return growl.addErrorMessage(e)
		}

		var marketAddr = AliasReg.getAddr($scope.alias)
			,market = new Market(marketAddr)

		if(market.owner !== user.data.account)
			return growl.addErrorMessage('You are not the owner of that market')

		user.data.marketAddrs.push(marketAddr)
		user.save()

		$modalInstance.close()

	}

})


})();