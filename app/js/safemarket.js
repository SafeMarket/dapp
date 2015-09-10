(function(){
	
	var safemarket = angular.module('safemarket',[])

	safemarket.service('safemarket',function($interval,$q){
		
		var safemarket = this

		this.currencies = ['USD','EUR']

		web3.eth.getGasPrice(function(error,gasPrice){
			safemarket.gasPrice = gasPrice
		})

		this.Storefront = Storefront

		this.getStorefronts = function(){
			var storefrontAddrs = Marketplace.getStorefrontAddrs()
				,storefronts = []

			storefrontAddrs.forEach(function(addr){
				try{
					storefronts.push(new Storefront(addr))
				}catch(e){
					console.warn('Could not decode storefront at',addr)
					console.warn(e)
				}
			})

			return storefronts
		}

		this.estimateStorefrontGas = function(meta){
			Storefront.checkMeta(meta)
			return Storefront.estimateGas(meta);
		}

		this.createStorefront = function(meta,gas){

			var deferred = $q.defer()
				,metaHex = convertObjectToHex(meta)
				,txObject = {
					data:Storefront.code
					,gas:gas
					,gasPrice:safemarket.gasPrice
					,from:web3.eth.accounts[0]
				},StorefrontContract = web3.eth.contract(Storefront.abi);

			console.log(meta)
			console.log(metaHex)
			console.log(txObject)

			var txHex = StorefrontContract.new(metaHex,txObject).transactionHash

			safemarket.waitForTx(txHex).then(function(tx){
				var storefront = new Storefront(tx.contractAddress)
				deferred.resolve(storefront)
			},function(){
				deferred.reject()
			})

			return deferred.promise
		}

		this.getStorefront = function(addr){
			return new Storefront(addr)
		}

		this.waitForTx = function waitForTx(txHex, duration, pause){

			var deferred = $q.defer()
				,duration = duration ? duration : (1000*60)
				,pause = pause ? pause : (1000*3)
				,timeStart = Date.now()
				,interval = $interval(function(){

					var tx = web3.eth.getTransactionReceipt(txHex)

					if(tx){
						$interval.cancel(interval)
						deferred.resolve(tx)
					}

					if(Date.now() - timeStart > duration){
						$interval.cancel(interval)
						deferred.reject()
					}

				},pause)

			return deferred.promise

		}

	})

function Storefront(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.update()
}

window.Storefront = Storefront

Storefront.prototype.code = Storefront.code = '0x'+contractDB.Storefront.compiled.code
Storefront.prototype.abi = Storefront.abi = contractDB.Storefront.compiled.info.abiDefinition

Storefront.checkMeta = function(meta){
	check(meta,{
		name:{
			presence:true
			,type:'string'
		},currency:{
			presence:true
			,type:'string'
			,inclusion:safemarket.currencies
		},products:{
			presence:true
			,type:'array'
		}
	})

	meta.products.forEach(function(product){
		check(product,{
			name:{
				presence:true
				,type:'string'
			},price:{
				presence:true
				,type:'string'
				,numericality:{
					greaterThan:0
				}
			},info:{
				type:'string'
			}
		},'Product')
	})
}

Storefront.estimateGas = function(meta){
	meta = convertObjectToHex(meta)

	var deferred = Q.defer()
		,StorefrontContract = web3.eth.contract(this.abi)

	StorefrontContract.estimateGas(meta,{
		data:Storefront.code
	},function(error,gas){
		if(error)
			deferred.reject(error)
		else
			deferred.resolve(gas)
	})

	return deferred.promise
}

Storefront.prototype.checkMeta = function(){
	Storefront.checkMeta(this.meta)
}


Storefront.prototype.update = function(){
	this.meta = convertHexToObject(this.contract.getMeta())
	this.merchant = this.contract.getMerchant()
}

function convertObjectToHex(object){
	var objectBytes = msgpack.pack(object);
	return '0x'+cryptocoin.convertHex.bytesToHex(objectBytes)
}

function convertHexToObject(hex){
	var objectBytes = cryptocoin.convertHex.hexToBytes(hex)
	return msgpack.unpack(objectBytes)
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



}());

