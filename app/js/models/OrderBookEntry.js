(function(){

angular.module('safemarket').factory('OrderBookEntry',function($q,utils,Order){

	function OrderBookEntry(result){
		console.log(result)
		this.result = result
		this.orderAddr = result.args.orderAddr
		this.storeAddr = result.args.storeAddr
		this.marketAddr = result.args.marketAddr
		this.usesMarket = this.marketAddr !== utils.nullAddr
		this.timestamp = web3.eth.getBlock(result.blockNumber).timestamp
		this.status = Order.contractFactory.at(this.orderAddr).getStatus().toNumber()
	}

	OrderBookEntry.fetch = function(filters){
		var orderBookEntries = []
			,deferred = $q.defer()
			,filters = filters || {}

		OrderBook.Entry(filters,{fromBlock:0,toBlock:'latest'}).get(function(error,results){
			results.forEach(function(result){
				console.log(result)
				orderBookEntries.push(new OrderBookEntry(result))
			})
			deferred.resolve(orderBookEntries)
		})

		return deferred.promise
	}

	return OrderBookEntry
})

})();