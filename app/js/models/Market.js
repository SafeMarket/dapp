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
Market.prototype.runtimeBytecode = Market.runtimeBytecode = utils.runtimeBytecodes.Market
Market.prototype.abi = Market.abi = contractDB.Market.compiled.info.abiDefinition
Market.prototype.contractFactory = Market.contractFactory = web3.eth.contract(Market.abi)

Market.create = function(alias,meta){

	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,txObject = {
			data:this.code
			,gas:this.estimateCreationGas(alias,meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = this.contractFactory.new(alias,meta,AliasReg.address,txObject).transactionHash

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
		},storeAddrs:{
			exists:true
			,type:'array'
			,unique:true
		}
	})

	meta.storeAddrs.forEach(function(storeAddr){
		utils.check({
			addr:storeAddr
		},{
			addr:{
				presence:true
				,type:'address'
				,addrOfContract:'Store'
			}
		})

	})
}

Market.estimateCreationGas = function(alias,meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	return this.contractFactory.estimateGas(alias,meta,AliasReg.address,{
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

		market.meta = utils.convertHexToObject(results[results.length-1].args.meta)
		market.feePercentage = new BigNumber(market.meta.feePercentage)

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