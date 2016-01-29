(function(){


angular.module('app').controller('SubmarketModalController',function($scope,ticker,growl,$modal,$modalInstance,submarket,user,helpers,utils,Submarket,AliasReg){
	
	$scope.stores = []

	if(submarket){
		$scope.alias = submarket.alias
		$scope.isEditing = true
		$scope.name = submarket.meta.name
		$scope.info = submarket.meta.info
		$scope.feePercentage = parseFloat(submarket.meta.feePercentage)
		$scope.bondInEther = parseInt(web3.fromWei(submarket.bond,'ether'))
		$scope.isOpen = submarket.meta.isOpen

		if(submarket.meta.storeAddrs)
			submarket.meta.storeAddrs.forEach(function(storeAddr){
				$scope.stores.push({alias:utils.getAlias(storeAddr)})
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
			Submarket.check(alias,meta)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		if(submarket){

			submarket
				.set(meta)
				.then(function(submarket){
					$modalInstance.close(submarket)
				},function(error){
					$scope.error = error
				}).catch(function(error){
					console.error(error)
				})
		}else{

			if(!utils.isAliasAvailable(alias)){
				return growl.addErrorMessage('The alias "'+alias+'" is taken')
			}

			Submarket.create($scope.alias,meta)
				.then(function(submarket){
					user.addSubmarket(submarket.addr)
					user.save()
					$modalInstance.dismiss()
				},function(error){
					$scope.error = error
				}).catch(function(error){
					console.error(error)
				})

		}

	

	}
})

})();