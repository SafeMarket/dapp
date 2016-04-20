/* globals angular, web3, contracts */

angular.module('app').service('filestore', function filestoreService($q) {

  const filestore = this

  this.contract = web3.eth.contract(contracts.Filestore.abi).at(contracts.Filestore.address)

  this.fetchMartyrCalls = function fetchMartyrCalls(files) {

    console.log('fetchMartyrCalls')

    const deferred = $q.defer()
    const calls = []
    const fetchFilePromises = []

    files.forEach((file) => {
      const fileHex = web3.toHex(file)
      const fileHash = web3.sha3(fileHex, { encoding: 'hex' })
      const fetchFilePromise = filestore.fetchFile(fileHash)

      fetchFilePromises.push(fetchFilePromise)

      fetchFilePromise.then((_fileHex) => {
        console.log('fileHex', _fileHex === fileHex)
        if (fileHex !== _fileHex) {
          calls.push({
            address: filestore.contract.address,
            data: filestore.contract.store.getData(fileHex)
          })
        }
      }, () => {
        calls.push({
          address: filestore.contract.address,
          data: filestore.contract.store.getData(fileHex)
        })
      })

    })

    $q.allSettled(fetchFilePromises).then(() => {
      deferred.resolve(calls)
    }, (err) => {
      deferred.reject(err)
    })

    return deferred.promise
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
