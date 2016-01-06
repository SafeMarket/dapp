angular.module('app').controller('SettingsController',function($scope,safemarket,growl,user,ticker,helpers,txMonitor){
	
	$scope.currencies = Object.keys(ticker.rates)
	
	$scope.user = user
	$scope.accounts = web3.eth.accounts

	$scope.$watch('user.data.account',function(){
		$scope.balanceInEther = web3.fromWei(web3.eth.getBalance(user.data.account))
		user.save()
	})

	$scope.$watch('user.data.currency',function(){
		user.setDisplayCurrencies()
		user.save()
	})

	$scope.submit = function(){
		user.save()
	}

	$scope.addKeypair = function(){
		$scope.isChangingKeys = true
		user.addKeypair().then(function(){

			var doSet = confirm('A new keypair has been generated. Would you like to set it as your primary key?')

			if(doSet)
				$scope.setPrimaryKeypair(user.keypairs.length-1)

			$scope.isChangingKeys = false
		})
	}

	$scope.setPrimaryKeypair = function(index){
		
		var keyData = user.keypairs[index].public.toPacketlist().write()
		
		txMonitor.propose('Set Your Primary Keypair', Keystore.setKey,[keyData]).then(function(){
			$scope.user.loadKeypair()
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
		window.location.hash = 'login'
	}

});