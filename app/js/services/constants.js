/* globals angular, web3 */

angular.module('app').service('constants', (utils) => {
  this.tera = web3.toBigNumber('1000000000000')
  this.nullAddr = utils.hexify(Array(21).join('00'))
})
