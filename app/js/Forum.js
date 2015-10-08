(function(){

angular.module('safemarket').factory('Forum',function($q,utils){

	function Forum(addr){
		this.addr = addr
		this.contract = web3.eth.contract(this.abi).at(addr)
		this.updatePromise = this.update()
	}

	Forum.prototype.code = Forum.code = '0x'+contractDB.Forum.compiled.code
	Forum.prototype.abi = Forum.abi = contractDB.Forum.compiled.info.abiDefinition

	Forum.prototype.update = function(){
		var deferred = $q.defer()
			,forum = this

		this.comments = []
		this.votes = []
		this.moderations = []

		this.contract.Comment(null,{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

			console.log(error,results)

			if(error)
				return deferred.reject(error)

			if(results.length === 0)
				return deferred.reject(new Error('no results found'))

			results.forEach(function(result){
				forum.comments.push(new Comment(result))
			})

			deferred.resolve(forum)
		})

		return deferred.promise
	}

	Forum.prototype.addComment = function(text){
		var deferred = $q.defer()
			,txHex = this.contract.addComment(0,text,{gas:this.contract.addComment.estimateGas(0,text)})

		utils.waitForTx(txHex).then(function(){
			deferred.resolve(txHex)
		},function(error){
			deferred.reject(error)
		})

		return deferred.promise
	}

	return Forum

	function Comment(event){
		this.timestamp = web3.eth.getBlock(event.blockNumber).timestamp
		this.text = web3.toAscii(event.args.data)
	}
})

}())