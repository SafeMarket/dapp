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
      meta.data = utils.convertHexToObject(file)

      deferred.resolve(meta)

    }, (err) => {
      deferred.reject(err)
    })

    return deferred.promise

  }

  Meta.prototype.getMartyrCalls = function getMetaMartyrCalls(data) {

    const hex = utils.convertObjectToHex(data)

    if (hex === this.hex) {
      return []
    }

    return filestore.getMartyrCalls([hex]).concat({
      address: this.parent.contract.address,
      data: this.parent.contract.setBytes32.getData('metaHash', utils.sha3(hex))
    })

  }

  return Meta

})
