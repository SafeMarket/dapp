/* globals angular, web3, contracts */

angular.module('app').factory('Keystore', () => {
  return web3.eth.contract(contracts.Keystore.abi).at(contracts.Keystore.address)
})
