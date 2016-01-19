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

		if(!this.data.seed)
			this.data.seed = this.seed || lightwallet.keystore.generateRandomSeed();

		var ks = new lightwallet.keystore(this.data.seed, this.password);
		ks.generateNewAddress(this.password, 20);
		this.accounts = ks.getAddresses().map(function(addr){
			return '0x'+addr
		});

		ks.passwordProvider = function (callback) {
	  		callback(null, user.password);
		};

		web3.setProvider(new HookedWeb3Provider({
		  host: 'http://'+blockchain.rpcHost+':'+blockchain.rpcPort,
		  transaction_signer: ks
		}));


		if(!this.data.orderAddrs)
			this.data.orderAddrs = []

		if(!this.data.storeAddrs)
			this.data.storeAddrs = []

		if(!this.data.submarketAddrs)
			this.data.submarketAddrs = []

		if(!this.data.account)
			this.data.account = this.accounts[0]

		web3.eth.defaultAccount = this.data.account

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
		return [this.data.account].concat(this.data.submarketAddrs.concat(this.data.storeAddrs))
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