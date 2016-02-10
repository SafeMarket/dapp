angular.module('app').factory('AffiliateReg',function(){
	return web3.eth.contract(contracts.AffiliateReg.abi).at(contracts.AffiliateReg.address)
});