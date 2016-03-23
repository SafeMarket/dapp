/* global angular, web3, contracts */

angular.module('app').factory('Forum', ($q, utils, CommentsGroup) => {

  function Forum(addr) {
    this.addr = addr
    this.contract = web3.eth.contract(this.abi).at(addr)
    this.updatePromise = this.update()
  }

  Forum.prototype.bytecode = Forum.bytecode = contracts.Forum.bytecode
  Forum.prototype.abi = Forum.abi = contracts.Forum.abi

  Forum.prototype.update = function updateForum() {

    const deferred = $q.defer()
    const forum = this

    this.votes = []
    this.moderations = []
    this.commentsGroup = new CommentsGroup('0x0000000000000000000000000000000000000000000000000000000000000000', this)
    this.commentsGroup.updatePromise.then(() => {
      deferred.resolve(forum)
    })

    return deferred.promise
  }

  return Forum

})
