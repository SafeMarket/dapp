(function(){
	
	console.log('run')
	var safemarket = angular.module('safemarket',[])

	safemarket.run(function(ticker,utils){
	})

	safemarket.service('safemarket',function($q,ticker,Store,Market,utils){
		
		var safemarket = this

		this.Store = Store
		this.Market = Market
		this.utils = utils

	})

})();