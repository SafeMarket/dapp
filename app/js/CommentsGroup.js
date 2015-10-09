(function(){

angular.module('safemarket').factory('CommentsGroup',function($q){
	function CommentsGroup(id,forum){
		console.log('CommentsGroup')
		var commentsGroup = this
		this.id = id
		this.forum = forum
		this.comments = []
		console.log('pre update',this.update)
		this.updatePromise = this.update()
		console.log('post update')
		this.updatePromise.then(function(comments){
			commentsGroup.comments = comments
		},function(error){
			console.error(error)
		})
	}

	CommentsGroup.prototype.update = function(){
		console.log('commentsGroup update')
		var commentsGroup = this
			,deferred = $q.defer()
			,comments = []

		console.log(this.forum)

		this.forum.contract.Comment({parentId:this.id},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

			console.log('inside forum')

			if(error)
				return deferred.reject(error)

			if(results.length === 0)
				return deferred.reject(new Error('no results found'))

			results.forEach(function(result){
				comment = new Comment(result,commentsGroup.forum);
				if(comment.isRoot) comments.push(comment)
			})

			deferred.resolve(comments)
		})

		return deferred.promise
	}

	function Comment(event,forum){

		var comment = this

		this.id = event.transactionHash
		this.parentId = event.args.parentId
		this.isRoot = (new BigNumber(this.parentId)).equals(0)
		this.timestamp = web3.eth.getBlock(event.blockNumber).timestamp
		this.text = web3.toAscii(event.args.data)
		this.commentsGroup = new CommentsGroup(this.id,forum)
	}

	return CommentsGroup
})

})();