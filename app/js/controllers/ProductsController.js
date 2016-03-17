angular.module('app').controller('ProductsController',function($scope,$filter,utils,Submarket,helpers,growl,user,Order,constants,Coinage,AffiliateReg){

	var currency = $scope.store.currency

	$scope.productsTotal = new Coinage(0,currency)
	$scope.total = new Coinage(0,currency)

	$scope.createOrder = function(){

		var buyer = user.getAccount()
			,meta = {
				products:[]
				,transport:{
					id:$scope.transport.id
					,type:$scope.transport.data.type
					,price:$scope.transport.price.in(currency).toString()
				}
			},storeAddr = $scope.store.addr
			,submarketAddr = $scope.submarketOption.addr
			,productsTotal = web3.toBigNumber(0)
			,affiliate = utils.getAffiliate($scope.affiliateCodeOrAlias) || constants.nullAddr

		if($scope.affiliateCodeOrAlias && affiliate===constants.nullAddr){
			growl.addErrorMessage($scope.affiliateCodeOrAlias+' is not a valid affiliate')
			return
		}

		$scope.store.products.forEach(function(product){

			console.log(product)

			if(product.quantity===0) return true

			meta.products.push({
				id:product.id
				,name:product.name
				,price:product.price.in(currency).toString()
				,quantity:product.quantity
			})

			productsTotal = productsTotal.plus(product.price.in(currency).times(product.quantity))
		})

		try{
			Order.check(buyer,storeAddr,submarketAddr,affiliate,meta)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		if(productsTotal.lessThan($scope.store.minTotal.in(currency))){
			growl.addErrorMessage('You must order at least '+$scope.store.minTotal.formattedIn(user.getCurrency())+' of products')
			return
		}

		var value = $scope.total.in('WEI').ceil()

		Order.create(buyer,storeAddr,submarketAddr,affiliate,meta,value).then(function(order){
			window.location.hash = "#/orders/"+order.addr
			user.addOrder(order.addr)
			user.save()
		})

	}

	$scope.$watch('store.products',function(products){

		
		$scope.productsTotal = new Coinage(0,currency)

		if(!products) return

		var productsTotal = web3.toBigNumber(0)
		
		products.forEach(function(product){
			var subtotal = product.price.in(currency).times(product.quantity)
			productsTotal = productsTotal.plus(subtotal)
		})

		$scope.productsTotal = new Coinage(productsTotal,currency)

	},true)

	$scope.$watchGroup(['submarketOption','productsTotal','transport'],function(){

		if(!$scope.transport) return

		var fee = $scope.productsTotal.in(currency).plus($scope.transport.price.in(currency)).times($scope.submarketOption.escrowFeeCentiperun).div(100)
		
		$scope.fee = new Coinage(fee,currency)
		
		var total = $scope.productsTotal.in(currency).plus($scope.transport.price.in(currency)).plus($scope.fee.in(currency))
	
		$scope.total = new Coinage(total,currency)
	})

});