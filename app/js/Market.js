(function(){

angular.module('safemarket').factory('Market',function(utils,ticker){

function Market(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.update()
}

window.Market = Market

Market.prototype.code = Market.code = '0x'+contractDB.Market.compiled.code
Market.prototype.abi = Market.abi = contractDB.Market.compiled.info.abiDefinition

Market.create = function(meta,feeTenths){
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = Q.defer()
		,MarketContract = web3.eth.contract(Market.abi)
		,txObject = {
			data:Market.code
			,gas:this.estimateCreationGas(meta,feeTenths)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = MarketContract.new(meta,feeTenths,txObject).transactionHash

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

Market.check = function(meta,feeTenths){
	utils.check(meta,{
		name:{
			presence:true
			,type:'string'
		},info:{
			type:'string'
		}
	})

	if(typeof feeTenths!== 'string')
		feeTenths = feeTenths.toString()

	utils.check({fee:feeTenths},{
		fee:{
			presence:true
			,type:'string'
			,numericality:{
				integersOnly:true
				,greaterThanOrEqualTo:0
				,lessThanOrEqualTo:100
			}
		}
	})
}

Market.estimateCreationGas = function(meta,feeTenths){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,MarketContract = web3.eth.contract(this.abi)

	return MarketContract.estimateGas(meta,feeTenths,{
		data:Market.code
	})
}

Market.prototype.set = function(meta,feeTenths){
	meta = utils.convertObjectToHex(meta)

	var deferred = Q.defer()
		,market = this
		,txHex = this.contract.setMeta(meta,feeTenths,{gas:this.contract.setMeta.estimateGas(meta)})

	utils.waitForTx(txHex).then(function(){
		market.update()
		deferred.resolve(market)
	},function(error){
		deferred.reject(error)
	})

	return deferred.promise
}


Market.prototype.update = function(){
	this.meta = utils.convertHexToObject(this.contract.getMeta())
	this.judge = this.contract.getJudge()
	this.feeTenths = this.contract.getFeeTenths()
}

function Product(data){
	this.name = data.name
	this.price = new BigNumber(data.price)
	this.info = data.info
	this.quantity = 0
}

return Market

})

}())