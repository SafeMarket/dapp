(function(){

angular.module('safemarket').factory('Key',function(utils,$q){

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

			console.log(results)

			if(error)
				return deferred.reject(error)

			if(results.length === 0)
				return deferred.reject(new Error('no results found'))

			try{
				deferred.resolve(new Key(results[0].args.data,results[0].args.timestamp))
			}catch(e){
				deferred.reject(e)
			}
		})

		return deferred.promise
	}

	Key.set = function(data){

		var estimatedGas = Keystore.setKey.estimateGas(data)
			,txHex = Keystore.setKey(data,{gas:estimatedGas*2})
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