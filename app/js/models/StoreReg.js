/* globals angular, contracts, web3 */

angular.module('app').factory('StoreReg', () => {
  return web3.eth.contract(contracts.StoreReg.abi).at(contracts.StoreReg.address)
})
