/* globals angular, web3 */

angular.module('app').factory('Key', (utils, $q, Keystore, openpgp) => {

  function Key(dataHex, timestamp) {

    this.timestamp = timestamp
    this.data = web3.toAscii(dataHex)

    const packetlist = new openpgp.packet.List
    packetlist.read(this.data)

    this.key = new openpgp.key.Key(packetlist)
    this.id = this.key.primaryKey.keyid.bytes
  }

  Key.fetch = function fetchKey(addr) {

    const deferred = $q.defer()
    const blockNumber = Keystore.getUpdatedAt(addr)

    Keystore.Key({ addr: addr }, { fromBlock: blockNumber, toBlock: blockNumber }).get((error, results) => {

      if (error) {
        return deferred.reject(error)
      }

      if (results.length === 0) {
        return deferred.reject(new Error('no results found'))
      }

      try {
        const key = new Key(results[results.length - 1].args.data, web3.eth.getBlock(results[results.length - 1].blockNumber).timestamp)
        deferred.resolve(key)
      } catch (e) {
        deferred.reject(e)
      }
    })

    return deferred.promise
  }

  Key.set = function setKey(data) {

    const estimatedGas = Keystore.setKey.estimateGas(data)
    const txHex = Keystore.setKey(data, { gas: estimatedGas })
    const deferred = $q.defer()

    utils.waitForTx(txHex).then(() => {
      Key.fetch(web3.eth.defaultAcount).then((key) => {
        deferred.resolve(key)
      }, (error) => {
        deferred.reject(error)
      })
    }, (error) => {
      deferred.reject(error)
    })

    return deferred.promise
  }

  window.Key = Key

  return Key

})
