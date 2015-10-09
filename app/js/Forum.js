(function(){

angular.module('safemarket').factory('Forum',function($q,utils,CommentsGroup){

	function Forum(addr){
		this.addr = addr
		this.contract = web3.eth.contract(this.abi).at(addr)
		this.updatePromise = this.update()
	}

	Forum.prototype.code = Forum.code = '0x'+contractDB.Forum.compiled.code
	Forum.prototype.abi = Forum.abi = contractDB.Forum.compiled.info.abiDefinition

	Forum.prototype.update = function(){
		console.log('forum update')
		var deferred = $q.defer()
			,forum = this

		this.votes = []
		this.moderations = []
		this.commentsGroup = new CommentsGroup('0x0000000000000000000000000000000000000000000000000000000000000000',forum)
		this.commentsGroup.updatePromise.then(function(){
			deferred.resolve(forum)
		},function(error){
			console.error(error)
		})

		return deferred.promise
	}

	Forum.prototype.addComment = function(parentId,text){
		console.log('addComment',arguments)
		var deferred = $q.defer()
			,txHex = this.contract.addComment(parentId,text,{gas:this.contract.addComment.estimateGas(parentId,text)})

		utils.waitForTx(txHex).then(function(tx){
			console.log('tx',tx)
			deferred.resolve(txHex)
		},function(error){
			deferred.reject(error)
		})

		return deferred.promise
	}

	return Forum
})

})();