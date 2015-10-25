(function(){

angular.module('safemarket').factory('pgp',function($q,$timeout){
	var pgp = {}

	pgp.encrypt = function(publicKeys,text){
		var deferred = $q.defer()

		openpgp.encryptMessage(publicKeys,text).then(function(messageArmored) {
			var message = openpgp.message.readArmored(messageArmored)
			deferred.resolve(message)
		}).catch(function(error) {
		    deferred.reject(error)
		});
	
		return deferred.promise
	}

	pgp.decrypt = function(pgpMessage,privateKey,privateKeyPassword){

		privateKeyPassword = typeof privateKeyPassword==='string'?privateKeyPassword:''

		return pgpMessage.decrypt(privateKey)
	}

	pgp.generateKeypair = function(options){
		var deferred = $q.defer()
			,options = options ? options : {
			    numBits: 2048,
			    userId: 'Jon Smith <jon.smith@example.org>',
			};

		openpgp.generateKeyPair(options).then(function(keypair) {
		    deferred.resolve(keypair)
		}).catch(function(error) {
		    deferred.reject(error)
		});

		return deferred.promise
	}

	return pgp

})

})();