(function(){

angular.module('app').factory('Submarket',function(utils,ticker,$q,Store,Key,Forum,txMonitor,AliasReg){

function Submarket(addr){
	this.addr = addr
	this.alias = utils.getAlias(addr)
	this.contract = this.contractFactory.at(addr)
	this.updatePromise = this.update()
}

window.Submarket = Submarket

Submarket.prototype.bytecode = Submarket.bytecode = contracts.Submarket.bytecode
Submarket.prototype.runtimeBytecode = Submarket.runtimeBytecode = utils.runtimeBytecodes.Submarket
Submarket.prototype.abi = Submarket.abi = contracts.Submarket.abi
Submarket.prototype.contractFactory = Submarket.contractFactory = web3.eth.contract(Submarket.abi)

Submarket.create = function(alias,meta){
var meta = utils.convertObjectToHex(meta)
	,deferred = $q.defer()

txMonitor.propose(
	'Create a New Subsubmarket'
	,this.contractFactory
	,[alias,meta,AliasReg.address,contracts.Infosphere.address,{data:this.bytecode}]
).then(function(txReciept){
	console.log(txReciept)
	deferred.resolve(new Submarket(txReciept.contractAddress))
})

return deferred.promise
}

Submarket.check = function(alias,meta){

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


Submarket.prototype.set = function(meta){

	var meta = utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,submarket = this

	txMonitor.propose(
		'Update a Subsubmarket'
		,this.contract.setMeta
		,[meta]
	).then(function(txReciept){
		submarket.update().then(function(){
			deferred.resolve(submarket)
		})
	})

	return deferred.promise
}

Submarket.prototype.getEvents = function(eventName,fromBlock,toBlock){
	var deferred = $q.defer()
		,fromBlock = fromBlock || 0
		,toBlock = toBlock || 'lastest'

	this.contract[eventName]({},{fromBlock:fromBlock,toBlock:toBlock}).get(function(error,results){
		if(error)
			deferred.reject(error)
		else
			deferred.resolve(results)
	})

	return deferred.promise
}


Submarket.prototype.update = function(){
	var deferred = $q.defer()
		,submarket = this

	this.owner = this.contract.owner()
	this.forumAddr = this.contract.forumAddr()

	this.stores = []
	this.forum = new Forum(this.forumAddr)

	var metaUpdatedAt = this.contract.metaUpdatedAt()

	this.getEvents('Meta',metaUpdatedAt,metaUpdatedAt).then(function(results){

		submarket.meta = utils.convertHexToObject(results[results.length-1].args.meta)
		submarket.feePercentage = new BigNumber(submarket.meta.feePercentage)

		deferred.resolve(submarket)
	},function(error){
		console.error(error)
	})


	Key.fetch(this.owner).then(function(key){
		submarket.key = key
	})

	return deferred.promise
}

return Submarket

})

})();