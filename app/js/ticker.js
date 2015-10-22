(function(){
angular.module('safemarket').service('ticker',function($interval,$http,$q){
  var tickerAddress = ((OpenStoreNamespace.address != '0' && OpenStoreNamespace.address) || web3.eth.accounts[0]);
	var symbols = ['CMC:TETH:USD','CMC:TETH:EUR','CMC:TETH:CNY','CMC:TETH:CAD','CMC:TETH:RUB','CMC:TETH:BTC'];
	var rates = {'ETH': (new BigNumber('1'))};

	symbols.forEach(function(symbol) {
		var currency = _.last(symbol.split(':')), rateHex = OpenStore.getValue(tickerAddress, symbol)
		
		rates[currency] = web3.toBigNumber(rateHex).div('1000000000000')
	})

	rates['WEI'] = rates.ETH.times('1000000000000000000')

	this.rates = rates
})
})();
