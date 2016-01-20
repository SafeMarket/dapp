angular.module('app').factory('AliasReg',function(){
	return web3.eth.contract(contracts.AliasReg.abi).at(contracts.AliasReg.address)
});