/* globals angular, web3 */

angular.module('app').factory('Key', (utils, $q, Keystore) => {

  function Key(addr) {
    this.addr = addr

    const keyParams = Keystore.getKeyParams(addr)

    this.timestamp = keyParams[0].toNumber()
    this.pk = keyParams[1].map((byte) => {
      return byte.toNumber()
    })
    this.id = utils.getKeyId(this.pk)
  }

  return Key

})
