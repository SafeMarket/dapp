(function(){

angular.module('app').controller('PaymentModalController',function($scope,addr,amount,currency,utils,user,growl,$modalInstance,txMonitor){
	$scope.addr = addr
	$scope.userCurrency = user.data.currency

	$scope.displayCurrencies = []
	if($scope.userCurrency!=='ETH')
		$scope.displayCurrencies.push('ETH')

	if(amount.greaterThan(0))
		$scope.amountInUserCurrency = utils.convertCurrencyAndFormat(amount,{from:currency,to:user.data.currency})
	else
		$scope.amountInUserCurrency = '0'

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

		var amount = utils.convertCurrency($scope.amountInUserCurrency,{from:user.getCurrency(),to:'WEI'})
			,txObject = {
				value:amount.toNumber()
				,to:addr
			}

		txObject.gas = web3.eth.estimateGas(txObject)

		txMonitor.propose('Make a Payment',web3.eth.sendTransaction,[txObject]).then(function(){
			$scope.balance = user.getBalance()
			$scope.transferAmountInUserCurrency = 0
		}).then(function(){
			$modalInstance.close()
		})
	}
})

})();