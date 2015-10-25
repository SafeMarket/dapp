(function(){

angular.module('app').controller('PaymentModalController',function($scope,addr,amount,currency,safemarket,user,growl,$modalInstance){
	$scope.addr = addr
	$scope.userCurrency = user.data.currency

	$scope.displayCurrencies = []
	if($scope.userCurrency!=='ETH')
		$scope.displayCurrencies.push('ETH')

	if(amount.greaterThan(0))
		$scope.amountInUserCurrency = safemarket.utils.convertCurrencyAndFormat(amount,{from:currency,to:user.data.currency})
	else
		$scope.amountInUserCurrency = '0'

	if(user.data.currency !=='ETH'){
		$scope.$watch('amountInUserCurrency',function(amountInUserCurrency){
			$scope.amountInEther = safemarket.utils.convertCurrencyAndFormat(amountInUserCurrency,{
				from:user.data.currency
				,to:'ETH'
			})
		})

		$scope.$watch('amountInEther',function(amountInEther){
			$scope.amountInUserCurrency = safemarket.utils.convertCurrencyAndFormat(amountInEther,{
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
			safemarket.utils.check({
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

		var amount = safemarket.utils.convertCurrency($scope.amountInUserCurrency,{from:user.data.currency,to:'WEI'})

		safemarket.utils.send($scope.addr,amount).then(function(){
			$modalInstance.close()
		})
	}
})

})();