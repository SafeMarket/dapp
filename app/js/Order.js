(function(){

angular.module('safemarket').factory('Order',function(utils,ticker,$q,Store,Market,Key,pgp){

function Order(addr){
	this.addr = addr
	this.contract = this.contractFactory.at(addr)
	this.updatePromise = this.update()
}

window.Order = Order

Order.prototype.code = Order.code = '0x'+contractDB.Order.compiled.code
Order.prototype.abi = Order.abi = contractDB.Order.compiled.info.abiDefinition
Order.prototype.contractFactory = Order.contractFactory = web3.eth.contract(Order.abi)

Order.create = function(meta,storeAddr,marketAddr,feePercentage,disputeSeconds){

	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,txObject = {
			data:Order.code
			,gas:this.estimateCreationGas(meta,storeAddr,marketAddr,feePercentage,disputeSeconds)
		},txHex = this.contractFactory.new(meta,storeAddr,marketAddr,feePercentage,disputeSeconds,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		(new Order(tx.contractAddress)).updatePromise.then(function(order){
			deferred.resolve(order)
		})
	},function(error){
		deferred.reject(error)
	}).catch(function(error){
		console.error(error)
	})

	return deferred.promise
}

Order.check = function(meta,storeAddr,marketAddr,feePercentage,disputeSeconds){
	utils.check(meta,{
		products:{
			presence:true
			,type:'array'
		}
	})

	meta.products.forEach(function(product){
		utils.check(product,{
			id:{
				presence:true
				,type:'string'
				,numericality:{
					onlyInteger:true
					,greaterThanOrEqualTo:0
				}
			},quantity:{
				presence:true
				,type:'string'
				,numericality:{
					onlyInteger:true
					,greaterThan:0
				}
			}
		})
	})

	utils.check({
		storeAddr:storeAddr
		,marketAddr:marketAddr
		,feePercentage:feePercentage
		,disputeSeconds:disputeSeconds
	},{
		storeAddr:{
			presence:true
			,type:'address'
		},marketAddr:{
			presence:true
			,type:'address'
		},feePercentage:{
			presence:true
			,type:'string'
			,numericality:{
				onlyInteger:true
				,greaterThanOrEqualTo:0
			}
		},disputeSeconds:{
			presence:true
			,type:'number'
			,numericality:{
				onlyInteger:true
				,greaterThanOrEqualTo:0
			}
		}
	})
}

Order.estimateCreationGas = function(meta,storeAddr,marketAddr,feePercentage,disputeSeconds){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	return this.contractFactory.estimateGas(meta,storeAddr,marketAddr,feePercentage,disputeSeconds,{
		data:Order.code
	})
}

Order.prototype.cancel = function(){
	var deferred = $q.defer()
		,txHex = this.contract.cancel()

	utils.waitForTx(txHex).then(function(){
		deferred.resolve()
	})

	return deferred.promise
}

Order.prototype.dispute = function(){
	var deferred = $q.defer()
		,txHex = this.contract.dispute()

	utils.waitForTx(txHex).then(function(){
		deferred.resolve()
	})

	return deferred.promise
}

Order.prototype.resolve = function(buyerPercentage){
	console.log('buyerPercentage',buyerPercentage.toString())
	var deferred = $q.defer()
		,txHex = this.contract.resolve(buyerPercentage)

	utils.waitForTx(txHex).then(function(){
		deferred.resolve()
	})

	return deferred.promise
}


Order.prototype.markAsShipped = function(){
	var deferred = $q.defer()
		,txHex = this.contract.markAsShipped()

	utils.waitForTx(txHex).then(function(){
		deferred.resolve()
	})

	return deferred.promise
}

Order.prototype.update = function(){

	var deferred = $q.defer()
		,order = this
		,storeAddr = this.contract.getStoreAddr()
		,marketAddr = this.contract.getMarketAddr()


	this.buyer = this.contract.getBuyer()
	this.store = new Store(storeAddr)
	this.market = marketAddr === utils.nullAddr ? null : new Market(marketAddr)
	this.feePercentage = this.contract.getFeePercentage()
	this.received = this.contract.getReceived()
	this.status = this.contract.getStatus().toNumber()
	this.timestamp = this.contract.getTimestamp()
	this.shippedAt = this.contract.getShippedAt()
	this.disputeSeconds = this.contract.getDisputeSeconds()
	this.fee = this.contract.getFee()
	this.buyerAmount = this.contract.getBuyerAmount()
	this.storeOwnerAmount = this.received.minus(this.fee).minus(this.buyerAmount)
	this.buyerPercent = this.buyerAmount.div(this.received.minus(this.fee))
	this.storeOwnerPercent = this.storeOwnerAmount.div(this.received.minus(this.fee))

	this.products = []
	this.messages = []
	this.updates = []
	this.keys = {}
	this.productsTotalInStoreCurrency = new BigNumber(0)

	Key.fetch(this.buyer).then(function(key){
		order.keys.buyer = key
	})

	Key.fetch(this.store.owner).then(function(key){
		order.keys.storeOwner = key
	})

	if(this.market)
		order.market.updatePromise.then(function(market){
			Key.fetch(market.owner).then(function(key){
				order.keys.marketOwner = key
			})
		})

	this.store.updatePromise.then(function(store){

		order.contract.Meta({},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

			if(error)
				return deferred.reject(error)

			if(results.length === 0)
				return deferred.reject(new Error('no results found'))

			order.meta = utils.convertHexToObject(results[0].args.meta)

			order.meta.products.forEach(function(orderProduct){
				product = _.find(order.store.products,{id:orderProduct.id})
				product.quantity = orderProduct.quantity
				
				order.products.push(product)

				var subtotal = product.price.times(product.quantity)
				order.productsTotalInStoreCurrency = order.productsTotalInStoreCurrency.plus(subtotal)
			})

			order.productsTotal = utils.convertCurrency(order.productsTotalInStoreCurrency,{from:order.store.meta.currency,to:'WEI'})
			order.estimatedFee = order.productsTotal.times(order.feePercentage).div(100)
			order.total = order.productsTotal.plus(order.estimatedFee)
			order.unpaid = order.total.minus(order.received)
			order.percentReceived = new BigNumber(order.received).div(order.total)

			order.contract.Message({},{fromBlock:0,toBlock:'latest'}).get(function(error,results){
				results.forEach(function(result){
					var timestamp = web3.eth.getBlock(result.blockNumber).timestamp
					order.messages.push(new Message(result.args.sender,web3.toAscii(result.args.text),timestamp,order))
				})
			})

			order.contract.Update({},{fromBlock:0,toBlock:'latest'}).get(function(error,results){
				results.forEach(function(result){
					var timestamp = web3.eth.getBlock(result.blockNumber).timestamp
					order.updates.push(new Update(result.args.sender,result.args.status.toNumber(),timestamp,order))
				})

				deferred.resolve(order)
			})

		})

	})

	return deferred.promise

}

Order.prototype.addMessage = function(pgpMessage){
	var ciphertext = pgpMessage.packets.write()
		,deferred = $q.defer()
		,txHex = this.contract.addMessage(ciphertext,{
			gas: this.contract.addMessage.estimateGas(ciphertext)
		})
		,order = this

	utils.waitForTx(txHex).then(function(){
		order.update().then(function(){
			deferred.resolve(order)
		})
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}

Order.prototype.decryptMessages = function(privateKey){
	this.messages.forEach(function(message){
		message.decrypt(privateKey)
	})
}

function Message(sender,ciphertext,timestamp,order){

	this.sender = sender
	this.ciphertext = ciphertext
	this.timestamp = timestamp

	switch(this.sender){
		case order.buyer:
			this.from = 'buyer'
			break;
		case order.store.owner:
			this.from = 'storeOwner'
			break;
		case order.market.owner:
			this.from = 'marketOwner'
			break;
	}

	var packetlist = new openpgp.packet.List
	packetlist.read(ciphertext)

	this.pgpMessage = openpgp.message.Message(packetlist)
	this.messageArmored = this.pgpMessage.armor()
}

function Update(sender,status,timestamp,order){

	this.sender = sender
	this.status = status
	this.timestamp = timestamp

	switch(this.sender){
		case order.buyer:
			this.from = 'buyer'
			break;
		case order.store.owner:
			this.from = 'storeOwner'
			break;
		case order.marketOwner:
			this.from = 'marketOwner'
			break;
	}
}

Message.prototype.decrypt = function(privateKey){
	this.text = this.pgpMessage.decrypt(privateKey).packets[0].data
}

Update.prototype.isUpdate = true
Update.prototype.isMessage = false
Message.prototype.isUpdate = false
Message.prototype.isMessage = true

return Order

})

})();