angular.module('app').factory('OrderBook',function(){
	return web3.eth.contract(contracts.OrderBook.abi).at(contracts.OrderBook.address)
});
