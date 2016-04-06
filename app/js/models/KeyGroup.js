/* globals angular, nacl */

angular.module('app').factory('KeyGroup', (Key, $q, utils, user) => {

  function KeyGroup(addrs) {

    this.keys = addrs.map((addr) => {
      return new Key(addr)
    })

  }

  KeyGroup.prototype.getPackets = function getPackets(message) {

    const packets = {}
    const userKeypair = user.getKeypair()

    this.keys.forEach((key) => {

      const nonce = nacl.randomBytes(nacl.box.nonceLength)
      const ciphertext = nacl.box(new Uint8Array(message), nonce, new Uint8Array(key.pk), new Uint8Array(userKeypair.sk))

      console.log('ciphertext', ciphertext)

      packets[key.id] = { nonce: Array.from(nonce), ciphertext: Array.from(ciphertext) }

    })

    return packets
  }

  return KeyGroup

})
