(function(){
	
	var safemarket = angular.module('safemarket',[])

	safemarket.run(function(ticker,utils){
	})

	safemarket.service('safemarket',function($q,ticker,Store,Market,Order,Key,utils,pgp){
		
		var safemarket = this

		this.Store = Store
		this.Market = Market
		this.Order = Order
		this.Key = Key
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

	safemarket.filter('alias',function(utils){
		return function(addr){
			return utils.getAlias(addr)
		}
	})

})();