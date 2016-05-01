// /* globals angular, web3, contracts */

angular.module('app').factory('AffiliateReg', () => {
  return web3.eth.contract(contracts.AffiliateReg.abi).at(contracts.AffiliateReg.address)
})
