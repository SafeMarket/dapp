/* globals angular, web3 */

angular.module('app').factory('CommentsGroup', ($q, utils) => {

  function CommentsGroup(id, forum) {
    this.id = id
    this.forum = forum
    this.comments = []
    this.updatePromise = this.update()
  }

  CommentsGroup.prototype.addComment = function addCommentsGroupComment(parentId, text) {

    const deferred = $q.defer()
    const txHex = this.forum.contract.addComment(parentId, text, {
      gas: this.forum.contract.addComment.estimateGas(parentId, text)
    })

    utils.waitForTx(txHex).then(() => {
      deferred.resolve()
    }, (error) => {
      deferred.reject(error)
    })

    return deferred.promise
  }

  CommentsGroup.prototype.addCommentAs = function addCommentsGroupCommentAs(parentId, text, addr) {
    const deferred = $q.defer()
    const contract = utils.getContract(addr)
    const forumAddr = this.forum.contract.address
    const txHex = contract.addComment(forumAddr, parentId, text, {
      gas: contract.addComment.estimateGas(forumAddr, parentId, text) + this.forum.contract.addComment.estimateGas(parentId, text)
    })

    utils.waitForTx(txHex).then(() => {
      deferred.resolve()
    }, (error) => {
      deferred.reject(error)
    })

    return deferred.promise
  }

  CommentsGroup.prototype.update = function updateCommentsGroup() {

    const commentsGroup = this
    const deferred = $q.defer()
    const comments = []

    this.forum.contract.Comment({
      parentId: this.id
    }, { fromBlock: 0, toBlock: 'latest' }).get((error, results) => {

      if (error) {
        return deferred.reject(error)
      }

      results.forEach((result) => {
        const comment = new Comment(commentsGroup.forum, result)
        if (comment.parentId === commentsGroup.id) {
          comments.push(comment)
        }
      })

      commentsGroup.comments = comments
      deferred.resolve(commentsGroup)
    })

    return deferred.promise
  }

  function Comment(forum, event) {
    this.id = event.transactionHash
    this.parentId = event.args.parentId
    this.timestamp = web3.eth.getBlock(event.blockNumber).timestamp
    this.author = event.args.author
    this.text = web3.toAscii(event.args.data)
    this.commentsGroup = new CommentsGroup(this.id, forum)
  }

  return CommentsGroup
})
