(function(){

angular.module('app').service('user',function($q,$rootScope,words,pgp,Key,modals,growl){

	var user = this
		,accounts
		,keystore

	this.getSeed = function(){
		return this.seed || this.data.seed
	}

	this.getKeystore = function(){
		if(keystore) return keystore

		var seed = this.getSeed()
			,password = this.password
			,keystore = new lightwallet.keystore(seed, password)

		console.log('seed',seed)

		keystore.passwordProvider = function (callback) {
	  		callback(null, password);
		};

		keystore.generateNewAddress(password, 20);

		return keystore
	}

	this.getAccounts = function(){
		if(accounts) return accounts

		accounts = this.getKeystore().getAddresses().map(function(addr){
			return '0x'+addr
		});

		return accounts
	}

	this.getAccount = function(){
		return this.data.account || this.getAccounts()[0]
	}

	this.setAccount = function(account){
		web3.eth.defaultAccount = $rootScope.account = this.data.account = account
	}

	this.getCurrency = function(){
		return this.data.currency || 'USD'
	}

	this.setCurrency = function(currency){
		this.data.currency = currency
		this.setDisplayCurrencies()
	}

	this.getHiddenCommentIds = function(){
		return this.data.hiddenCommentIds || []
	}

	this.setHiddenCommentIds = function(hiddenCommentIds){
		this.data.hiddenCommentIds = hiddenCommentIds
	}

	this.getBalance = function(){
		var account = this.getAccount()
		return web3.eth.getBalance(account)
	}

	this.getAccountData = function(){
		return this.data.accountsData[this.getAccount()] || {}
	}

	this.getOrderAddrs = function(){
		return this.getAccountData().orderAddrs || []
	}

	this.getStoreAddrs = function(){
		return this.getAccountData().storeAddrs || []
	}

	this.getSubmarketAddrs = function(){
		return this.getAccountData().submarketAddrs || []
	}

	this.getKeypairs = function(){
		var keypairsData = this.getAccountData().keypairs || []
			,keypairs = []

		keypairsData.forEach(function(keypairData){
			keypairs.push(new Keypair(keypairData))
		})
		
		return keypairs
	}

	this.fetchKeypair = function(){
		var deferred = $q.defer()
			,account = this.getAccount()
			,keypairs = this.getKeypairs()

		console.log(keypairs)
		
		Key.fetch(account).then(function(key){
			console.log('key',key)
			var keypair = _.find(keypairs,{id:key.id})
			if(keypair)
				deferred.resolve(keypair)
			else
				deferred.reject()
		},function(err){
			console.error(err)
			deferred.reject()
		})

		return deferred.promise
	}

	this.findKeypair = function(keyId){
		return _.find(this.getKeypairs(),{id:keyId})
	}

	this.getStorage = function(){
		return localStorage.getItem('user')
	}

	this.setStorage = function(string){
		localStorage.setItem('user',string)
	}

	this.logout = function(){
		this.password = null
		acounts = null
		keystore = null
		$rootScope.isLoggedIn = false
	}

	this.register = function(password){
		this.password = password
		this.data = {
			seed: lightwallet.keystore.generateRandomSeed()
		}
		this.save()
	}

	this.setDisplayCurrencies = function(){
		$rootScope.userCurrency = this.getCurrency()
		$rootScope.displayCurrencies = [$rootScope.userCurrency]

		if($rootScope.userCurrency!=='ETH')
			$rootScope.displayCurrencies.push('ETH')
	}

	this.login = function(password){
		try{
			userJson = CryptoJS.AES.decrypt(this.getStorage(),password).toString(CryptoJS.enc.Utf8)
			this.password = password
			this.data = JSON.parse(userJson)
			return true;
		}catch(e){
			return false
		}
	}

	this.reset = function(){
		this.setStorage('')
		this.logout()
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

		this.data = userData || {}
		
		this.data.accountsData = this.data.accountsData || {}

		this.getAccounts().forEach(function(account){
			user.data.accountsData[account] = user.data.accountsData[account] || {}
		})

		web3.eth.defaultAccount = this.getAccount()
	}


	this.save = function(){
		var dataEncrypted = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.password)
		this.setStorage(dataEncrypted)
	}

	this.addKeypair = function(){
		var user = this
			,deferred = $q.defer()

		pgp.generateKeypair().then(function(keypair){
			user.getAccountData().keypairs = user.getAccountData().keypairs || []
			user.getAccountData().keypairs.push({
				private: keypair.privateKeyArmored
				,public: keypair.publicKeyArmored
				,timestamp: (new Date).getTime()
				,label: words.generateWordPair()
			})

			user.save()

			deferred.resolve()
		})

		return deferred.promise
	}

	this.addOrder = function(addr){
		this.getAccountData().orderAddrs = this.getAccountData().orderAddrs || []
		this.getAccountData().orderAddrs.push(addr)
		$rootScope.orderAddrs = this.getOrderAddrs()
	}


	this.addStore = function(addr){
		this.getAccountData().storeAddrs = this.getAccountData().storeAddrs || []
		this.getAccountData().storeAddrs.push(addr)
		$rootScope.storeAddrs = this.getStoreAddrs()
	}

	this.addSubmarket = function(addr){
		this.getAccountData().submarketAddrs = this.getAccountData().submarketAddrs || []
		this.getAccountData().submarketAddrs.push(addr)
		$rootScope.submarketAddrs = this.getSubmarketAddrs()
	}

	this.deleteKeypair = function(index){
		var keypairs = this.getKeypairs()
		keypairs = keypairs.splice(index,1)
		user.setKeypairs(keypairs)

	}

	this.verifyKeypair = function(){
		var deferred = $q.defer()

		this.fetchKeypair().then(function(){
			deferred.resolve()
		},function(){
			growl.addErrorMessage('You need to set a primary keypair in the settings menu')
			deferred.reject()
		})

		return deferred.promise
	}


	this.decrypt = function(pgpMessageWrapper){
		var keypair

		this.getKeypairs().forEach(function(_keypair){
			if(pgpMessageWrapper.keyIds.indexOf(_keypair.id)){
				keypair = _keypair
				return false
			}
		})

		if(!keypair)
			return false

		pgpMessageWrapper.decrypt(keypair.private)
		return true
	}

	function Keypair(keypairData){
		this.data = keypairData

		var privateResponse = openpgp.key.readArmored(keypairData.private)
			,publicResponse = openpgp.key.readArmored(keypairData.public)
		

		if(privateResponse.err && privateResponse.err.length>0)
			throw privateResponse.err[0]

		if(publicResponse.err && publicResponse.err.length>0)
			throw privateResponse.err[0]

		this.private = privateResponse.keys[0]
		this.public = publicResponse.keys[0]

		this.id = this.public.primaryKey.keyid.bytes
	}

	this.init = function(){
		this.loadData()
		$rootScope.account = user.getAccount()
		this.setDisplayCurrencies()

		web3.setProvider(new HookedWeb3Provider({
		  host: 'http://'+blockchain.rpcHost+':'+blockchain.rpcPort,
		  transaction_signer: this.getKeystore()
		}));
	}

})


})();