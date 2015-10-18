(function(){
	
	var safemarket = angular.module('safemarket',[])

	safemarket.run(function(ticker,utils,Store,Market){
		validate.validators.exists = function(value, options, key, attributes) {
			if(options===true)
				if(value === null || value === undefined)
					return value+' is '+(typeof value)
				else
					return null
			else
				if(value === null || value === undefined)
					return null
				else
					return value+' is '+(typeof value)
		};

		validate.validators.aliasType = function(value, options, key, attributes){
			console.log('aliasType',arguments)
			if(options==='store')
		    	return  Store.validateAlias(value) ? null : '@'+value+' is not a valid store'
		    if(options==='market')
		    	return  Market.validateAlias(value) ? null : '@'+value+' is not a valid market'
		}

		validate.validators.type = function(value, options, key, attributes) {
			if(value === null || value === undefined) return null

			if(options==='array')
		    	return typeof Array.isArray(value) ? null : 'is not an array'

		    if(options==='identity')
		    	return _.startsWith(value,'0x') && value.length===132 ? null : 'is not a valid identity'

		    if(options==='address')
		    	return _.startsWith(value,'0x') && value.length===42 ? null : 'is not a valid address'

		    if(options==='alias')
		    	if (value.valueOf() !== value.toLowerCase().replace(/[^a-z]/g, '').valueOf())
		    		return 'can only be lower case letters'
		    	else
		    		return null

			return typeof value===options ? null : 'is not a '+options
		};

		validate.validators.startsWith = function(value, options, key, attributes) {
		  if(!value) return null
			return _.startsWith(_.trim(value),options) ? null : 'should start with '+options
		};

		validate.validators.endsWith = function(value, options, key, attributes) {
		  if(!value) return null
		  return _.endsWith(_.trim(value),options) ? null : 'should end with '+options
		};
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

			if(disputeTime===undefined)
				return ''

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