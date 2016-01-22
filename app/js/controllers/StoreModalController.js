(function(){

angular.module('app').controller('StoreModalController',function($scope,$filter,utils,Store,AliasReg,ticker,growl,$modal,$modalInstance,store,user,helpers){
	
	$scope.currencies = Object.keys(ticker.rates)
	$scope.user = user
	$scope.submarkets = []

	$scope.disputeSecondsOptions = [
		{value:'0'}
		,{value:'86400'}
		,{value:'172800'}
		,{value:'259200'}
		,{value:'604800'}
		,{value:'1209600'}
		,{value:'1814400'}
		,{value:'2592000'}
	]

	$scope.disputeSecondsOptions.forEach(function(disputeSecondsOption){
		disputeSecondsOption.label = $filter('disputeSeconds')(disputeSecondsOption.value)
	})

	if(store){
		$scope.isEditing = true
		$scope.alias = store.alias
		$scope.name = store.meta.name
		$scope.currency = store.meta.currency
		$scope.products = store.meta.products
		$scope.disputeSeconds = store.meta.disputeSeconds
		$scope.info = store.meta.info
		$scope.isOpen = store.meta.isOpen
		$scope.transports = store.meta.transports || []
		$scope.minTotal = store.meta.minTotal
		
		if(store.meta.submarketAddrs)
			store.meta.submarketAddrs.forEach(function(submarketAddr){
				$scope.submarkets.push({alias:utils.getAlias(submarketAddr)})
			})

	}else{
		$scope.currency = user.data.currency
		$scope.products = []
		$scope.disputeSeconds = "1209600"
		$scope.isOpen = true
		$scope.transports = []
		$scope.minTotal = '0'
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	function addProduct(){
		$scope.products.push({
			id:BigNumber.random().times('100000000').round().toString()
		})
	}
	$scope.addProduct = addProduct

	function addTransport(){
		$scope.transports.push({
			id:BigNumber.random().times('100000000').round().toString()
		})
	}
	$scope.addTransport = addTransport

	$scope.submit = function(){
		var alias = $scope.alias ? $scope.alias.trim().replace(/(\r\n|\n|\r)/gm,"") : ''
			,meta = {
				name:$scope.name
				,currency:$scope.currency
				,products:$scope.products
				,disputeSeconds:$scope.disputeSeconds
				,isOpen:!!$scope.isOpen
				,info:$scope.info
				,submarketAddrs:[]
				,transports:$scope.transports
				,minTotal:$scope.minTotal
			}

		$scope.submarkets.forEach(function(submarket){
			meta.submarketAddrs.push(AliasReg.getAddr(submarket.alias))
		})


		try{
			Store.check(alias,meta)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		if(store){

			store
				.setMeta(meta)
				.then(function(store){
					$modalInstance.close(store)
				},function(error){
					$scope.error = error
				}).catch(function(error){
					console.error(error)
				})
		}else{

			if(!utils.isAliasAvailable(alias)){
				return growl.addErrorMessage('@'+alias+' is already taken')
			}

			Store.create($scope.alias,meta)
				.then(function(store){
					user.data.storeAddrs.push(store.addr)
					user.save()
					$modalInstance.close()
				},function(error){
					$scope.error = error
				}).catch(function(error){
					console.error(error)
				})

		}

	

	}
})

})();