angular.module('app').factory('StoreReg',function(){
	return web3.eth.contract(contracts.StoreReg.abi).at(contracts.StoreReg.address)
});
