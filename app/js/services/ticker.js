(function(){

angular.module('app').service('ticker',function($interval,$http,$q){

	if(blockchain.env==='production'){
		var OpenStore = web3.eth.contract(contracts.OpenStore.abi).at("0xaf527686227cc508ead0d69c7f8a98f76b63e191")
			,tickerAddress = '0xdc99b79555385ab2fe0ff28c3c954a07b28aac5e'
	}else{
		var OpenStore = web3.eth.contract(contracts.OpenStore.abi).at(contracts.OpenStore.address)
			,tickerAddress = deployer
	}

	var symbols = ['CMC:TETH:USD','CMC:TETH:EUR','CMC:TETH:CNY','CMC:TETH:CAD','CMC:TETH:RUB','CMC:TETH:BTC'];
	var rates = {'ETH': (new BigNumber('1'))};

	symbols.forEach(function(symbol) {
		var currency = _.last(symbol.split(':')), rateHex = OpenStore.getValue(tickerAddress, symbol)
		
		rates[currency] = rates[currency] = rateHex === '0x' ? new BigNumber(0) : web3.toBigNumber(rateHex).div('1000000000000')
	})

	rates['WEI'] = rates.ETH.times('1000000000000000000')

	this.rates = rates
})

})();
