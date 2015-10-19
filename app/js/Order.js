(function(){

angular.module('safemarket').factory('Order',function(utils,ticker,$q,Store,Market,Key,pgp){

function Order(addr){
	this.addr = addr
	console.log('asdf')
	this.contract = this.contractFactory.at(addr)
	console.log('asdf')
	this.updatePromise = this.update()
}

window.Order = Order

Order.prototype.code = Order.code = '0x'+contractDB.Order.compiled.code
Order.prototype.abi = Order.abi = contractDB.Order.compiled.info.abiDefinition
Order.prototype.contractFactory = Order.contractFactory = web3.eth.contract(Order.abi)

Order.create = function(meta,storeAddr,marketAddr,fee,disputeSeconds){
	console.log(arguments)

	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,txObject = {
			data:Order.code
			,gas:this.estimateCreationGas(meta,storeAddr,marketAddr,fee,disputeSeconds)
		},txHex = this.contractFactory.new(meta,storeAddr,marketAddr,fee,disputeSeconds,txObject).transactionHash

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

Order.check = function(meta,storeAddr,marketAddr,fee,disputeSeconds){
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
		,fee:fee
		,disputeSeconds:disputeSeconds
	},{
		storeAddr:{
			presence:true
			,type:'address'
		},marketAddr:{
			presence:true
			,type:'address'
		},fee:{
			presence:true
			,type:'number'
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

Order.estimateCreationGas = function(meta,storeAddr,marketAddr,fee,disputeSeconds){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	return this.contractFactory.estimateGas(meta,storeAddr,marketAddr,fee,disputeSeconds,{
		data:Order.code
	})
}

Order.prototype.update = function(){

	var deferred = $q.defer()
		,order = this
		,storeAddr = this.contract.getStoreAddr()
		,marketAddr = this.contract.getMarketAddr()


	this.buyer = this.contract.getBuyer()
	this.store = new Store(storeAddr)
	this.market = marketAddr === utils.nullAddr ? null : new Market(marketAddr)
	this.fee = this.contract.getFee()
	this.received = this.contract.getReceived()
	this.status = this.contract.getStatus().toNumber()
	this.timestamp = this.contract.getTimestamp()

	this.products = []
	this.messages = []
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
			console.log('orderMeta',order.meta)


			order.meta.products.forEach(function(orderProduct){
				product = _.find(order.store.products,{id:orderProduct.id})
				product.quantity = orderProduct.quantity
				
				order.products.push(product)

				var subtotal = product.price.times(product.quantity)
				order.productsTotalInStoreCurrency = order.productsTotalInStoreCurrency.plus(subtotal)
			})

			order.productsTotal = utils.convertCurrency(order.productsTotalInStoreCurrency,{from:order.store.meta.currency,to:'ETH'})
			order.total = order.productsTotal.plus(order.fee)
			order.percentReceived = new BigNumber(web3.fromWei(order.received,'ether')).div(order.total)

			order.contract.Message({},{fromBlock:0,toBlock:'latest'}).get(function(error,results){
				results.forEach(function(result){
					var timestamp = web3.eth.getBlock(result.blockNumber).timestamp
					order.messages.push(new Message(result.args.sender,web3.toAscii(result.args.text),timestamp,order))
				})
			})

			order.contract.Update({},{fromBlock:0,toBlock:'latest'}).get(function(error,results){
				results.forEach(function(result){
					var timestamp = web3.eth.getBlock(result.blockNumber).timestamp
					order.updates.push(new Update(result.args.sender,result.args.status,timestamp,order))
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

		console.log(ciphertext)

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
	console.log('sender',sender)

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
	console.log('sender',sender)

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
	console.log(this.pgpMessage)
	this.text = this.pgpMessage.decrypt(privateKey).packets[0].data
}

return Order

})

})();