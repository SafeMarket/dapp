(function(){
	
	console.log('run')
	var safemarket = angular.module('safemarket',[])

	safemarket.run(function(ticker,utils){
	})

	safemarket.service('safemarket',function($q,ticker,Storefront,Court,utils){
		
		var safemarket = this

		this.Storefront = Storefront
		this.Court = Court
		this.utils = utils

	})

})();