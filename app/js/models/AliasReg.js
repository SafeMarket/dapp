/* globals angular, web3, contracts */

angular.module('app').factory('AliasReg', () => {
  return web3.eth.contract(contracts.AliasReg.abi).at(contracts.AliasReg.address)
})
