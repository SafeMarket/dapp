angular.module('app').factory('SubmarketReg',function(){
	return web3.eth.contract(contracts.SubmarketReg.abi).at(contracts.SubmarketReg.address)
});
