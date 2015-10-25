(function(){

angular.module('app').controller('OrderController',function($scope,safemarket,user,$routeParams,modals){
	
	(new safemarket.Order($routeParams.orderAddr)).updatePromise.then(function(order){

		$scope.order = order
		$scope.displayCurrencies = [order.meta.currency]

		if(user.data.account === order.buyer)
			$scope.userRole = 'buyer'
		else if(user.data.account === order.store.owner)
			$scope.userRole = 'storeOwner'
		else if(user.data.acccount === order.market.owner)
			$scope.userRole = 'marketOwner'

		if($scope.userRole)
			var keyId = order.keys[$scope.userRole].id
		else
			var keyId = null

		if($scope.displayCurrencies.indexOf(user.data.currency) === -1)
			$scope.displayCurrencies.push(user.data.currency)

		if($scope.displayCurrencies.indexOf('ETH') === -1)
			$scope.displayCurrencies.push('ETH')

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
		safemarket.pgp.encrypt(keys,$scope.messageText).then(function(pgpMessage){
			$scope.order.addMessage(pgpMessage).then(function(){
				$scope.messageText = ''
				$scope.order.update()
				$scope.isAddingMessage = false
			})
		})
	}

	$scope.cancel = function(){
		$scope.isUpdatingStatus = true
		$scope.order.cancel().then(function(){
			$scope.order.update().then(function(){
				$scope.isUpdatingStatus = false
			})
		})
	}

	$scope.markAsShipped = function(){
		$scope.isUpdatingStatus = true
		$scope.order.markAsShipped().then(function(){
			$scope.order.update().then(function(){
				$scope.isUpdatingStatus = false
			})
		})
	}

	$scope.dispute = function(){
		$scope.isUpdatingStatus = true
		$scope.order.dispute().then(function(){
			$scope.order.update().then(function(){
				$scope.isUpdatingStatus = false
			})
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

})

});