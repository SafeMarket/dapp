(function(){

angular.module('app').controller('OrderController',function($scope,Order,pgp,user,$stateParams,modals){

	(new Order($stateParams.orderAddr)).updatePromise.then(function(order){

		$scope.order = order
		$scope.displayCurrencies = [order.meta.currency]
		$scope.affiliate = web3.toAscii(AffiliateReg.contract.getCode.call(order.affiliate))

		if($scope.displayCurrencies.indexOf('ETH') === -1)
			$scope.displayCurrencies.push('ETH')

		if($scope.displayCurrencies.indexOf(user.data.currency) === -1)
			$scope.displayCurrencies.push(user.data.currency)

		if(user.data.account === order.buyer)
			$scope.userRole = 'buyer'
		else if(user.data.account === order.store.owner)
			$scope.userRole = 'storeOwner'
		else if(user.data.acccount === order.submarket.owner)
			$scope.userRole = 'submarketOwner'

		if($scope.userRole)
			var keyId = order.keys[$scope.userRole].id
		else
			var keyId = null

		$scope.$watch('order.messages.length',function(){
			if(keyId===null) return

			var keypair = _.find(user.keypairs,{id:keyId})
			order.decryptMessages(keypair.private)
		})

	})

	function setMessagesAndUpdates(){

		if(!$scope.order) return

		var messagesAndUpdates = []

		if(Array.isArray($scope.order.messages))
			messagesAndUpdates = messagesAndUpdates.concat($scope.order.messages)

		if(Array.isArray($scope.order.updates))
			messagesAndUpdates = messagesAndUpdates.concat($scope.order.updates)

		$scope.messagesAndUpdates = messagesAndUpdates

	}

	$scope.$watch('order.messages',setMessagesAndUpdates,true)
	$scope.$watch('order.updates',setMessagesAndUpdates,true)


	$scope.addMessage = function(){
		$scope.isAddingMessage = true
		var keys = _.map($scope.order.keys,function(key){return key.key})
		pgp.encrypt(keys,$scope.messageText).then(function(pgpMessage){
			$scope.order.addMessage(pgpMessage).then(function(){
				$scope.messageText = ''
				$scope.order.update()
				$scope.isAddingMessage = false
			})
		})
	}

	$scope.cancel = function(){
		$scope.order.cancel().then(function(){
			$scope.order.update()
		})
	}

	$scope.markAsShipped = function(){
		$scope.order.markAsShipped().then(function(){
			$scope.order.update()
		})
	}

	$scope.dispute = function(){
		$scope.order.dispute().then(function(){
			$scope.order.update()
		})
	}

	$scope.finalize = function(){
		$scope.order.finalize().then(function(){
			$scope.order.update()
		})
	}

	$scope.openResolutionModal = function(){
		modals.openResolution($scope.order).result.then(function(){
			$scope.order.update()
		})
	}

	$scope.makePayment = function(){
		modals.openPayment($scope.order.addr,$scope.order.unpaid,'WEI').result.then(function(){
			$scope.order.update();
		})
	}

	$scope.makeWithdrawl = function(){
		modals.openWithdrawl($scope.order).result.then(function(){
			$scope.order.update();
		})
	}

	$scope.leaveReview = function(){
		modals.openLeaveReview($scope.order).result.then(function(){
			$scope.order.update();
		})
	}

})

})();