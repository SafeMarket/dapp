(function(){

angular.module('app').service('helpers',function(safemarket,$filter,user){
	this.getUrl = function(type,addr){
		switch(type){
			case 'market':
				return '#/markets/'+addr
			case 'store':
				return '#/stores/'+addr
			default:
				return null
		}
	}

	this.confirmGas = function(gas){
		var gasInWei = web3.eth.gasPrice.times(gas)
			,gasInEther = web3.fromWei(gasInWei,'ether')
			,gasInEtherPretty = $filter('currency')(gasInEther,'ETH')
			,gasInUserCurrency = safemarket.utils.convertCurrency(gasInEther,{from:'ETH',to:user.data.currency})
			,gasInUserCurrencyPretty = $filter('currency')(gasInUserCurrency,user.data.currency)

		return confirm('That will cost around '+gasInEtherPretty+' ETH / '+gasInUserCurrencyPretty+' '+user.data.currency+'. Continue?')
	}
})

})();