angular.module('app').factory('Coinage',function(utils){

	function Coinage(value,currency){
		if(!currency)
			throw "Missing Coinage currency"
		this.values = {}
		this.currency = currency
		this.values[currency] = web3.toBigNumber(value)
	}

	Coinage.prototype.in = function(currency){

		if(this.values[currency])
			return this.values[currency]

		this.values[currency] = utils.convertCurrency(this.values[this.currency],{from:this.currency,to:currency})
		return this.values[currency]
	}

	Coinage.prototype.formattedIn = function(currency){
		return utils.formatCurrency(this.in(currency),currency,true)
	}

	return Coinage

});