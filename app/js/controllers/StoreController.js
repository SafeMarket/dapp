(function(){

angular.module('app').controller('StoreController',function($scope,$filter,safemarket,user,$routeParams,modals,Order,growl,helpers){

	$scope.marketOptions = [{addr:safemarket.utils.nullAddr,label:'No escrow'}];
	$scope.marketAddr = $routeParams.marketAddr || safemarket.utils.nullAddr;
	$scope.productsTotal = new BigNumber(0);

	(new safemarket.Store($routeParams.storeAddr)).updatePromise.then(function(store){

		$scope.store = store

		$scope.store.meta.marketAddrs.forEach(function(marketAddr){
			$scope.marketOptions.push({addr:marketAddr,label:'@'+safemarket.utils.getAlias(marketAddr)})
		})

		$scope.store.meta.transports.forEach(function(transport){
			var priceInStoreCurrency = new BigNumber(transport.price)
				,priceInUserCurrency = safemarket.utils.convertCurrency(priceInStoreCurrency,{from:$scope.store.meta.currency,to:user.data.currency})
				,priceFormatted = $filter('currency')(priceInUserCurrency,user.data.currency)
		})
		$scope.transport = store.meta.transports[0]

		$scope.$watch('store.meta.currency',function(){

			$scope.displayCurrencies = [store.meta.currency];

			if($scope.displayCurrencies.indexOf(user.data.currency) === -1)
				$scope.displayCurrencies.push(user.data.currency)

			if($scope.displayCurrencies.indexOf('ETH') === -1)
				$scope.displayCurrencies.push('ETH')
		})

		$scope.$watch('marketAddr',function(marketAddr){
			
			if(!marketAddr || marketAddr === safemarket.utils.nullAddr)
				$scope.market = null
			else
				$scope.market = new Market(marketAddr)

			if($scope.market)
				$scope.market.updatePromise.then(function(){
					$scope.feePercent = $scope.market.feePercentage.div(100)
					console.log('feePercent',$scope.feePercent.toString())
				})
			else
				$scope.feePercent = new BigNumber(0)
		})

		$scope.getTransportLabel = function(transport){
			var priceInUserCurrency = safemarket.utils.convertCurrency(transport.price,{from:$scope.store.meta.currency,to:user.data.currency})
				,priceFormatted = $filter('currency')(priceInUserCurrency,user.data.currency)

			return transport.type+' ('+priceFormatted+' '+user.data.currency+')'
		}

	})

	if($routeParams.marketAddr)
		(new safemarket.Market($routeParams.marketAddr)).updatePromise.then(function(market){
			$scope.market = market
		})

	$scope.createOrder = function(){
		var meta = {
			currency:$scope.store.meta.currency
			,products:[]
			,transport:{
				id:$scope.transport.id
				,type:$scope.transport.type
				,price:$scope.transport.price.toString()
			}
		},storeAddr = $scope.store.addr
		,marketAddr = $scope.marketAddr
		,feePercentage = $scope.market ? $scope.market.meta.feePercentage : '0'
		,disputeSeconds = parseInt($scope.store.meta.disputeSeconds)

		$scope.store.products.forEach(function(product){
			if(product.quantity===0) return true

			meta.products.push({
				id:product.id
				,name:product.name
				,price:product.price.toString()
				,quantity:product.quantity
			})
		})

		try{
			Order.check(meta,storeAddr,marketAddr,feePercentage,disputeSeconds)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		var estimatedGas = Order.estimateCreationGas(meta,storeAddr,marketAddr,feePercentage,disputeSeconds)
		 	,doContinue = helpers.confirmGas(estimatedGas)

		if(!doContinue) return

		$scope.isCreatingOrder = true
			
		Order.create(meta,storeAddr,marketAddr,feePercentage,disputeSeconds).then(function(order){
			window.location.hash = "#/orders/"+order.addr
			user.data.orderAddrs.push(order.addr)
			user.save()
		 	$scope.isCreatingOrder = false
		})

	}

	$scope.openStoreModal = function(){
		modals
			.openStore($scope.store)
			.result.then(function(store){
				$scope.store = store
			})


	}

	$scope.$watch('store.products',function(products){

		if(!$scope.store) return

		var total = new BigNumber(0)

		if(products)
			products.forEach(function(product){
				var subtotal = product.price.times(product.quantity)
				total = total.plus(subtotal)
			})

		$scope.productsTotal = safemarket.utils.convertCurrency(total,{from:$scope.store.meta.currency,to:'WEI'})

	},true)

	$scope.$watchGroup(['productsTotal','feePercent','transport.id'],function(){
		if(!$scope.transport) return

		if($scope.market)
			$scope.estimatedFee = $scope.productsTotal.plus($scope.transport.price).times($scope.feePercent)
		else
			$scope.estimatedFee = new BigNumber(0)

		$scope.total = $scope.productsTotal.plus($scope.transport.price).plus($scope.estimatedFee)
	})

})

})();