(function(){

angular.module('safemarket').factory('Order',function(utils,ticker,$q,Store,Market,Key,pgp){

function Order(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.updatePromise = this.update()
}

window.Order = Order

Order.prototype.code = Order.code = '0x'+contractDB.Order.compiled.code
Order.prototype.abi = Order.abi = contractDB.Order.compiled.info.abiDefinition

Order.create = function(meta,store,market,fee,disputeSeconds){

	if(market)
		market = utils.nullAddress

	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,OrderContract = web3.eth.contract(Order.abi)
		,txObject = {
			data:Order.code
			,gas:this.estimateCreationGas(meta,merchant,admin,fee,disputeSeconds)
			,gasPrice:web3.eth.gasPrice
			,gasLimit:5141592
			,from:web3.eth.accounts[0]
		},txHex = OrderContract.new(meta,merchant,admin,fee,disputeSeconds,txObject).transactionHash

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

Order.check = function(meta,merchant,admin,fee,disputeSeconds){
	utils.check(meta,{
		storeAddr:{
			presence:true
			,type:'address'
		},marketAddr:{
			presence:true
			,type:'address'
		},products:{
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
		merchant:merchant
		,admin:admin
		,fee:fee
		,disputeSeconds:disputeSeconds
	},{
		merchant:{
			presence:true
			,type:'address'
		},admin:{
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

Order.estimateCreationGas = function(meta,merchant,admin,fee,disputeSeconds){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = $q.defer()
		,OrderContract = web3.eth.contract(this.abi)

	return OrderContract.estimateGas(meta,merchant,admin,fee,disputeSeconds,{
		data:Order.code
	})
}

Order.prototype.update = function(){

	var deferred = $q.defer()
		,order = this

	this.buyer = this.contract.getBuyer()
	this.merchant = this.contract.getMerchant()
	this.admin = this.contract.getAdmin()
	this.fee = this.contract.getFee()
	this.received = this.contract.getReceived()
	this.status = this.contract.getStatus().toNumber()
	this.timestamp = this.contract.getTimestamp()

	this.products = []
	this.messages = []
	this.keys = {}
	this.productsTotalInStoreCurrency = new BigNumber(0)

	this.contract.Meta({},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

		if(error)
			return deferred.reject(error)

		if(results.length === 0)
			return deferred.reject(new Error('no results found'))

		order.meta = utils.convertHexToObject(results[0].args.meta)
		order.market = order.meta.marketAddr !== utils.nullAddress ? new Market(order.meta.marketAddr) : null
		order.store = new Store(order.meta.storeAddr)

		Key.fetch(order.buyer).then(function(key){
			console.log('key',key.id)
			order.keys.buyer = key
		})

		if(order.market)
			order.market.updatePromise.then(function(market){
				Key.fetch(market.admin).then(function(key){
					order.keys.admin = key
				})
			})


		order.store.updatePromise.then(function(store){

			Key.fetch(order.store.merchant).then(function(key){
				order.keys.mechant = key
			})

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
			})

			deferred.resolve(order)

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
		case order.merchant:
			this.from = 'merchant'
			break;
		case order.admin:
			this.from = 'admin'
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
		case order.merchant:
			this.from = 'merchant'
			break;
		case order.admin:
			this.from = 'admin'
			break;
	}
}


Message.prototype.decrypt = function(privateKey){
	this.text = this.pgpMessage.decrypt(privateKey).packets[0].data
}

return Order

})

})();