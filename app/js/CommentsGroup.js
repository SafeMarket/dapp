(function(){

angular.module('safemarket').factory('CommentsGroup',function($q,utils){
	function CommentsGroup(id,forum){
		var commentsGroup = this
		this.id = id
		this.forum = forum
		this.comments = []
		this.updatePromise = this.update()
	}

	CommentsGroup.prototype.addComment = function(parentId,text){
		var commentsGroup = this
			,deferred = $q.defer()
			,txHex = this.forum.contract.addComment(parentId,text,{gas:this.forum.contract.addComment.estimateGas(parentId,text)})

		utils.waitForTx(txHex).then(function(tx){
			deferred.resolve()
		},function(error){
			deferred.reject(error)
		})

		return deferred.promise
	}

	CommentsGroup.prototype.update = function(){
		var commentsGroup = this
			,deferred = $q.defer()
			,comments = []

		this.forum.contract.Comment({parentId:this.id},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

			if(error)
				return deferred.reject(error)

			results.forEach(function(result){
				comment = new Comment(commentsGroup.forum,result);
				if(comment.parentId === commentsGroup.id) comments.push(comment)
			})

			commentsGroup.comments = comments
			deferred.resolve(commentsGroup)
		})

		return deferred.promise
	}

	function Comment(forum,event){

		var comment = this

		this.id = event.transactionHash
		this.parentId = event.args.parentId
		this.timestamp = web3.eth.getBlock(event.blockNumber).timestamp
		this.text = web3.toAscii(event.args.data)
		this.commentsGroup = new CommentsGroup(this.id,forum)
	}

	return CommentsGroup
})

})();