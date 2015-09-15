(function(){

angular.module('safeorder').factory('Order',function(utils,ticker,$q,Store){

function Order(addr){
	this.addr = addr
	this.contract = web3.eth.contract(this.abi).at(addr)
	this.update()
}

window.Order = Order

Order.prototype.code = Order.code = '0x'+contractDB.Order.compiled.code
Order.prototype.abi = Order.abi = contractDB.Order.compiled.info.abiDefinition

Order.create = function(meta,merchantAddr,adminAddr){
	var meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)
		,deferred = $q.defer()
		,OrderContract = web3.eth.contract(Order.abi)
		,txObject = {
			data:Order.code
			,gas:this.estimateCreationGas(meta)
			,gasPrice:web3.eth.gasPrice
			,from:web3.eth.accounts[0]
		},txHex = OrderContract.new(meta,merchantAddr,adminAddr,txObject).transactionHash

	utils.waitForTx(txHex).then(function(tx){
		var order = new Order(tx.contractAddress)
		deferred.resolve(order)
	},function(error){
		deferred.reject(error)
	}).catch(function(error){
		console.error(error)
	})

	return deferred.promise
}

Order.check = function(meta){
	utils.check(meta,{
		storeAddr:{
			presence:true
			,type:'address'
		},marketAddr:{
			presence:true
			,type:'address'
		},products:{
			presence:true
			,type:'array'
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
			},quantity:{
				presence:true
				,type:'string'
				,numericality:{
					integerOnly:true
					,greaterThan:0
				}
			}
		})
	})
}

Order.estimateCreationGas = function(meta){
	meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

	var deferred = $q.defer()
		,OrderContract = web3.eth.contract(this.abi)

	return OrderContract.estimateGas(meta,{
		data:Order.code
	})
}

Order.prototype.set = function(meta){
	meta = utils.convertObjectToHex(meta)

	var deferred = $q.defer()
		,txHex = this.contract.setMeta(meta,{
			gas: this.contract.setMeta.estimateGas(meta)
		})
		,order = this

	utils.waitForTx(txHex).then(function(){
		order.update()
		deferred.resolve(order)
	},function(error){
		deferred.reject(error)
	}).catch(function(error){
		deferred.reject(error)
	})

	return deferred.promise
}


Order.prototype.update = function(){
	this.meta = utils.convertHexToObject(this.contract.getMeta())
	this.admin = this.contract.getAdmin()
	this.stores = []

	var order = this

	this.meta.stores.forEach(function(storeData){
		order.stores.push(new Store(storeData.address))
	})
}

return Order

})

}())