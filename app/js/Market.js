(function(){

angular.module('safemarket').factory('Market',function(utils,ticker,$q,Store){

function Market(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.update()
}

window.Market = Market

Market.prototype.code = Market.code = '0x'+contractDB.Market.compiled.code
Market.prototype.abi = Market.abi = contractDB.Market.compiled.info.abiDefinition

Market.create = function(meta){
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,MarketContract = web3.eth.contract(Market.abi)
		,txObject = {
			data:Market.code
			,gas:this.estimateCreationGas(meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = MarketContract.new(meta,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		var market = new Market(tx.contractAddress)
		deferred.resolve(market)
	},function(error){
		deferred.reject(error)
	}).catch(function(error){
		console.error(error)
	})

	return deferred.promise
}

Market.check = function(meta){
	utils.check(meta,{
		name:{
			presence:true
			,type:'string'
		},info:{
			type:'string'
		},feePercentage:{
			presence:true
			,type:'string'
			,numericality:{
				integersOnly:true
				,greaterThanOrEqualTo:0
			}
		},isOpen:{
			presence:true
			,type:'boolean'
		},stores:{
			type:'array'
		}
	})

	meta.stores.forEach(function(store){
		utils.check(store,{
			address:{
				presence:true
				,type:'string'
				,startsWith:'0x'
			},tags:{
				type:'string'
			}
		},'Store')
	})
}

Market.estimateCreationGas = function(meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = $q.defer()
		,MarketContract = web3.eth.contract(this.abi)

	return MarketContract.estimateGas(meta,{
		data:Market.code
	})
}

Market.prototype.set = function(meta){
	meta = utils.convertObjectToHex(meta)

	var deferred = $q.defer()
		,txHex = this.contract.setMeta(meta,{
			gas: this.contract.setMeta.estimateGas(meta)
		})
		,market = this

	utils.waitForTx(txHex).then(function(){
		market.update()
		deferred.resolve(market)
	},function(error){
		deferred.reject(error)
	}).catch(function(error){
		deferred.reject(error)
	})

	return deferred.promise
}


Market.prototype.update = function(){
	this.meta = utils.convertHexToObject(this.contract.getMeta())
	this.admin = this.contract.getAdmin()
	this.stores = []

	var market = this

	this.meta.stores.forEach(function(storeData){
		market.stores.push(new Store(storeData.address))
	})
}

return Market

})

}())