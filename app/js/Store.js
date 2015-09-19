(function(){

angular.module('safemarket').factory('Store',function(utils,ticker){

var currencies

ticker.getRates().then(function(rates){
	currencies = Object.keys(rates)
})

function Store(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.update()
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
		var store = new Store(tx.contractAddress)
		deferred.resolve(store)
	},function(error){
		deferred.reject(error)
	}).catch(function(){
		console.error(error)
	})

	return deferred.promise
}

Store.check = function(meta){
	console.log(meta)
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
		},disputeSeconds:{
			presence:true
			,type:'string'
			,numericality:{
				integerOnly:true
				,greaterThanOrEqualTo:0
			}
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
		store.update()
		deferred.resolve(store)
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}


Store.prototype.update = function(){
	this.meta = utils.convertHexToObject(this.contract.getMeta())
	this.products = []

	var store = this

	if(this.meta && this.meta.products)
		this.meta.products.forEach(function(productData){
			store.products.push(new Product(productData))
		})

	this.merchant = this.contract.getMerchant()
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
