/* globals angular, openpgp */

angular.module('app').service('pgp', function pgpService($q) {

  this.encrypt = function encrypt(publicKeys, text) {
    const deferred = $q.defer()

    openpgp.encryptMessage(publicKeys, text).then((messageArmored) => {
      const message = openpgp.message.readArmored(messageArmored)
      deferred.resolve(message)
    }).catch((error) => {
      deferred.reject(error)
    })

    return deferred.promise
  }

  this.decrypt = function decrypt(pgpMessage, privateKey, privateKeyPassword) {
    privateKeyPassword = typeof privateKeyPassword === 'string' ? privateKeyPassword : ''
    return pgpMessage.decrypt(privateKey)
  }

  this.generateKeypair = function generateKeypair(options) {
    const deferred = $q.defer()
    options = options || {
      numBits: 2048,
      userId: 'Jon Smith <jon.smith@example.org>'
    }

    openpgp.generateKeyPair(options).then((keypair) => {
      deferred.resolve(keypair)
    }).catch((error) => {
      deferred.reject(error)
    })

    return deferred.promise
  }

})
