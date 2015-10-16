(function(){

angular.module('safemarket').factory('Market',function(utils,ticker,$q,Store,Key,Forum){

function Market(addr){
	if(this.runtimeBytecode !== web3.eth.getCode(addr))
		throw new Error('Invalid')

	this.addr = addr
	this.contract = this.contractFactory.at(addr)
	this.updatePromise = this.update()
}

window.Market = Market

Market.prototype.code = Market.code = '0x'+contractDB.Market.compiled.code
Market.prototype.runtimeBytecode = Market.runtimeBytecode = '0x'+contractDB.Market.compiled.runtimeBytecode
Market.prototype.abi = Market.abi = contractDB.Market.compiled.info.abiDefinition
Market.prototype.contractFactory = Market.contractFactory = web3.eth.contract(Market.abi)

Market.create = function(meta){
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,txObject = {
			data:this.code
			,gas:this.estimateCreationGas(meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = this.contractFactory.new(meta,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		(new Market(tx.contractAddress)).updatePromise.then(function(market){
			deferred.resolve(market)
		})
	},function(error){
		deferred.reject(error)
	}).catch(function(error){
		console.error(error)
	})

	return deferred.promise
}

Market.check = function(meta){
	utils.check(meta,{
		name:{
			presence:true
			,type:'string'
		},info:{
			type:'string'
		},feePercentage:{
			presence:true
			,type:'string'
			,numericality:{
				integersOnly:true
				,greaterThanOrEqualTo:0
			}
		},isOpen:{
			presence:true
			,type:'boolean'
		},stores:{
			exists:true
			,type:'array'
		}
	})

	meta.stores.forEach(function(store){
		utils.check(store,{
			address:{
				presence:true
				,type:'string'
				,startsWith:'0x'
			},tags:{
				type:'string'
			}
		},'Store')
	})
}

Market.estimateCreationGas = function(meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = $q.defer()
		,MarketContract = web3.eth.contract(this.abi)

	return MarketContract.estimateGas(meta,{
		data:Market.code
	})
}

Market.prototype.claimAliases = function(aliases){

	console.log(aliases)

	var market = this
		,txHex = this.contract.claimAliases(aliases,{
			gas:(this.contract.claimAliases.estimateGas(aliases)+AliasReg.claimAliases.estimateGas(aliases))
		}),deferred = $q.defer()

	utils.waitForTx(txHex).then(function(){
		deferred.resolve()		
	})

	return deferred.promise
}

Market.prototype.set = function(meta){
	meta = utils.convertObjectToHex(meta)

	var deferred = $q.defer()
		,txHex = this.contract.setMeta(meta,{
			gas: this.contract.setMeta.estimateGas(meta)
		})
		,market = this

	utils.waitForTx(txHex).then(function(){
		market.update().then(function(){
			deferred.resolve(market)
		})
	},function(error){
		deferred.reject(error)
	}).catch(function(error){
		deferred.reject(error)
	})

	return deferred.promise
}

Market.prototype.getEvents = function(eventName){
	var deferred = $q.defer()

	this.contract[eventName]({},{fromBlock:0,toBlock:'latest'}).get(function(error,results){
		console.log(arguments)
		if(error)
			deferred.reject(error)
		else
			deferred.resolve(results)
	})

	return deferred.promise
}


Market.prototype.update = function(){
	var deferred = $q.defer()
		,market = this

	this.admin = this.contract.getAdmin()
	this.forumAddr = this.contract.getForumAddr()
	this.aliases = utils.getAliases(this.contract.address)

	this.stores = []
	this.forum = new Forum(this.forumAddr)

	this.getEvents('Meta').then(function(results){

		console.log(results)

		market.meta = utils.convertHexToObject(results[0].args.meta)

		market.meta.stores.forEach(function(storeData){
			market.stores.push(new Store(storeData.address))
		})

		deferred.resolve(market)
	},function(error){
		console.error(error)
	})


	Key.fetch(this.admin).then(function(key){
		market.key = key
	})

	return deferred.promise
}

return Market

})

})();