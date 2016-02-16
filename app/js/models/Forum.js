(function(){

angular.module('app').factory('Forum',function($q,utils,CommentsGroup){

	function Forum(addr){
		this.addr = addr
		this.contract = web3.eth.contract(this.abi).at(addr)
		this.updatePromise = this.update()
	}

	Forum.prototype.bytecode = Forum.bytecode = contracts.Forum.bytecode
	Forum.prototype.abi = Forum.abi = contracts.Forum.abi

	Forum.prototype.update = function(){
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

	return Forum
})

})();