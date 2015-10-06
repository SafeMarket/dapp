(function(){

angular.module('safemarket').factory('Forum',function(){

	function Forum(addr){
		this.addr = addr
		this.contract = web3.eth.contract(this.abi).at(addr)
		this.updatePromise = this.update()
	}

	Forum.prototype.code = Forum.code = '0x'+contractDB.Forum.compiled.code
	Forum.prototype.abi = Forum.abi = contractDB.Forum.compiled.info.abiDefinition

	Forum.prototype.update = function(){
		var deferred = $q.defer()
			,market = this

		this.comments = []
		this.votes = []
		this.moderations = []

		this.contract.Comment({},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

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

	return Forum
})

}())