/* globals angular */

angular.module('app').service('filestore',function($q){

  const filestore = this
	
	this.contract = web3.eth.contract(contracts.Filestore.abi).at(contracts.Filestore.address)

	this.fetchMartyrCalls = function fetchMartyrCalls(files) {
    const deferred = $q.defer()
    const calls = []
    const fetchFilePromises = []

    files.forEach(function(file){
      const fileHex = web3.toHex(file)
      const fileHash = web3.sha3(fileHex, {encoding: 'hex'})
      const fetchFilePromise = filestore.fetchFile(fileHash)

      fetchFilePromise.then((_fileHex) => {
        if (fileHex !== _fileHex) {
          calls.push({
            address: filestore.contract.address,
            data: filestore.contract.store.getData(fileHex)
          })
        }
      })

      fetchFilePromises.push(fetchFilePromise)
    })

    $q.all(fetchFilePromises).then(() => {
      deferred.resolve(calls)
    })
  
    return deferred.promise
  }

  this.fetchFile = function fetchFile(fileHash) {
    const deferred = $q.defer()
    const blockNumber = Filestore.getBlockNumber(fileHash)
    
    filestore.contract.Store({fromBlock: blockNumber, toBlock: blockNumber}).get((error, results) => {

      if (error) {
        return deferred.reject(error)
      }

      if (results.length === 0) {
        return deferred.reject(new Error('File could not be found'))
      }

      deferred.resolve(results[0].file)

    })

    return deferred.promise

  }

})