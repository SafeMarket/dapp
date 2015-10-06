(function(){

angular.module('safemarket').factory('Market',function(utils,ticker,$q,Store,Key,Forum){

function Market(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.updatePromise = this.update()
}

window.Market = Market

Market.prototype.code = Market.code = '0x'+contractDB.Market.compiled.code
Market.prototype.abi = Market.abi = contractDB.Market.compiled.info.abiDefinition

Market.create = function(meta){
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,MarketContract = web3.eth.contract(Market.abi)
		,txObject = {
			data:Market.code
			,gas:this.estimateCreationGas(meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = MarketContract.new(meta,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		(new Market(tx.contractAddress)).updatePromise.then(function(market){
			console.log(market)
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


Market.prototype.update = function(){
	var deferred = $q.defer()
		,market = this

	this.admin = this.contract.getAdmin()
	this.forumAddr = this.contract.getForumAddr()

	this.stores = []
	this.forum = new Forum(this.forumAddr)

	this.contract.Meta({},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

		if(error)
			return deferred.reject(error)

		if(results.length === 0)
			return deferred.reject(new Error('no results found'))

		market.meta = utils.convertHexToObject(results[0].args.meta)
		console.log(results)
		console.log(market.meta)

		market.meta.stores.forEach(function(storeData){
			market.stores.push(new Store(storeData.address))
		})

		deferred.resolve(market)
	})


	Key.fetch(this.admin).then(function(key){
		market.key = key
	})

	return deferred.promise
}

return Market

})

})();