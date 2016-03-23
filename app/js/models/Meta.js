/* globals angular */

angular.module('app').factory('Meta', (utils, $q) => {

  function Meta(contract) {
    this.contract = contract
  }

  Meta.prototype.update = function updateMeta() {

    const deferred = $q.defer()
    const meta = this
    const metaUpdatedAt = this.contract.metaUpdatedAt()

    this.contract.Meta({}, { fromBlock: metaUpdatedAt, toBlock: metaUpdatedAt }).get((error, results) => {

      if (error) {
        return deferred.reject(error)
      }

      if (results.length === 0) {
        return deferred.reject(new Error('no results found'))
      }

      meta.hex = results[results.length - 1].args.meta
      meta.data = utils.convertHexToObject(results[results.length - 1].args.meta)

      deferred.resolve(meta)

    })

    return deferred.promise

  }

  Meta.prototype.getMartyrCalls = function getMetaMartyrCalls(data) {

    const hex = utils.convertObjectToHex(data)

    if (hex === this.hex) {
      return []
    }

    return [{
      address: this.contract.address,
      data: this.contract.setMeta.getData(hex)
    }]
  }


  return Meta
});