(function(){

angular.module('app').factory('Market',function(utils,ticker,$q,Store,Key,Forum,txMonitor){

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
var meta = utils.convertObjectToHex(meta)
	,deferred = $q.defer()

txMonitor.propose(
	'Create a New Submarket'
	,this.contractFactory
	,[alias,meta,AliasReg.address,{data:this.code}]
).then(function(txReciept){
	console.log(txReciept)
	deferred.resolve(new Market(txReciept.contractAddress))
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


Market.prototype.set = function(meta){

	var meta = utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,market = this

	txMonitor.propose(
		'Update a Submarket'
		,this.contract.setMeta
		,[meta]
	).then(function(txReciept){
		market.update().then(function(){
			deferred.resolve(market)
		})
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

	this.owner = this.contract.owner()
	this.forumAddr = this.contract.forumAddr()

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