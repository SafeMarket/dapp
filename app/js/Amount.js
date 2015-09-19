(function(){
	angular.module('safemarket').factory('Amount',function(utils,ticker){

		function Amount(value,currency){	
			var amount = this

			ticker.getRates().then(function(rates){
				var currencies = Object.keys(rates)

				currencies.forEach(function(_currency){
					utils.convertCurrency(value,{from:currency,to:_currency}).then(function(_amount){
						amount[_currency] = _amount
					})
				})
			})
		}

		return Amount
	})	
})();