angular.module('safemarket').factory('Storefront',function(utils,ticker){

var currencies

ticker.getRates().then(function(rates){
	currencies = Object.keys(rates)
})

function Storefront(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.update()
}

window.Storefront = Storefront

Storefront.prototype.code = Storefront.code = '0x'+contractDB.Storefront.compiled.code
Storefront.prototype.abi = Storefront.abi = contractDB.Storefront.compiled.info.abiDefinition

Storefront.create = function(meta){
	console.log(meta)
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = Q.defer()
		,StorefrontContract = web3.eth.contract(Storefront.abi)
		,txObject = {
			data:Storefront.code
			,gas:this.estimateCreationGas(meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = StorefrontContract.new(meta,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		var storefront = new Storefront(tx.contractAddress)
		console.log(storefront)
		deferred.resolve(storefront)
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}

Storefront.check = function(meta){
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
		}
	})

	meta.products.forEach(function(product){
		utils.check(product,{
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

Storefront.estimateCreationGas = function(meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,StorefrontContract = web3.eth.contract(this.abi)

	return StorefrontContract.estimateGas(meta,{
		data:Storefront.code
	})
}

Storefront.prototype.setMeta = function(meta){
	meta = utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,storefront = this
		,txHex = this.contract.setMeta(meta,{gas:this.contract.setMeta.estimateGas(meta)})

	utils.waitForTx(txHex).then(function(){
		storefront.update()
		deferred.resolve(storefront)
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}

Storefront.prototype.checkMeta = function(){
	Storefront.checkMeta(this.meta)
}


Storefront.prototype.update = function(){
	this.meta = utils.convertHexToObject(this.contract.getMeta())
	this.products = []

	var storefront = this

	if(this.meta && this.meta.products)
		this.meta.products.forEach(function(productData){
			storefront.products.push(new Product(productData))
		})

	this.merchant = this.contract.getMerchant()
}

function Product(data){
	this.name = data.name
	this.price = new BigNumber(data.price)
	this.info = data.info
	this.quantity = 0
}

return Storefront

})
