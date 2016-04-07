/* globals angular, nacl */

angular.module('app').factory('KeyGroup', (Key) => {

  function KeyGroup(addrs) {

    this.keys = addrs.map((addr) => {
      return new Key(addr)
    })

  }

  KeyGroup.prototype.getPks = function getKeyGroupPks() {
    return this.keys.map((key) => {
      return key.pk
    })
  }

  return KeyGroup

})
