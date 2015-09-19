(function(){
	
	console.log('run')
	var safemarket = angular.module('safemarket',[])

	safemarket.run(function(ticker,utils){
	})

	safemarket.service('safemarket',function($q,ticker,Store,Market,Order,utils,pgp){
		
		var safemarket = this

		this.Store = Store
		this.Market = Market
		this.Order = Order
		this.utils = utils
		this.pgp = pgp

	})

	safemarket.filter('status',function(){
		return function(status){
			return [
				'Initialized'
				,'Cancelled By Buyer'
				,'Cancelled By Merchant'
				,'Shipped'
				,'Finalized'
				,'Disputed'
				,'Initialized'
				,'Resolved'
			][status]
		}
	})

	safemarket.filter('disputeSeconds',function(){
		return function(disputeTime){
			var disputeTime = new BigNumber(disputeTime)

			if(disputeTime.equals(0))
				return "No Disputes Allowed"

			return disputeTime.div(86400).floor().toString()+' Days'
		}
	})

})();