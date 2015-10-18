(function(){

angular.module('safemarket').factory('Store',function($q,utils,ticker,Key){

var currencies = Object.keys(ticker.rates)

function Store(addrOrAlias){
	this.addr = utils.isAddr(addrOrAlias) ? addrOrAlias : AliasReg.getAddr(addrOrAlias)
	this.alias = utils.getAlias(this.addr)
	this.contract = this.contractFactory.at(this.addr)
	this.updatePromise = this.update()
}

window.Store = Store

Store.prototype.code = Store.code = '0x'+contractDB.Store.compiled.code
Store.prototype.runtimeBytecode = Store.runtimeBytecode = '0x'+contractDB.Store.compiled.runtimeBytecode
Store.prototype.abi = Store.abi = contractDB.Store.compiled.info.abiDefinition
Store.prototype.contractFactory = Store.contractFactory = web3.eth.contract(Store.abi)

Store.create = function(alias,meta){

	console.log('alias',alias)
	
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = Q.defer()
		,StoreContract = web3.eth.contract(Store.abi)
		,txObject = {
			data:Store.code
			,gas:this.estimateCreationGas(alias,meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = StoreContract.new(alias,meta,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		(new Store(tx.contractAddress).updatePromise.then(function(store){
			deferred.resolve(store)
		}))
	},function(error){
		deferred.reject(error)
	}).catch(function(){
		console.error(error)
	})

	return deferred.promise
}

Store.validateAlias = function(alias){
	return web3.eth.getCode(AliasReg.getAddr(alias))===this.runtimeBytecode
}

Store.check = function(alias,meta){
	utils.check({alias:alias},{
		alias:{
			presence:true
			,type:'alias'
		}
	})

	utils.check(meta,{
		name:{
			presence:true
			,type:'string'
		},currency:{
			presence:true
			,type:'string'
			,inclusion:currencies
		},products:{
			presence:true
			,type:'array'
			,length:{minimum:1}
		},disputeSeconds:{
			presence:true
			,type:'string'
			,numericality:{
				integerOnly:true
				,greaterThanOrEqualTo:0
			}
		},isOpen:{
			presence:true
			,type:'boolean'
		},info:{
			type:'string'
		}
	})

	meta.products.forEach(function(product){
		utils.check(product,{
			id:{
				presence:true
				,type:'string'
				,numericality:{
					integerOnly:true
					,greaterThanOrEqualTo:0
				}
			},name:{
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

Store.estimateCreationGas = function(alias,meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	return this.contractFactory.estimateGas(alias,meta,{
		data:Store.code
	})+AliasReg.claimAlias.estimateGas(alias)
}

Store.prototype.setMeta = function(meta){

	meta = utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,store = this
		,txHex = this.contract.setMeta(meta,{gas:this.contract.setMeta.estimateGas(meta)})

	utils.waitForTx(txHex).then(function(){
		store.update().then(function(store){
			deferred.resolve(store)
		})
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}


Store.prototype.update = function(){
	var deferred = $q.defer()
		,store = this

	this.products = []
	this.merchant = this.contract.getMerchant()

	console.log(this.contract)

	this.contract.Meta({},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

		if(error)
			return deferred.reject(error)

		if(results.length === 0)
			return deferred.reject(new Error('no results found'))

		store.meta = utils.convertHexToObject(results[0].args.meta)

		if(store.meta && store.meta.products)
			store.meta.products.forEach(function(productData){
				store.products.push(new Product(productData))
			})

		deferred.resolve(store)
	})

	Key.fetch(this.merchant).then(function(key){
		store.key = key
	})

	return deferred.promise
}

function Product(data){
	this.id = data.id
	this.name = data.name
	this.price = new BigNumber(data.price)
	this.info = data.info

	this.quantity = 0
}

return Store

})

})();
