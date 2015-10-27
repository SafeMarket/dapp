(function(){

angular.module('safemarket').factory('OrderBookEntry',function($q,utils){

	function OrderBookEntry(result){
		this.result = result
		this.orderAddr = result.args.orderAddr
		this.storeAddr = result.args.storeAddr
		this.marketAddr = result.args.marketAddr
		this.usesMarket = this.marketAddr === utils.nullAddr
		this.timestamp = web3.eth.getBlock(result.blockNumber).timestamp
	}

	OrderBookEntry.fetch = function(filters){
		var orderBookEntries = []
			,deferred = $q.defer()
			,filters = filters || {}

		OrderBook.Entry(filters,{fromBlock:0,toBlock:'latest'}).get(function(error,results){
			results.forEach(function(result){
				orderBookEntries.push(new OrderBookEntry(result))
			})
			deferred.resolve(orderBookEntries)
		})

		return deferred.promise
	}

	return OrderBookEntry
})

})();