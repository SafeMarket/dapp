(function(){

angular.module('app').controller('WithdrawlModalController',function($scope,order,utils,user,growl,$modalInstance){
	$scope.addr = order.addr
	$scope.userCurrency = user.data.currency

	$scope.amountInUserCurrency = utils.convertCurrencyAndFormat(order.received,{from:'WEI',to:user.data.currency})

	if(user.data.currency !=='ETH'){
		$scope.$watch('amountInUserCurrency',function(amountInUserCurrency){
			$scope.amountInEther = utils.convertCurrencyAndFormat(amountInUserCurrency,{
				from:user.data.currency
				,to:'ETH'
			})
		})

		$scope.$watch('amountInEther',function(amountInEther){
			$scope.amountInUserCurrency = utils.convertCurrencyAndFormat(amountInEther,{
				from:'ETH'
				,to:user.data.currency
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

		var amount = utils.convertCurrency($scope.amountInUserCurrency,{from:user.data.currency,to:'WEI'})

		if(amount.greaterThan(order.received))
			amount = new BigNumber(order.received.toString())

		order.withdraw(amount).then(function(){
			$modalInstance.close()
		})
	}
})

})();