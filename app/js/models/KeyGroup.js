(function(){

angular.module('app').factory('KeyGroup',function(Key,$q){
	function KeyGroup(addrs){

		var keyGroup = this
			,deferred = $q.defer()
		
		this.promise = deferred.promise
		this.keys = []
	
		var keyPromises = []	
		addrs.forEach(function(addr){
			keyPromises.push(Key.fetch(addr))
		})

		$q.all(keyPromises).then(function(keys){
			keyGroup.keys = keys
			deferred.resolve(keyGroup)
		},function(error){
			deferred.reject(error)
		})
	}

	KeyGroup.prototype.encrypt = function(message){
		var deferred = $q.defer()
			,pgpKeys = []

		this.keys.forEach(function(key){
			pgpKeys.push(key.key)
		})

		openpgp.encryptMessage(pgpKeys,message).then(function(messageArmored) {
			var message = openpgp.message.readArmored(messageArmored)
			deferred.resolve(message)
		},function(error){
		    deferred.reject(error)
		});

		return deferred.promise
	}

	return KeyGroup
})

})();