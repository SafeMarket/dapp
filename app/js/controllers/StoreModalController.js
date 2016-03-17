angular.module('app').controller('StoreModalController',function($scope,$filter,utils,Store,AliasReg,ticker,growl,$modal,$modalInstance,store,user,helpers,constants){
	
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
		$scope.name = store.meta.data.name
		$scope.currency = store.currency
		$scope.products = store.meta.data.products
		$scope.disputeSeconds = store.infosphered.data.disputeSeconds.toString()
		$scope.info = store.meta.data.info
		$scope.isOpen = store.infosphered.data.isOpen
		$scope.transports = store.meta.data.transports || []
		$scope.minTotal = store.infosphered.data.minTotal.div(constants.tera).toNumber()
		$scope.affiliateFeeCentiperun = store.infosphered.data.affiliateFeeCentiperun.toNumber()
		
		if(store.meta.data.submarketAddrs)
			store.meta.data.submarketAddrs.forEach(function(submarketAddr){
				$scope.submarkets.push({alias:utils.getAlias(submarketAddr)})
			})

	}else{
		$scope.currency = user.getCurrency()
		$scope.products = []
		$scope.disputeSeconds = "1209600"
		$scope.isOpen = true
		$scope.transports = []
		$scope.minTotal = 0
		$scope.affiliateFeeCentiperun = 5
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	function addProduct(){
		$scope.products.push({
			id:utils.getRandom().times('100000000').round().toString()
		})
	}
	$scope.addProduct = addProduct

	function addTransport(){
		$scope.transports.push({
			id:utils.getRandom().times('100000000').round().toString()
		})
	}
	$scope.addTransport = addTransport

	$scope.submit = function(){
		var alias = $scope.alias ? $scope.alias.trim().replace(/(\r\n|\n|\r)/gm,"") : ''
			,meta = {
				name:$scope.name
				,products:$scope.products
				,info:$scope.info
				,submarketAddrs:[]
				,transports:$scope.transports
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

		var minTotal = constants.tera.times($scope.minTotal)
			,affiliateFeeCentiperun = web3.toBigNumber($scope.affiliateFeeCentiperun)

		if(store){

			console.log(minTotal)

			store.set(
				{
					isOpen:$scope.isOpen
					,currency:$scope.currency
					,disputeSeconds:(web3.toBigNumber($scope.disputeSeconds)).toNumber()
					,minTotal:minTotal
					,affiliateFeeCentiperun:affiliateFeeCentiperun
				}
				,meta
			).then(function(){
				store.update().then(function(){
					$modalInstance.close(store)
				})
			})

		}else{

			if(!utils.isAliasAvailable(alias)){
				return growl.addErrorMessage('@'+alias+' is already taken')
			}

			Store.create($scope.isOpen, $scope.currency, $scope.disputeSeconds, minTotal, affiliateFeeCentiperun, meta,$scope.alias)
				.then(function(store){
					user.addStore(store.addr)
					user.save()
					$modalInstance.close()
				},function(error){
					$scope.error = error
				}).catch(function(error){
					console.error(error)
				})

		}

	

	}
});