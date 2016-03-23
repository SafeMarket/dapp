/* globals angular, openpgp */

angular.module('app').factory('PgpMessageWrapper', () => {

  function PgpMessageWrapper(ciphertext) {

    const pgpMessageWrapper = this
    const packetlist = new openpgp.packet.List

    packetlist.read(ciphertext)

    this.pgpMessage = openpgp.message.Message(packetlist)
    this.pgpMessageArmored = this.pgpMessage.armor()
    this.keyIds = []
    this.text = null

    this.pgpMessage.packets.forEach((packet) => {

      if (!packet.publicKeyId) {
        return true
      }

      if (pgpMessageWrapper.keyIds.indexOf(packet.publicKeyId.bytes) > -1) {
        return true
      }

      pgpMessageWrapper.keyIds.push(packet.publicKeyId.bytes)

    })
  }

  PgpMessageWrapper.prototype.decrypt = function decryptPgpMessageWrapper(privateKey) {
    console.log(privateKey)
    this.text = this.pgpMessage.decrypt(privateKey).packets[0].data
  }

  return PgpMessageWrapper
})
