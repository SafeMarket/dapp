/* globals angular, web3, contracts */

angular.module('app').factory('OrderReg', () => {
  return web3.eth.contract(contracts.OrderReg.abi).at(contracts.OrderReg.address)
})
