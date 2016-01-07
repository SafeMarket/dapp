angular.module('app').controller('ProductsController',function($scope,$filter,utils,Market,helpers,growl,user){

	$scope.$watch('marketAddr',function(marketAddr){
			
		if(!marketAddr || marketAddr === utils.nullAddr)
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
		var priceInUserCurrency = utils.convertCurrency(transport.price,{from:$scope.store.meta.currency,to:user.data.currency})
			,priceFormatted = $filter('currency')(priceInUserCurrency,user.data.currency)

		return transport.type+' ('+priceFormatted+')'
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
			Order.check(meta,storeAddr,marketAddr,feePercentage,disputeSeconds)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		if(productsTotal.lessThan($scope.store.meta.minTotal)){
			growl.addErrorMessage('You must order at least '+$scope.store.meta.minTotal+' '+$scope.store.meta.currency+' of products')
			return
		}


		Order.create(meta,storeAddr,marketAddr,feePercentage,disputeSeconds).then(function(order){
			console.log(order)
			window.location.hash = "#/orders/"+order.addr
			user.data.orderAddrs.push(order.addr)
			user.save()
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

		$scope.productsTotal = utils.convertCurrency(total,{from:$scope.store.meta.currency,to:'WEI'})

	},true)

	$scope.$watchGroup(['productsTotal','feePercent','transport.id'],function(){
		if(!$scope.transport) return

		var transportPrice = utils.convertCurrency($scope.transport.price,{from:$scope.store.meta.currency,to:'WEI'})

		if($scope.market)
			$scope.estimatedFee = $scope.productsTotal.plus(transportPrice).times($scope.feePercent)
		else
			$scope.estimatedFee = new BigNumber(0)

		$scope.total = $scope.productsTotal.plus(transportPrice).plus($scope.estimatedFee)
	})

});