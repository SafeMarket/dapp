/* globals angular, web3, contracts */

angular.module('app').factory('SubmarketReg', () => {
  return web3.eth.contract(contracts.SubmarketReg.abi).at(contracts.SubmarketReg.address)
})
