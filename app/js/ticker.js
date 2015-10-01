(function(){
angular.module('safemarket').service('ticker',function($interval,$http,$q){
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

	var tickerAddress = "0xdc99b79555385ab2fe0ff28c3c954a07b28aac5e"
		,symbols = ['CMC:ETH:USD','CMC:ETH:EUR','CMC:ETH:CNY','CMC:ETH:CAD','CMC:ETH:RUB','CMC:ETH:BTC']
		,rates = {'ETH':new BigNumber(1)}
		,OpenStoreAbi = [{"constant":true,"inputs":[{"name":"addr","type":"address"},{"name":"key","type":"bytes32"}],"name":"getTimestamp","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"setFromContract","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"},{"name":"key","type":"bytes32"}],"name":"getValue","outputs":[{"name":"","type":"bytes"}],"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"set","outputs":[],"type":"function"}]
   		,OpenStore = web3.eth.contract(OpenStoreAbi).at("0xaf527686227cc508ead0d69c7f8a98f76b63e191")

   	window.OpenStore = OpenStore

	symbols.forEach(function(symbol){
		var currency = _.last(symbol.split(':'))
			,rateHex = OpenStore.getValue(tickerAddress,symbol)
		
		rates[currency] = web3.toBigNumber(rateHex).div('1000000000000')
	})

	console.log(rates)

	this.rates = rates

	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8101'));
})
})();