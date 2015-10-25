(function(){

angular.module('app').controller('SettingsModalController',function($scope,safemarket,growl,$modal,$modalInstance,user,ticker,helpers,modals){
	
	$scope.currencies = Object.keys(ticker.rates)
	
	$scope.user = user
	$scope.accounts = web3.eth.accounts

	$scope.$watch('user.data.account',function(){
		$scope.balanceInEther = web3.fromWei(web3.eth.getBalance(user.data.account))
	})

	$scope.$watch('user.data.currency',function(){
		$scope.displayCurrencies = [user.data.currency]

		if(user.data.currency!=='ETH')
			$scope.displayCurrencies.push('ETH')
	})

	$scope.submit = function(){
		user.save()
		$modalInstance.close()
	}

	$scope.addKeypair = function(){
		$scope.isChangingKeys = true
		user.addKeypair().then(function(){

			var doSet = confirm('A new keypair has been generated. Would you like to set it as your primary key?')

			if(doSet)
				$scope.setPrimaryKeypair(user.keypairs.length-1)
			else
				$scope.isChangingKeys = false
		})
	}

	$scope.setPrimaryKeypair = function(index){

		var keyData = user.keypairs[index].public.toPacketlist().write()
			,estimatedGas = Keystore.setKey.estimateGas(keyData)
			,doContinue = helpers.confirmGas(estimatedGas)

		if(!doContinue) return

		$scope.isChangingKeys = true

		safemarket.Key.set(keyData).then(function(){
			$scope.user.loadKeypair()
			$scope.isChangingKeys = false
		})
	}

	$scope.deleteKeypair = function(index){
		var doContinue = confirm('Are you sure? If this keypair was used to encrypt any messages, you will no longer be able to decrypt them')
		if(!doContinue) return

		user.data.keypairs.splice(index,1)
		user.save()
		user.loadKeypairs()
	}

	$scope.reset = function(){
		var doContinue = confirm('Are you sure? This will delete all the SafeMarket data on this computer.')
		if(!doContinue) return

		user.reset()
		user.logout()
		$modalInstance.dismiss('cancel')
	}

})

})();