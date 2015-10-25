(function(){


angular.module('app').controller('MarketModalController',function($scope,safemarket,ticker,growl,$modal,$modalInstance,market,user,helpers){
	
	$scope.stores = []

	if(market){
		$scope.alias = market.alias
		$scope.isEditing = true
		$scope.name = market.meta.name
		$scope.info = market.meta.info
		$scope.feePercentage = parseFloat(market.meta.feePercentage)
		$scope.bondInEther = parseInt(web3.fromWei(market.bond,'ether'))
		$scope.isOpen = market.meta.isOpen

		if(market.meta.storeAddrs)
			market.meta.storeAddrs.forEach(function(storeAddr){
				$scope.stores.push({alias:safemarket.utils.getAlias(storeAddr)})
			})
	}else{
		$scope.feePercentage = 3
		$scope.bondInEther = 100
		$scope.stores = []
		$scope.isOpen = true
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		var alias = $scope.alias
			,meta = {
				name:$scope.name
				,info:$scope.info
				,feePercentage: $scope.feePercentage.toString()
				,isOpen:$scope.isOpen
				,storeAddrs:[]
			}
			,isOpen=!!$scope.isOpen

		$scope.stores.forEach(function(store){
			meta.storeAddrs.push(AliasReg.getAddr(store.alias))
		})
		
		try{
			safemarket.Market.check(alias,meta)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		if(market){
			var estimatedGas = market.contract.setMeta.estimateGas(meta)
				,doContinue = helpers.confirmGas(estimatedGas)

			if(!doContinue) return;

			$scope.isSyncing = true

			market
				.set(meta)
				.then(function(market){
					$scope.isSyncing = false
					$modalInstance.close(market)
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})
		}else{

			if(!safemarket.utils.isAliasAvailable(alias)){
				return growl.addErrorMessage('The alias"'+alias+'" is taken')
			}

			var estimatedGas = Market.estimateCreationGas($scope.alias,meta)
				,doContinue = helpers.confirmGas(estimatedGas)
	
			if(!doContinue) return;

			$scope.isSyncing = true

			safemarket
				.Market.create($scope.alias,meta)
				.then(function(market){
					user.data.marketAddrs.push(market.addr)
					user.save()
					$modalInstance.dismiss()
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})

		}

	

	}
})

})();