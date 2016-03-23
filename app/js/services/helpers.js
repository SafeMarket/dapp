/* globals angular, web3 */

angular.module('app').service('helpers', (utils, $filter, user) => {

  this.getUrl = function(type, addr, tabSlug) {

    switch (type) {
      case 'submarket':
        return `#/submarkets/${addr}/${tabSlug || 'about'}`
      case 'store':
        return `#/stores/${addr}/${tabSlug || 'about'}`
      case 'order':
        return `#/orders/${addr}`
      default:
        return null
    }
  }

})
