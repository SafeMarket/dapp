(function(){

angular.module('app').controller('WithdrawlModalController',function($scope,order,utils,user,growl,$modalInstance){
	$scope.addr = order.addr
	$scope.userCurrency = user.getCurrency()

	$scope.amountInUserCurrency = utils.convertCurrencyAndFormat(order.received,{from:'WEI',to:user.getCurrency()})

	if(user.getCurrency() !=='ETH'){
		$scope.$watch('amountInUserCurrency',function(amountInUserCurrency){
			$scope.amountInEther = utils.convertCurrencyAndFormat(amountInUserCurrency,{
				from:user.getCurrency()
				,to:'ETH'
			})
		})

		$scope.$watch('amountInEther',function(amountInEther){
			$scope.amountInUserCurrency = utils.convertCurrencyAndFormat(amountInEther,{
				from:'ETH'
				,to:user.getCurrency()
			})
		})
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		try{
			utils.check({
				addr:$scope.addr
				,amountInUserCurrency:$scope.amountInUserCurrency
			},{
				addr:{
					presence:true
					,type:'address'
				},amountInUserCurrency:{
					presence:true
					,type:'string'
					,numericality:{
						greaterThan:0
					}
				}
			})
		}catch(e){
			return growl.addErrorMessage(e)
		}

		$scope.isSyncing = true

		var amount = utils.convertCurrency($scope.amountInUserCurrency,{from:user.getCurrency(),to:'WEI'})

		if(amount.greaterThan(order.received))
			amount = web3.toBigNumber(order.received.toString())

		order.withdraw(amount).then(function(){
			$modalInstance.close()
		})
	}
})

})();