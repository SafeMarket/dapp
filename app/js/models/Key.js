(function(){

angular.module('app').factory('Key',function(utils,$q,Keystore){

	function Key(dataHex,timestamp){
		this.timestamp = timestamp
		this.data = web3.toAscii(dataHex)
			
		var packetlist = new openpgp.packet.List		
		packetlist.read(this.data)

		this.key = new openpgp.key.Key(packetlist)
		this.id = this.key.primaryKey.keyid.bytes
	}

	Key.fetch = function(addr){
		var deferred = $q.defer()

		Keystore.Key({addr:addr},{fromBlock: 0, toBlock: 'latest'}).get(function(error,results){

			if(error)
				return deferred.reject(error)

			if(results.length === 0)
				return deferred.reject(new Error('no results found'))

			try{
				var key = new Key(results[results.length-1].args.data,web3.eth.getBlock(results[results.length-1].blockNumber).timestamp)
				deferred.resolve(key)
			}catch(e){
				deferred.reject(e)
			}
		})

		return deferred.promise
	}

	Key.set = function(data){

		var estimatedGas = Keystore.setKey.estimateGas(data)
			,txHex = Keystore.setKey(data,{gas:estimatedGas})
			,deferred = $q.defer()

		utils.waitForTx(txHex).then(function(){
			Key.fetch(web3.eth.defaultAcount).then(function(key){
				deferred.resolve(key)
			},function(error){
				deferred.reject(error)
			})
		},function(error){
			deferred.reject(error)
		})

		return deferred.promise
	}

	window.Key = Key

	return Key

})

})();