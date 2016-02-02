(function(){

angular.module('app').factory('Keystore',function(){
	return web3.eth.contract(contracts.Keystore.abi).at(contracts.Keystore.address)
})

})();