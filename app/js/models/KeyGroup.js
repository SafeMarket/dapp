/* globals angular */

angular.module('app').factory('KeyGroup', (Key, $q, utils, user) => {

  function KeyGroup(addrs) {

    this.keys = addrs.map((addr) => {
      return new Key(addr)
    })

  }

  KeyGroup.prototype.encrypt = function encryptKeyGroup(message) {

    const nacl = utils.getNacl()
    const packets = {}
    const userKeypair = user.getKeypair()
    const messageUtf8 = nacl.encode_utf8(message)

    this.keys.forEach((key) => {

      const nonce = nacl.crypto_box_random_nonce()
      const ciphertext = nacl.crypto_box(messageUtf8, nonce, key.pk, userKeypair.pk)

      console.log('ciphertext', ciphertext)

      packets[key.id] = { nonce: Array.from(nonce), ciphertext: Array.from(ciphertext) }

    })

    return packets
  }

  return KeyGroup

})
