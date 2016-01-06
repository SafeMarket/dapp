(function(){

angular.module('app').service('user',function($q,$rootScope,words,pgp,Key,modals){

	var user = this

	this.getStorage = function(){
		return localStorage.getItem('user')
	}

	this.setStorage = function(string){
		localStorage.setItem('user',string)
	}

	this.setBalance = function(){
		this.balance = web3.eth.getBalance(this.data.account)
	}

	this.logout = function(){
		this.password = null
		$rootScope.isLoggedIn = false
	}

	this.setDisplayCurrencies = function(){
		$rootScope.userCurrency = user.data.currency
		$rootScope.displayCurrencies = [user.data.currency]

		if(user.data.currency!=='ETH')
			$rootScope.displayCurrencies.push('ETH')
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

		this.setBalance()
		this.loadKeypairs()
		this.loadKeypair()
	}

	this.save = function(){
		var dataEncrypted = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.password)
		this.setStorage(dataEncrypted)
	}

	this.addKeypair = function(){
		var user = this
			,deferred = $q.defer()

		pgp.generateKeypair().then(function(keypair){
			
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
			,deferred = $q.defer()
		
		Key.fetch(user.data.account).then(function(key){
			user.keypair = _.find(user.keypairs,{id:key.id})
			deferred.resolve(user.keypair)
		})

		return deferred
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

	this.decrypt = function(pgpMessageWrapper){
		var keypair

		this.keypairs.forEach(function(_keypair){
			if(pgpMessageWrapper.keyIds.indexOf(_keypair.id)){
				keypair = _keypair
				return false
			}
		})

		if(!keypair)
			return false

		pgpMessageWrapper.decrypt(keypair.private)
	}

	function Keypair(keypairData){
		this.data = keypairData
		this.private = openpgp.key.readArmored(keypairData.private).keys[0]
		this.public = openpgp.key.readArmored(keypairData.public).keys[0]
		this.id = this.public.primaryKey.keyid.bytes
	}

	this.init = function(){
		this.loadData()
		this.setDisplayCurrencies()
	}

})


})();