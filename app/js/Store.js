(function(){

angular.module('safemarket').factory('Store',function($q,utils,ticker,Key){

var currencies = Object.keys(ticker.rates)

function Store(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.updatePromise = this.update()
}

window.Store = Store

Store.prototype.code = Store.code = '0x'+contractDB.Store.compiled.code
Store.prototype.abi = Store.abi = contractDB.Store.compiled.info.abiDefinition

Store.create = function(meta){
	
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = Q.defer()
		,StoreContract = web3.eth.contract(Store.abi)
		,txObject = {
			data:Store.code
			,gas:this.estimateCreationGas(meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = StoreContract.new(meta,txObject).transactionHash

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

Store.check = function(meta){
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

Store.estimateCreationGas = function(meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,StoreContract = web3.eth.contract(this.abi)

	return StoreContract.estimateGas(meta,{
		data:Store.code
	})
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

	this.contract.Meta({fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

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
