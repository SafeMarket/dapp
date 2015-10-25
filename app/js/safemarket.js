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

		validate.validators.aliasOfContract = function(value, options, key, attributes){
			return utils.validateAlias(value,options) ? null : 'is not a valid '+options
		}

		validate.validators.addrOfContract = function(value, options, key, attributes){
			return utils.validateAddr(value,options) ? null : 'is not a valid '+options
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

		validate.validators.arrayOf = function(value, options, key, attributes){
			var error = null

			value.forEach(function(element){
				var _error = validate.validators.type(element,options)
				if(_error){
					error = _error
					return false
				}
			})

			return error
		}

		validate.validators.startsWith = function(value, options, key, attributes) {
		  if(!value) return null
			return _.startsWith(_.trim(value),options) ? null : 'should start with '+options
		};

		validate.validators.endsWith = function(value, options, key, attributes) {
		  if(!value) return null
		  return _.endsWith(_.trim(value),options) ? null : 'should end with '+options
		};

		validate.validators.unique = function(value, options, key, attributes){
			return _.unique(value).length === value.length ? null : 'should be unique'
		}
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
				,'Cancelled'
				,'Shipped'
				,'Finalized'
				,'Disputed'
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

			return disputeTime.div(86400).floor().toString()+' Days After Shipping'
		}
	})

	safemarket.filter('alias',function(utils){
		return function(addr){
			return utils.getAlias(addr)
		}
	})

})();