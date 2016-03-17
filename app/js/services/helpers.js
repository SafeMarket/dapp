(function(){

angular.module('app').service('helpers',function(utils,$filter,user){
	this.getUrl = function(type,addr,tabSlug){

		switch(type){
			case 'submarket':
				return '#/submarkets/'+addr+'/'+(tabSlug||'about')
			case 'store':
				return '#/stores/'+addr+'/'+(tabSlug||'about')
			case 'order':
				return '#/orders/'+addr
			default:
				return null
		}
	}

	this.confirmGas = function(gas){
		var gasInWei = web3.eth.gasPrice.times(gas)
			,gasInEther = web3.fromWei(gasInWei,'ether')
			,gasInEtherPretty = $filter('currency')(gasInEther,'ETH')
			,gasInUserCurrency = utils.convertCurrency(gasInEther,{from:'ETH',to:user.getCurrency()})
			,gasInUserCurrencyPretty = $filter('currency')(gasInUserCurrency,user.getCurrency())

		if(web3.eth.syncing){
			alert('Your node is still syncing. Please wait until sync is complete.')
			return false;
		}

		if(web3.eth.getBalance(user.data.account).lessThan(gasInWei)){
			alert('Not enough funds to cover gas costs. You need at least '+gasInEtherPretty+' ETH / '+gasInUserCurrencyPretty+' '+user.getCurrency()+'.')
			return false
		}

		return confirm('That will cost around '+gasInEtherPretty+' ETH / '+gasInUserCurrencyPretty+' '+user.getCurrency()+'. Continue?')
	}
})

})();