(function(){

angular.module('safemarket').factory('Market',function(utils,ticker,$q,Store,Key,Forum){

function Market(addr){
	this.addr = addr
	this.alias = utils.getAlias(addr)
	this.contract = this.contractFactory.at(addr)
	this.updatePromise = this.update()
}

window.Market = Market

Market.prototype.code = Market.code = '0x'+contractDB.Market.compiled.code
Market.prototype.runtimeBytecode = Market.runtimeBytecode = '0x'+contractDB.Market.compiled.runtimeBytecode
Market.prototype.abi = Market.abi = contractDB.Market.compiled.info.abiDefinition
Market.prototype.contractFactory = Market.contractFactory = web3.eth.contract(Market.abi)

Market.create = function(alias,meta){
	console.log('alias',alias)
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,txObject = {
			data:this.code
			,gas:this.estimateCreationGas(alias,meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = this.contractFactory.new(alias,meta,txObject).transactionHash

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

Market.validateAlias = function(alias){
	return web3.eth.getCode(AliasReg.getAddr(alias))===this.runtimeBytecode
}

Market.check = function(alias,meta){
	utils.check({alias:alias},{
		alias:{
			presence:true
			,type:'alias'
		}
	})

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
		console.log(store)
		utils.check(store,{
			alias:{
				presence:true
				,type:'alias'
				,aliasType:'store'
			},tags:{
				type:'string'
			}
		},'Store')
	})
}

Market.estimateCreationGas = function(alias,meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	return this.contractFactory.estimateGas(alias,meta,{
		data:Market.code
	})+ AliasReg.claimAlias.estimateGas(alias)
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

	this.owner = this.contract.getOwner()
	this.forumAddr = this.contract.getForumAddr()

	this.stores = []
	this.forum = new Forum(this.forumAddr)

	this.getEvents('Meta').then(function(results){

		console.log(results)

		market.meta = utils.convertHexToObject(results[0].args.meta)

		market.meta.stores.forEach(function(storeData){
			market.stores.push(new Store(storeData.alias))
		})

		deferred.resolve(market)
	},function(error){
		console.error(error)
	})


	Key.fetch(this.owner).then(function(key){
		market.key = key
	})

	return deferred.promise
}

return Market

})

})();