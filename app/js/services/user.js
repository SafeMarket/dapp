(function(){

angular.module('app').service('user',function($q,$rootScope,words,safemarket,modals){

	this.getStorage = function(){
		return localStorage.getItem('user')
	}

	this.setStorage = function(string){
		localStorage.setItem('user',string)
	}

	this.logout = function(){
		this.password = null
		$rootScope.isLoggedIn = false
	}

	this.checkPassword = function(password){
		try{
			userJson = CryptoJS.AES.decrypt(this.getStorage(),password).toString(CryptoJS.enc.Utf8)
			userData = JSON.parse(userJson)
			return true;
		}catch(e){
			return false
		}
	}

	this.reset = function(){
		this.setStorage('')
	}

	this.loadData = function(){
		var userJsonEncrypted = this.getStorage()
			,userJson = null
			,userData = null

		try{
			userJson = CryptoJS.AES.decrypt(this.getStorage(),this.password).toString(CryptoJS.enc.Utf8)
			userData = JSON.parse(userJson)
		}catch(e){
			console.error(e)
		}

		user = this

		if(userData){
			this.data = userData
		}else{
			this.data = {}
		}

		if(!this.data.orderAddrs)
			this.data.orderAddrs = []

		if(!this.data.storeAddrs)
			this.data.storeAddrs = []

		if(!this.data.marketAddrs)
			this.data.marketAddrs = []

		if(!this.data.account)
			this.data.account = web3.eth.defaultAccount ? web3.eth.defaultAccount : web3.eth.accounts[0]

		if(!this.data.currency)
			this.data.currency = 'USD'

		if(!this.data.keypairs)
			this.data.keypairs = []

		if(!this.data.hiddenCommentIds)
			this.data.hiddenCommentIds = []

		this.loadKeypairs()
		this.loadKeypair()
	}

	this.save = function(){
		var dataEncrypted = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.password)
		this.setStorage(dataEncrypted)
	}

	this.generateKeypair = function(){
		var deferred = $q.defer()

		safemarket.pgp.generateKeypair().then(function(keypair){
			deferred.resolve(keypair)
		})

		return deferred.promise
	}

	this.addKeypair = function(){
		var user = this
			,deferred = $q.defer()

		this.generateKeypair().then(function(keypair){
			
			var publicKey = openpgp.key.readArmored(keypair.publicKeyArmored).keys[0]
				,keyData = publicKey.toPacketlist().write()

			user.data.keypairs.push({
				private: keypair.privateKeyArmored
				,public: keypair.publicKeyArmored
				,timestamp: (new Date).getTime()
				,label: words.generateWordPair()
			})
			user.save()
			user.loadKeypairs()
			deferred.resolve()
		})

		return deferred.promise
	}

	this.loadKeypair = function(){
		var user = this
		
		safemarket.Key.fetch(user.data.account).then(function(key){
			user.keypair = _.find(user.keypairs,{id:key.id})
		})
	}

	this.loadKeypairs = function(){
		var keypairs = []

		if(this.data.keypairs)
			this.data.keypairs.forEach(function(keypairData){
				keypairs.push(new Keypair(keypairData))
			})
		
		this.keypairs = keypairs
	}

	this.getAddrs = function(){
		return [this.data.account].concat(this.data.marketAddrs.concat(this.data.storeAddrs))
	}

	function Keypair(keypairData){
		this.data = keypairData
		this.private = openpgp.key.readArmored(keypairData.private).keys[0]
		this.public = openpgp.key.readArmored(keypairData.public).keys[0]
		this.id = this.public.primaryKey.keyid.bytes
	}

})


})();