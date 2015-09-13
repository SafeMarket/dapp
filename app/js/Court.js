angular.module('safemarket').factory('Court',function(utils,ticker){

var currencies

ticker.getRates().then(function(rates){
	currencies = Object.keys(rates)
})

function Court(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.update()
}

window.Court = Court

Court.prototype.code = Court.code = '0x'+contractDB.Court.compiled.code
Court.prototype.abi = Court.abi = contractDB.Court.compiled.info.abiDefinition

Court.create = function(meta){
	console.log(meta)
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = Q.defer()
		,CourtContract = web3.eth.contract(Court.abi)
		,txObject = {
			data:Court.code
			,gas:this.estimateCreationGas(meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = CourtContract.new(meta,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		var court = new Court(tx.contractAddress)
		console.log(court)
		deferred.resolve(court)
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}

Court.check = function(meta){
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

Court.estimateCreationGas = function(meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,CourtContract = web3.eth.contract(this.abi)

	return CourtContract.estimateGas(meta,{
		data:Court.code
	})
}

Court.prototype.setMeta = function(meta){
	meta = utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,court = this
		,txHex = this.contract.setMeta(meta,{gas:this.contract.setMeta.estimateGas(meta)})

	utils.waitForTx(txHex).then(function(){
		court.update()
		deferred.resolve(court)
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}

Court.prototype.checkMeta = function(){
	Court.checkMeta(this.meta)
}


Court.prototype.update = function(){
	this.meta = utils.convertHexToObject(this.contract.getMeta())
	this.products = []

	var court = this

	if(this.meta && this.meta.products)
		this.meta.products.forEach(function(productData){
			court.products.push(new Product(productData))
		})

	this.merchant = this.contract.getMerchant()
}

function Product(data){
	this.name = data.name
	this.price = new BigNumber(data.price)
	this.info = data.info
	this.quantity = 0
}

return Court

})
