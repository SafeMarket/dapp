/* globals angular, web3, contracts */

angular.module('app').service('filestore', function filestoreService($q, utils) {

  const filestore = this

  this.contract = web3.eth.contract(contracts.Filestore.abi).at(contracts.Filestore.address)

  this.getMartyrCalls = function getMartyrCalls(files) {

    const calls = []

    files.forEach((file) => {
      const fileHex = web3.toHex(file)
      const fileHash = utils.sha3(fileHex, { encoding: 'hex' })

      if (this.contract.getBlockNumber(fileHash).greaterThan(0)) {
        return
      }

      calls.push({
        address: filestore.contract.address,
        data: filestore.contract.store.getData(fileHex)
      })

    })

    return calls
  }

  this.fetchFile = function fetchFile(fileHash) {

    console.log('fetch', fileHash)

    const deferred = $q.defer()
    const blockNumber = filestore.contract.getBlockNumber(fileHash)

    filestore.contract.Store({ hash: fileHash }, { fromBlock: blockNumber, toBlock: blockNumber }).get((error, results) => {

      console.log('Store', results)

      if (error) {
        return deferred.reject(error)
      }

      if (results.length === 0) {
        return deferred.reject(new Error('File could not be found'))
      }

      deferred.resolve(results[0].args.file)

    })

    return deferred.promise

  }

})
