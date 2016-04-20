/* globals angular */

angular.module('app').factory('Meta', (utils, $q, filestore) => {

  function Meta(parent) {
    this.parent = parent
  }

  Meta.prototype.update = function updateMeta() {

    const deferred = $q.defer()
    const meta = this

    filestore.fetchFile(this.parent.infosphered.data.metaHash).then((file) => {

      meta.hex = file
      console.log('file received', file)
      meta.data = utils.convertHexToObject(file)

      deferred.resolve(meta)

    }, (err) => {
      deferred.reject(err)
    })

    return deferred.promise

  }

  Meta.prototype.fetchMartyrCalls = function fetchMetaMartyrCalls(data) {

    const deferred = $q.defer()
    const hex = utils.convertObjectToHex(data)

    if (hex === this.hex) {
      return []
    }

    filestore.fetchMartyrCalls([hex]).then((calls) => {
      const _calls = calls.concat({
        address: this.parent.contract.address,
        data: this.parent.contract.setBytes32.getData('metaHash', utils.sha3(hex))
      })
      deferred.resolve(_calls)
    })

    return deferred.promise

  }

  return Meta

})
