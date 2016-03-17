angular.module('app').controller('SubmarketModalController',function($scope,ticker,growl,$modal,$modalInstance,submarket,user,helpers,utils,SubmarketReg,AliasReg,ticker,constants){
	
	$scope.stores = []

	$scope.currencies = Object.keys(ticker.rates)

	if(submarket){
		$scope.alias = submarket.alias
		$scope.currency = submarket.currency
		$scope.isEditing = true
		$scope.name = submarket.meta.data.name
		$scope.info = submarket.meta.data.info
		$scope.escrowFeeCentiperun = submarket.infosphered.data.escrowFeeCentiperun.toNumber()
		$scope.isOpen = submarket.infosphered.data.isOpen
		$scope.minTotal = submarket.infosphered.data.minTotal.div(constants.tera)

		if(submarket.meta.data.storeAddrs)
			submarket.meta.data.storeAddrs.forEach(function(storeAddr){
				$scope.stores.push({alias:utils.getAlias(storeAddr)})
			})
	}else{
		$scope.currency = user.getCurrency()
		$scope.escrowFeeCentiperun = 3
		$scope.stores = []
		$scope.isOpen = true
		$scope.minTotal = 0
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		var alias = $scope.alias
			,meta = {
				name:$scope.name
				,info:$scope.info
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
				.set(
					{
						isOpen: isOpen
						,currency: $scope.currency
						,minTotal: (web3.toBigNumber($scope.minTotal)).times(constants.tera)
						,escrowFeeCentiperun: $scope.escrowFeeCentiperun
					}
					,meta
					,$scope.alias
				)
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

			console.log(meta)

			Submarket.create(isOpen, $scope.currency, $scope.minTotal, $scope.escrowFeeCentiperun, meta, $scope.alias)
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
});