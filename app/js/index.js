(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','angular-growl','ngRoute','yaru22.angular-timeago'])

app.config(function(growlProvider,$routeProvider) {
    
    growlProvider.globalTimeToLive(3000);

    $routeProvider
    	.when('/',{
    		templateUrl:'home.html'
    	})
    	.when('/login',{
    		templateUrl:'login.html'
    		,controller:'LoginController'
    	})
    	.when('/stores/:storeAddr',{
	    	templateUrl:'store.html'
	    	,controller:'StoreController'
	    })
	    .when('/markets/:marketAddr',{
	    	templateUrl:'market.html'
	    	,controller:'MarketController'
	    }).when('/markets/:marketAddr/stores/:storeAddr',{
	    	templateUrl:'store.html'
	    	,controller:'StoreController'
	    }).when('/orders/:orderAddr',{
	    	templateUrl:'order.html'
	    	,controller:'OrderController'
	    }).when('/404/:alias',{
	    	templateUrl:'404.html'
	    	,controller:'404Controller'
	    })

});

app.run(function(user,$rootScope,$interval){
	user.password = 'password'
	if(user.password){
		$rootScope.isLoggedIn = true
		user.loadData()
	}else{
		$rootScope.isLoggedIn = false
		window.location.hash='/login'
	}

	$rootScope.isConnected = web3.isConnected()
	$interval(function(){
		$rootScope.isConnected = web3.isConnected()
	},1000)
})

app.controller('MainController',function($scope,modals,user,growl){

	$scope.user = user

	$scope.openSettingsModal = function(){
		modals.openSettings()
	}

	$scope.openStoreModal = function(){
		if(!user.keypair){
			//growl.addErrorMessage('You must set a primary keypair')
			//return
		}
		modals.openStore()
	}

	$scope.openMarketModal = function(){
		if(!user.keypair){
			//growl.addErrorMessage('You must set a primary keypair')
			//return
		}
		modals.openMarket()
	}

})

app.controller('ForumController',function($scope,modals,user,growl){

})

app.directive('forum',function(){
	return {
		templateUrl:'forum.html'
		,controller:'ForumController'
		,scope:{
			forum:'='
		}
	}
})

app.directive('addComment',function(){
	return {
		templateUrl:'addComment.html'
		,scope:false
		,link:function($scope,$element,$attributes){

			var commentsGroup = $scope.$eval($attributes.addComment)

			$scope.$watch('text',function(text){
				$scope.estimatedGas = !text?0:$scope.forum.contract.addComment.estimateGas(0,text)
			})

			$scope.addComment = function(){
				$scope.isAddingComment = true
				commentsGroup.addComment(commentsGroup.id,$scope.text).then(function(){
					commentsGroup.update().then(function(){
						$scope.text = null
						$scope.isAddingComment = false
					})
				})
			}
		}
	}
})

app.directive('gas',function(safemarket,user){
	return {
		templateUrl:'gas.html'
		,scope:{
			gas:'='
		},link:function(scope,element,attributes){
			scope.$watch('gas',function(){
				scope.costInEther = web3.fromWei(web3.eth.gasPrice,'ether').times(scope.gas)
				scope.userCurrency = user.data.currency
				scope.costInUserCurrency = safemarket.utils.convertCurrency(scope.costInEther,{from:'ETH',to:user.data.currency})
			})
		}
	}
})

app.directive('amounts',function(utils){
	return {
		templateUrl:'amounts.html'
		,scope:{
			value:'='
			,from:'='
			,to:'='
		},link:function(scope,element,attributes){
			scope.amounts = {}

			scope.$watchGroup(["value","from","to"],function(value){
				if(!scope.from || !scope.to || scope.value===undefined) return
				scope.to.forEach(function(currency){
					scope.amounts[currency] = utils.convertCurrency(scope.value,{from:scope.from,to:currency})
				})
			},true)
		}
	}
})

app.controller('404Controller',function($scope,$routeParams){
	$scope.alias = $routeParams.alias
})

app.controller('StoreModalController',function($scope,$filter,safemarket,ticker,growl,$modal,$modalInstance,store,user,confirmGas){
	
	$scope.currencies = Object.keys(ticker.rates)

	$scope.user = user

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
	}else{
		$scope.currency = user.data.currency
		$scope.products = []
		$scope.disputeSeconds = "1209600"
		$scope.isOpen = true
		addProduct()
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

	$scope.submit = function(){
		var alias = $scope.alias.trim().replace(/(\r\n|\n|\r)/gm,"")
			,meta = {
				name:$scope.name
				,currency:$scope.currency
				,products:$scope.products
				,disputeSeconds:$scope.disputeSeconds
				,isOpen:!!$scope.isOpen
				,info:$scope.info
			}


		try{
			safemarket.Store.check(alias,meta)
		}catch(e){
			growl.addErrorMessage(e)
			console.error(e)
			return
		}

		if(store){
			var estimatedGas = store.contract.setMeta.estimateGas(meta)
				,doContinue = confirmGas(estimatedGas)

			if(!doContinue) return;

			$scope.isSyncing = true

			store
				.setMeta(meta)
				.then(function(store){
					$scope.isSyncing = false
					$modalInstance.close(store)
				},function(error){
					$scope.error = error
					$scope.isSyncing = false
				}).catch(function(error){
					console.error(error)
				})
		}else{

			if(!safemarket.utils.isAliasAvailable(alias)){
				return growl.addErrorMessage('@'+alias+' is already taken')
			}

			var estimatedGas = Store.estimateCreationGas($scope.alias,meta)
				,doContinue = confirmGas(estimatedGas)

			if(!doContinue) return
	
			$scope.isSyncing = true

			safemarket
				Store.create($scope.alias,meta)
				.then(function(store){
					user.data.stores.push(store.addr)
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

app.controller('MarketModalController',function($scope,safemarket,ticker,growl,$modal,$modalInstance,market,user,confirmGas){
	

	if(market){
		$scope.alias = market.alias
		$scope.isEditing = true
		$scope.name = market.meta.name
		$scope.info = market.meta.info
		$scope.feePercentage = parseFloat(market.meta.feePercentage)
		$scope.bondInEther = parseInt(web3.fromWei(market.bond,'ether'))
		$scope.stores = market.meta.stores
		$scope.isOpen = market.meta.isOpen
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
				,stores:$scope.stores
			}
			,isOpen=!!$scope.isOpen
		
		try{
			safemarket.Market.check(alias,meta)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		if(market){
			var estimatedGas = market.contract.setMeta.estimateGas(meta)
				,doContinue = confirmGas(estimatedGas)

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
				,doContinue = confirmGas(estimatedGas)
	
			if(!doContinue) return;

			$scope.isSyncing = true

			safemarket
				.Market.create($scope.alias,meta)
				.then(function(market){
					user.data.markets.push(market.addr)
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

app.controller('SettingsModalController',function($scope,safemarket,growl,$modal,$modalInstance,user,ticker,confirmGas,modals){
	
	$scope.currencies = Object.keys(ticker.rates)
	
	$scope.user = user
	$scope.accounts = web3.eth.accounts

	$scope.$watch('user.data.account',function(){
		$scope.balanceInEther = web3.fromWei(web3.eth.getBalance(user.data.account))
	})

	$scope.$watch('user.data.currency',function(){
		$scope.displayCurrencies = [user.data.currency]

		if(user.data.currency!=='ETH')
			$scope.displayCurrencies.push('ETH')
	})

	$scope.submit = function(){
		user.save()
		$modalInstance.close()
	}

	$scope.addKeypair = function(){
		$scope.isChangingKeys = true
		user.addKeypair().then(function(){

			var doSet = confirm('A new keypair has been generated. Would you like to set it as your primary key?')

			if(doSet)
				$scope.setPrimaryKeypair(user.keypairs.length-1)
			else
				$scope.isChangingKeys = false
		})
	}

	$scope.setPrimaryKeypair = function(index){

		var keyData = user.keypairs[index].public.toPacketlist().write()
			,estimatedGas = Keystore.setKey.estimateGas(keyData)
			,doContinue = confirmGas(estimatedGas)

		if(!doContinue) return

		$scope.isChangingKeys = true

		safemarket.Key.set(keyData).then(function(){
			$scope.user.loadKeypair()
			$scope.isChangingKeys = false
		})
	}

	$scope.deleteKeypair = function(index){
		var doContinue = confirm('Are you sure? If this keypair was used to encrypt any messages, you will no longer be able to decrypt them')
		if(!doContinue) return

		user.data.keypairs.splice(index,1)
		user.save()
		user.loadKeypairs()
	}

	$scope.reset = function(){
		var doContinue = confirm('Are you sure? This will delete all the SafeMarket data on this computer.')
		if(!doContinue) return

		user.reset()
		user.logout()
		$modalInstance.dismiss('cancel')
	}

})

app.controller('aliasesModalController',function($scope,$modalInstance,aliasable,safemarket){

	$scope.addr = aliasable.contract.address
	$scope.aliases = aliasable.aliases
	$scope.newAliases = []
	$scope.suggestedAliases = []

	$scope.addNewAlias = function(){
		$scope.newAliases.push(new NewAlias)
	}

	$scope.$watch('newAliases',function(){
		$scope.newAliases.forEach(function(newAlias){
			newAlias.update()
		})

		var variants = []
			,suggestedAliases = []
			,aliases = $scope.newAliases.map(function(alias){
				return alias.text
			})

		$scope.newAliases.forEach(function(variant){
			variants = variants.concat([
				variant.text.replace(/[^a-zA-Z ]/g, "")
				,variant.text.replace(/[^a-zA-Z ]/g, "").toLowerCase()
				,variant.text.replace(/[^a-zA-Z ]/g, "").toUpperCase()
				,variant.text.replace(/[^a-zA-Z ]/g, "").split(' ').join('')
				,variant.text.replace(/[^a-zA-Z ]/g, "").toLowerCase().split(' ').join('')
				,variant.text.replace(/[^a-zA-Z ]/g, "").toUpperCase().split(' ').join('')
			])
		})

		_.uniq(variants).forEach(function(variant){

			if(aliases.indexOf(variant) > -1)
				return true
			if(AliasReg.getAddr(variant) !== safemarket.utils.nullAddr)
				return true

			suggestedAliases.push({text:variant,doTake:false})
		})

		$scope.suggestedAliases = suggestedAliases
	},true)

	$scope.addNewAlias()

	function NewAlias(){
		this.oldText = ''
		this.text = ''
		this.isTaken = false
	}
	NewAlias.prototype.update = function(){
		if(this.oldText === this.text) return
		this.isTaken = AliasReg.getAddr(this.text) !== safemarket.utils.nullAddr
		this.oldText = this.text
	}

	$scope.submit = function(){
		var aliases = []

		$scope.newAliases.forEach(function(alias){
			if(!alias.text)
				return true
			if(alias.isTaken)
				return true
			aliases.push(alias.text)
		})

		$scope.suggestedAliases.forEach(function(alias){
			if(!alias.doTake)
				return true
			aliases.push(alias.text)
		})

		aliases = _.uniq(aliases)
		
		$scope.isUpdating = true

		aliasable.claimAliases(aliases).then(function(){
			$modalInstance.close()
		})

	}
})

app.controller('ResolutionModalController',function($scope,$modalInstance,order,user){

	$scope.order = order
	$scope.percentBuyerRaw = .5

	var multipler = Math.pow(10,10)

	$scope.$watch('percentBuyerRaw',function(percentBuyerRaw){
		$scope.percentBuyer = new BigNumber(parseInt(percentBuyerRaw*multipler)).div(multipler)
		$scope.percentStoreOwner = $scope.percentBuyer.minus(1).times(-1)
	})

	$scope.displayCurrencies = [user.data.currency]

	if(user.data.currency!=='ETH')
		$scope.displayCurrencies.push('ETH')

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		$scope.isSyncing = true

		console.log($scope.percentBuyer.times(100).round().toString())

		order.resolve($scope.percentBuyer.times(100).round()).then(function(){
			$modalInstance.close()
		})
	}

})

app.controller('PaymentModalController',function($scope,addr,amount,currency,safemarket,user,growl,$modalInstance){
	$scope.addr = addr
	$scope.userCurrency = user.data.currency

	$scope.displayCurrencies = []
	if($scope.userCurrency!=='ETH')
		$scope.displayCurrencies.push('ETH')

	if(amount.greaterThan(0))
		$scope.amountInUserCurrency = safemarket.utils.convertCurrencyAndFormat(amount,{from:currency,to:user.data.currency})
	else
		$scope.amountInUserCurrency = '0'

	if(user.data.currency !=='ETH'){
		$scope.$watch('amountInUserCurrency',function(amountInUserCurrency){
			$scope.amountInEther = safemarket.utils.convertCurrencyAndFormat(amountInUserCurrency,{
				from:user.data.currency
				,to:'ETH'
			})
		})

		$scope.$watch('amountInEther',function(amountInEther){
			$scope.amountInUserCurrency = safemarket.utils.convertCurrencyAndFormat(amountInEther,{
				from:'ETH'
				,to:user.data.currency
			})
		})
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		try{
			safemarket.utils.check({
				addr:$scope.addr
				,amountInUserCurrency:$scope.amountInUserCurrency
			},{
				addr:{
					presence:true
					,type:'address'
				},amountInUserCurrency:{
					presence:true
					,type:'string'
					,numericality:{
						greaterThan:0
					}
				}
			})
		}catch(e){
			return growl.addErrorMessage(e)
		}

		$scope.isSyncing = true

		var amount = safemarket.utils.convertCurrency($scope.amountInUserCurrency,{from:user.data.currency,to:'WEI'})

		safemarket.utils.send($scope.addr,amount).then(function(){
			$modalInstance.close()
		})
	}
})


app.controller('SimpleModalController',function($scope,title,body){
	$scope.title = title
	$scope.body = body
})

app.controller('StoreController',function($scope,safemarket,user,$routeParams,modals,utils,Order,growl,confirmGas){

	(new safemarket.Store($routeParams.storeAddr)).updatePromise.then(function(store){

		$scope.store = store

		$scope.$watch('store.meta.currency',function(){

			$scope.displayCurrencies = [store.meta.currency];

			if($scope.displayCurrencies.indexOf(user.data.currency) === -1)
				$scope.displayCurrencies.push(user.data.currency)

			if($scope.displayCurrencies.indexOf('ETH') === -1)
				$scope.displayCurrencies.push('ETH')
		})

	})

	if($routeParams.marketAddr)
		(new safemarket.Market($routeParams.marketAddr)).updatePromise.then(function(market){
			$scope.market = market
		})

	$scope.createOrder = function(){
		var meta = {
			products:[]
		},storeAddr = $scope.store.addr
		,marketAddr = $scope.market ? $scope.market.addr : utils.nullAddr
		,feePercentage = $scope.market ? $scope.market.meta.feePercentage : '0'
		,disputeSeconds = parseInt($scope.store.meta.disputeSeconds)

		$scope.store.products.forEach(function(product){
			if(product.quantity===0) return true

			meta.products.push({
				id:product.id
				,quantity:product.quantity.toString()
			})
		})

		try{
			Order.check(meta,storeAddr,marketAddr,feePercentage,disputeSeconds)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

		var estimatedGas = Order.estimateCreationGas(meta,storeAddr,marketAddr,feePercentage,disputeSeconds)
		 	,doContinue = confirmGas(estimatedGas)

		if(!doContinue) return

		$scope.isCreatingOrder = true
			
		Order.create(meta,storeAddr,marketAddr,feePercentage,disputeSeconds).then(function(order){
			window.location.hash = "#/orders/"+order.addr
			user.data.orders.push(order.addr)
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
		var total = new BigNumber(0)

		if(products)
			products.forEach(function(product){
				var subtotal = product.price.times(product.quantity)
				total = total.plus(subtotal)
			})

		$scope.totalInStoreCurrency = total

	},true)

})

app.controller('MarketController',function($scope,safemarket,user,$routeParams,modals){
	
	try{
		$scope.market = new safemarket.Market($routeParams.marketAddr)
	}catch(e){
		return
	}

	$scope.addr = $routeParams.marketAddr
	$scope.user = user

	$scope.openMarketModal = function(){
		modals
			.openMarket($scope.market)
			.result.then(function(market){
				$scope.market.update()
			})
	}

	$scope.openAliasesModal = function(){
		modals
			.openAliases($scope.market)
			.result.then(function(){
				$scope.market.update()
			})
	}
})

app.controller('OrderController',function($scope,safemarket,user,$routeParams,modals){
	
	(new safemarket.Order($routeParams.orderAddr)).updatePromise.then(function(order){

		$scope.order = order
		$scope.displayCurrencies = [order.store.meta.currency]

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

app.factory('confirmGas',function(safemarket,user,$filter){
	return function(gas){
		var gasInWei = web3.eth.gasPrice.times(gas)
			,gasInEther = web3.fromWei(gasInWei,'ether')
			,gasInEtherPretty = $filter('currency')(gasInEther,'ETH')
			,gasInUserCurrency = safemarket.utils.convertCurrency(gasInEther,{from:'ETH',to:user.data.currency})
			,gasInUserCurrencyPretty = $filter('currency')(gasInUserCurrency,user.data.currency)

		return confirm('That will cost around '+gasInEtherPretty+' ETH / '+gasInUserCurrencyPretty+' '+user.data.currency+'. Continue?')
	}
})

app.directive('timestamp',function(){
	return {
		scope:{timestamp:'='}
		,templateUrl:'timestamp.html'
	}
})

app.directive('key',function(){
	return {
		scope:{key:'='}
		,templateUrl:'key.html'
	}
})

app.filter('currency',function(safemarket){
	return function(amount,currency){
		if(amount===undefined) return undefined

		return safemarket.utils.formatCurrency(amount,currency)
	}
})

app.filter('percentage',function(safemarket){
	return function(percent){
		if(percent === undefined)
			return ''
		else if(!percent.isFinite())
			return 'Infinity%'
		else
			return percent.times(100).toFixed(2).toString()+'%'
	}
})

app.directive('collapsable',function(){
	return {
		scope:{
			"isCollapsed":"="
		},link:function(scope,element,attributes){
			if(scope.isCollapsed)
				element.addClass('isCollapsed')
			else
				element.removeClass('isCollapsed')

			element.on('click',function(event){
				if(event.target.nodeName!=='TBODY') return
				element.toggleClass('isCollapsed')
			})
		}
	}
})

app.service('modals',function($modal){
	function openModal(options){
		var modalInstance = $modal.open(options)
		modalInstance.opened.then(function(){
			window.scrollTo(0,1)
		})
		return modalInstance
	}

	this.openStore = function(store){
		return openModal({
			size: 'md'
			,templateUrl: 'storeModal.html'
			,controller: 'StoreModalController'
			,resolve: {
				store:function(){
					return store
				}
			}
		});
	}

	this.openMarket = function(market){
		return openModal({
			size: 'md'
			,templateUrl: 'marketModal.html'
			,controller: 'MarketModalController'
			,resolve: {
				market:function(){
					return market
				}
			}
		});
	}

	this.openSettings = function(){
		return openModal({
			size: 'lg'
			,templateUrl: 'settingsModal.html'
			,controller: 'SettingsModalController'
	    });
	}

	this.openAliases = function(aliasable){
		return openModal({
			size: 'lg'
			,templateUrl: 'aliasesModal.html'
			,controller: 'aliasesModalController'
			,resolve:{
				aliasable:function(){
					return aliasable
				}
			}
	    });
	}

	this.openPayment = function(addr,amount,currency){
		return openModal({
			size: 'lg'
			,templateUrl: 'paymentModal.html'
			,controller: 'PaymentModalController'
			,resolve:{
				addr:function(){
					return addr
				},amount:function(){
					return amount
				},currency:function(){
					return currency
				}
			}
	    });
	}

	this.openResolution = function(order){
		return openModal({
			size: 'sm'
			,templateUrl: 'resolutionModal.html'
			,controller: 'ResolutionModalController'
			,resolve:{
				order:function(){
					return order
				}
			}
	    });
	}
})

app.directive('aliasBar',function(){
	return {
		templateUrl:'bar.html'
		,controller:'BarController'
		,scope:{alias:'@aliasBar'}
	}
})

app.controller('BarController',function($scope,safemarket){
	$scope.submit = function(){
		var alias = $scope.alias
			,addr = AliasReg.getAddr(alias)
			,runtimeBytecode = web3.eth.getCode(addr)

		switch(runtimeBytecode){
			case safemarket.Market.runtimeBytecode:
				window.location.hash="/markets/"+addr
				break;
			case safemarket.Store.runtimeBytecode:
				window.location.hash="/stores/"+addr
				break;
			default:
				window.location.hash="/404/"+alias
		}
	}
})

app.controller('LoginController',function($scope,$rootScope,user,growl){
	$scope.userExists = !! user.getStorage()

	$scope.login = function(){
		var isPassword = user.checkPassword($scope.password)
		
		if(!isPassword){
			growl.addErrorMessage('Sorry, thats not correct')
			return
		}

		user.password = $scope.password
		user.loadData()

		growl.addSuccessMessage('Login successful!')
		$rootScope.isLoggedIn = true

		window.location.hash="/"
	}

	$scope.reset = function(){
		if(!confirm('Are you sure? All SafeMarket data located on this computer will be destroyed and you will not be able to recover it.'))
			return

		user.reset()
		$scope.userExists = false
		growl.addSuccessMessage('Account reset')
	}

	$scope.register = function(){

		if(!$scope.password){
			growl.addErrorMessage('You must choose a password')
			return
		}
		
		if($scope.password != $scope.password1){
			growl.addErrorMessage('Passwords do not match')
			return
		}

		user.password = $scope.password
		user.loadData()
		user.save()

		growl.addSuccessMessage('Account created')
		$rootScope.isLoggedIn = true

		window.location.hash = '/'
	}

})

app.filter('fromWei',function(){
	return function(amount,to){
		return web3.fromWei(amount,to).toString()
	}
})

app.service('user',function($q,$rootScope,words,safemarket,modals){

	this.getStorage = function(){
		return localStorage.getItem('user')
	}

	this.setStorage = function(string){
		localStorage.setItem('user',string)
	}

	this.logout = function(){
		this.password = null
		$rootScope.isLoggedIn = false
	}

	this.checkPassword = function(password){
		try{
			userJson = CryptoJS.AES.decrypt(this.getStorage(),password).toString(CryptoJS.enc.Utf8)
			userData = JSON.parse(userJson)
			return true;
		}catch(e){
			return false
		}
	}

	this.reset = function(){
		this.setStorage('')
	}

	this.loadData = function(){
		var userJsonEncrypted = this.getStorage()
			,userJson = null
			,userData = null

		try{
			userJson = CryptoJS.AES.decrypt(this.getStorage(),this.password).toString(CryptoJS.enc.Utf8)
			userData = JSON.parse(userJson)
		}catch(e){
			console.error(e)
		}

		user = this

		if(userData){
			this.data = userData
		}else{
			this.data = {}
		}

		if(!this.data.orders)
			this.data.orders = []

		if(!this.data.stores)
			this.data.stores = []

		if(!this.data.markets)
			this.data.markets = []

		if(!this.data.account)
			this.data.account = web3.eth.defaultAccount ? web3.eth.defaultAccount : web3.eth.accounts[0]

		if(!this.data.currency)
			this.data.currency = 'USD'

		if(!this.data.keypairs)
			this.data.keypairs = []

		this.loadKeypairs()
		this.loadKeypair()
	}

	this.save = function(){
		var dataEncrypted = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.password)
		this.setStorage(dataEncrypted)
	}

	this.generateKeypair = function(){
		var deferred = $q.defer()

		safemarket.pgp.generateKeypair().then(function(keypair){
			deferred.resolve(keypair)
		})

		return deferred.promise
	}

	this.addKeypair = function(){
		var user = this
			,deferred = $q.defer()

		this.generateKeypair().then(function(keypair){
			
			var publicKey = openpgp.key.readArmored(keypair.publicKeyArmored).keys[0]
				,keyData = publicKey.toPacketlist().write()

			user.data.keypairs.push({
				private: keypair.privateKeyArmored
				,public: keypair.publicKeyArmored
				,timestamp: (new Date).getTime()
				,label: words.generateWordPair()
			})
			user.save()
			user.loadKeypairs()
			deferred.resolve()
		})

		return deferred.promise
	}

	this.loadKeypair = function(){
		var user = this
		
		safemarket.Key.fetch(user.data.account).then(function(key){
			user.keypair = _.find(user.keypairs,{id:key.id})
		})
	}

	this.loadKeypairs = function(){
		var keypairs = []

		if(this.data.keypairs)
			this.data.keypairs.forEach(function(keypairData){
				keypairs.push(new Keypair(keypairData))
			})
		
		this.keypairs = keypairs
	}

	function Keypair(keypairData){
		this.data = keypairData
		this.private = openpgp.key.readArmored(keypairData.private).keys[0]
		this.public = openpgp.key.readArmored(keypairData.public).keys[0]
		this.id = this.public.primaryKey.keyid.bytes
	}

})

app.filter('capitalize', function() {
 	return function(input, scope) {
    	if (input!=null)
    	input = input.toLowerCase();
    	return input.substring(0,1).toUpperCase()+input.substring(1);
  	}
});

app.directive('alias', function(growl) {
  	return {
    	require: 'ngModel',
    	link: function (scope, element, attr, ngModelCtrl) {
      		ngModelCtrl.$parsers.push(function(text) {
        		var transformedInput = text.toLowerCase().replace(/[^a-z]/g, '');
        		if(transformedInput !== text) {
           			ngModelCtrl.$setViewValue(transformedInput);
            		ngModelCtrl.$render();
            		growl.addErrorMessage('Aliases consist entirely of lower case letters')
        		}
        		return transformedInput;  // or return Number(transformedInput)
      		});
    	}
  	}; 
});

app.directive('numeric', function(growl) {
	return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {  
        	ngModelCtrl.$parsers.push(function(text) {
        		var transformedInput = text.replace(/[^0-9.]/g, "");
        		if(transformedInput !== text) {
           			ngModelCtrl.$setViewValue(transformedInput);
            		ngModelCtrl.$render();
            		growl.addErrorMessage('Numeric input only')
        		}
        		return transformedInput;  // or return Number(transformedInput)
      		});         
        }
    };
});

app.directive('cleanInput', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      var el = element[0];

      function clean(x) {
        return x && x.toUpperCase().replace(/[^A-Z\d]/g, '');
      }

      ngModelController.$parsers.push(function(val) {
        var cleaned = clean(val);

        // Avoid infinite loop of $setViewValue <-> $parsers
        if (cleaned === val) return val;

        var start = el.selectionStart;
        var end = el.selectionEnd + cleaned.length - val.length;

        // element.val(cleaned) does not behave with
        // repeated invalid elements
        ngModelController.$setViewValue(cleaned);
        ngModelController.$render();

        el.setSelectionRange(start, end);
        return cleaned;
      });
    }
  }
});


app.directive('aliasValidator', function(safemarket) {
  	return {
  		scope:{
  			alias:'=aliasValidator'
  			,type:'@aliasType'
  		},link: function ($scope) {
      		$scope.$watch('alias',function(alias){
      			if(!$scope.type)
	      			$scope.isValid = safemarket.utils.isAliasAvailable(alias)
	      		else if($scope.type==='store')
	      			$scope.isValid = safemarket.Store.validateAlias(alias)
	      		else if($scope.type==='market')
	      			$scope.isValid = safemarket.Market.validateAlias(alias)
      		})
    	},templateUrl:'aliasValidator.html'
  	}; 
});

})();