(function(){

angular.module('app').controller('ProductsController',function($scope,$filter,safemarket,helpers,growl){

	$scope.$watch('marketAddr',function(marketAddr){

		if(!marketAddr || marketAddr === safemarket.utils.nullAddr)
			$scope.market = null
		else
			$scope.market = new safemarket.Market(marketAddr)

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
		,productsTotal = new BigNumber(0)
		,affiliateAddr = ""

		if($scope.affiliateAlias.length == 0)
			affiliateAddr = storeAddr
		else
			affiliateAddr = AffiliateReg.getAddr.call($scope.affiliateAlias)

		console.log($scope.affiliateAlias, affiliateAddr);
		$scope.store.products.forEach(function(product){
			if(product.quantity===0) return true

			meta.products.push({
				id:product.id
				,name:product.name
				,price:product.price.toString()
				,quantity:product.quantity
			})

			productsTotal = productsTotal.plus(product.price.times(product.quantity))
		})

		try{
			Order.check(meta,storeAddr,marketAddr,feePercentage,disputeSeconds,affiliateAddr)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		if(productsTotal.lessThan($scope.store.meta.minTotal)){
			growl.addErrorMessage('You must order at least '+$scope.store.meta.minTotal+' '+$scope.store.meta.currency+' of products')
			return
		}

		var estimatedGas = Order.estimateCreationGas(meta,storeAddr,marketAddr,feePercentage,disputeSeconds,affiliateAddr)
		 	,doContinue = helpers.confirmGas(estimatedGas)

		if(!doContinue) return

		$scope.isCreatingOrder = true

		console.log('meta sent to Order.create',meta)

		Order.create(meta,storeAddr,marketAddr,feePercentage,disputeSeconds,affiliateAddr).then(function(order){
			window.location.hash = "#/orders/"+order.addr
			user.data.orderAddrs.push(order.addr)
			user.save()
		 	$scope.isCreatingOrder = false
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

		var transportPrice = safemarket.utils.convertCurrency($scope.transport.price,{from:$scope.store.meta.currency,to:'WEI'})

		if($scope.market)
			$scope.estimatedFee = $scope.productsTotal.plus(transportPrice).times($scope.feePercent)
		else
			$scope.estimatedFee = new BigNumber(0)

		$scope.total = $scope.productsTotal.plus(transportPrice).plus($scope.estimatedFee)
	})

})

})();