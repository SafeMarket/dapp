(function(){

	angular.module('safemarket').service('utils',function(ticker,$q){

		

		function convertObjectToHex(object){
			var objectBytes = msgpack.pack(object);
			return '0x'+cryptocoin.convertHex.bytesToHex(objectBytes)
		}

		function convertHexToObject(hex){
			try{
				var objectBytes = cryptocoin.convertHex.hexToBytes(hex)
				return msgpack.unpack(objectBytes)
			}catch(e){
				return null
			}
		}

		function convertCurrency(amount,currencies){

			var deferred = $q.defer()

			if(typeof amount!=='string')
				amount = amount.toString()

			ticker.getRates().then(function(rates){
				check({
					amount:amount
					,from:currencies.from
					,to:currencies.to
				},{
					amount:{presence:true,type:'string',numericality:{}}
					,from:{presence:true,inclusion:Object.keys(rates),type:'string'}
					,to:{presence:true,inclusion:Object.keys(rates),type:'string'}
				})

				amount = (new BigNumber(amount))
								.div(rates[currencies.from])
								.times(rates[currencies.to])

				deferred.resolve(amount)
			},function(error){
				deferred.reject(error)
			}).catch(function(e){
				console.error(e)
			})		

			return deferred.promise
		}

		function waitForTx(txHex, duration, pause){

			var deferred = Q.defer()
				,duration = duration ? duration : (1000*20)
				,pause = pause ? pause : (1000*3)
				,timeStart = Date.now()
				,interval = setInterval(function(){

					var tx = web3.eth.getTransactionReceipt(txHex)

					if(tx){
						clearInterval(interval)
						deferred.resolve(tx)
					}

					if(Date.now() - timeStart > duration){
						clearInterval(interval)
						deferred.reject('Transaction not found after '+duration+'ms')
					}

				},pause)

			return deferred.promise

		}

		function check(data,constraints,prefix){

			if(!data)
				throw 'data is not an object'
				
			var dataKeys = Object.keys(data)
			    ,constraintKeys = Object.keys(constraints)

			constraintKeys.forEach(function(key){
				if(!constraints[key].type)
					throw key+' must be constrained by type'
			})

			dataKeys.forEach(function(key){
			    if(constraintKeys.indexOf(key)===-1)
				    delete data[key]
			})  

			var errors = validate(data,constraints)

			if(errors===undefined || errors===null)
				return null

			var error = errors[Object.keys(errors)[0]][0]

			error = prefix ? prefix+' '+error : error

		    throw error
		}

		angular.merge(this,{
			convertObjectToHex:convertObjectToHex
			,convertHexToObject:convertHexToObject
			,convertCurrency:convertCurrency
			,waitForTx:waitForTx
			,check:check
		})

	})



}());

validate.validators.type = function(value, options, key, attributes) {
  if(value === null || value === undefined) return null

  if(options==='array')
    return typeof Array.isArray(value) ? null : 'is not an array'

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