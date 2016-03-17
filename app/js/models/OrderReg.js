angular.module('app').factory('OrderReg',function(){
	return web3.eth.contract(contracts.OrderReg.abi).at(contracts.OrderReg.address)
});
