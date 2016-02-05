angular.module('app').controller('SettingsModalController',function($scope,growl,user,ticker,helpers,txMonitor,utils,$modalInstance,Keystore){
	
	$scope.seed = user.getData().seed
	$scope.accounts = user.getAccounts()
	$scope.account = user.getAccount()
	$scope.currencies = Object.keys(ticker.rates)
	$scope.currency = user.getCurrency()

	$scope.recipientTypes = {
		internal:'One of my SafeMarket accounts'
		,external:'An external account'
	}
	$scope.recipientType = 'internal'
	$scope.internalRecipient = $scope.accounts[0]
	$scope.externalRecipient = ''
	$scope.amountTypes = {
		everything:'Transfer everything'
		,fixed:'A fixed amount'
	}
	$scope.amountType = 'everything'
	$scope.transferAmountInUserCurrency = 0 

	$scope.$watch('account',function(account){
		user.setAccount(account)
		$scope.balance = user.getBalance()
		$scope.keypairs = user.getKeypairs()
		
		console.log('fetchKeypair')
		user.fetchKeypair().then(function(keypair){
			console.log('keypair',keypair)
			$scope.keypair = keypair
		})
		
		user.save()
	})

	$scope.$watch('currency',function(currency){
		user.setCurrency(currency)
		user.save()
	})

	$scope.$watch('transferAmountInUserCurrency',function(transferAmountInUserCurrency){
		console.log(42)
		$scope.transferAmountInEther = utils.convertCurrencyAndFormat(transferAmountInUserCurrency,{
			from:$scope.currency
			,to:'ETH'
		})
	})

	$scope.$watch('transferAmountInEther',function(transferAmountInEther){
		console.log(50)
		$scope.transferAmountInUserCurrency = utils.convertCurrencyAndFormat(transferAmountInEther,{
			from:'ETH'
			,to:$scope.currency
		})
	})

	$scope.submit = function(){
		user.save()
		$modalInstance.close()
	}

	$scope.addKeypair = function(){
		$scope.isChangingKeys = true
		user.addKeypair().then(function(){
			user.save()

			$scope.keypairs = user.getKeypairs()

			var doSet = confirm('A new keypair has been generated. Would you like to set it as your primary key?')

			if(doSet)
				$scope.setPrimaryKeypair(user.getKeypairs().length-1)

			$scope.isChangingKeys = false
		})
	}

	$scope.setPrimaryKeypair = function(index){
		
		var keyData = user.getKeypairs()[index].public.toPacketlist().write()
		
		txMonitor.propose('Set Your Primary Keypair', Keystore.setKey,[keyData]).then(function(){
			user.fetchKeypair().then(function(keypair){
				$scope.keypair = keypair
			})
		})
	}

	$scope.deleteKeypair = function(index){
		var doContinue = confirm('Are you sure? If this keypair was used to encrypt any messages, you will no longer be able to decrypt them')
		if(!doContinue) return

		user.deleteKeypair(index)
		user.save()
	}

	$scope.reset = function(){
		var doContinue = confirm('Are you sure? This will delete all the SafeMarket data on this computer.')
		if(!doContinue) return

		$modalInstance.close()

		user.reset()
		user.logout()
		window.location.hash = 'login'
	}

	$scope.transfer = function(){
		var recipient = $scope.recipientType == 'internal' ? $scope.internalRecipient : '0x'+$scope.externalRecipient
			,value = $scope.amountType == 'everything' 
				? user.getBalance().toNumber()
				: utils.convertCurrency($scope.transferAmountInEther,{from:'ETH',to:'WEI'}).toNumber()

		if(!utils.isAddr(recipient))
			return growl.addErrorMessage('Invalid address')

		if($scope.account == recipient)
			return growl.addErrorMessage('You are trying to send money to and from the same account')

		if(value <= 0)
			return growl.addErrorMessage('Amount must be greater than 0')

		console.log('value1',value)

		var txObject = {
			to: recipient
			,value: value
			,gas:web3.eth.estimateGas({
				to: recipient
				,value: value
			})
		}

		console.log('value3',txObject.value)

		if($scope.amountType=='everything')
			txObject.value = txObject.value - (txObject.gas*web3.eth.gasPrice.toNumber()) 

		
		txMonitor.propose('Transfer Ether',web3.eth.sendTransaction,[txObject]).then(function(){
			$scope.balance = user.getBalance()
			$scope.transferAmountInUserCurrency = 0
		})
	}

});