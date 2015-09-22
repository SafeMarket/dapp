(function(){

angular.module('safemarket').factory('Key',function(utils,$q){

	function Key(addr){
		this.data = Keystore.getKeyData(addr)
		this.timestamp = Keystore.getKeyTimestamp(addr)

		var packetlist = new openpgp.packet.List
		packetlist.read(this.data)
		this.key = new openpgp.key.Key(packetlist)
		this.id = this.key.primaryKey.keyid.bytes
	}

	Key.set = function(data){
		console.log(utils.account)
		var estimatedGas = Keystore.setKey.estimateGas(data)
			,txHex = Keystore.setKey(data,{gas:estimatedGas})
			,deferred = $q.defer()

		utils.waitForTx(txHex).then(function(){
			var key = Key(web3.eth.defaultAccount)
			deferred.resolve(key)
		})

		return deferred.promise
	}

	return Key

})

})();