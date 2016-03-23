/* globals angular, openpgp */

angular.module('app').factory('KeyGroup', (Key, $q) => {

  function KeyGroup(addrs) {

    const keyGroup = this
    const deferred = $q.defer()

    this.promise = deferred.promise
    this.keys = []

    const keyPromises = []
    addrs.forEach((addr) => {
      keyPromises.push(Key.fetch(addr))
    })

    $q.all(keyPromises).then((keys) => {
      keyGroup.keys = keys
      deferred.resolve(keyGroup)
    }, (error) => {
      deferred.reject(error)
    })
  }

  KeyGroup.prototype.encrypt = function encryptKeyGroup(message) {
    const deferred = $q.defer()
    const pgpKeys = []

    this.keys.forEach((key) => {
      pgpKeys.push(key.key)
    })

    openpgp.encryptMessage(pgpKeys, message).then((messageArmored) => {
      const _message = openpgp.message.readArmored(messageArmored)
      deferred.resolve(_message)
    }, (error) => {
      deferred.reject(error)
    })

    return deferred.promise
  }

  return KeyGroup

})
