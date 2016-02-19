(function(){

angular.module('app').service('user',function($q,$rootScope,words,pgp,Key,modals,growl,Affiliate){

	var user = this
		,keystore

	this.getSeed = function(){
		if(blockchain.env=='development')
			this.data.seed = 'gasp quote useless purity isolate truly scout baby rule nest bridge february'

		return this.data.seed
	}

	this.getKeystore = function(){
		if(keystore) return keystore

		var seed = this.getSeed()
			,password = this.password

		if(!seed)
			throw 'Seed not set'

		if(!password)
			throw 'Password not set'
		
		keystore = new lightwallet.keystore(seed, password)

		keystore.passwordProvider = function (callback) {
	  		callback(null, password);
		};

		keystore.generateNewAddress(password, 20);

		return keystore
	}

	this.getAccounts = function(){

		return this.getKeystore().getAddresses().map(function(addr){
			return '0x'+addr
		});

	}

	this.getData = function(){
		if(!this.data)
			this.data = {}

		return this.data
	}

	this.getAccount = function(){
		if(!this.getData().account)
			this.getData().account = this.getAccounts()[0]

		return this.getData().account
	}

	this.setAccount = function(account){
		web3.eth.defaultAccount = $rootScope.account = this.getData().account = account
	}

	this.getCurrency = function(){
		if(!this.getData().currency)
			this.getData().currency = 'USD'

		return this.getData().currency
	}

	this.setCurrency = function(currency){
		this.getData().currency = currency
		this.setDisplayCurrencies()
	}

	this.getHiddenCommentIds = function(){
		if(!this.getData().hiddenCommentIds)
			this.getData().hiddenCommentIds = []

		return this.getData().hiddenCommentIds
	}

	this.setHiddenCommentIds = function(hiddenCommentIds){
		this.getData().hiddenCommentIds = hiddenCommentIds
	}

	this.getBalance = function(){
		var account = this.getAccount()
		return web3.eth.getBalance(account)
	}

	this.getAccountsData = function(){
		if(!this.getData().accounts)
			this.getData().accounts = {}

		return this.getData().accounts
	}

	this.getAccountData = function(){
		var account = this.getAccount()

		if(!this.getAccountsData()[account])
			this.getAccountsData()[account] = {}

		return this.getAccountsData()[account]
	}

	this.getAffiliateCodes = function(){
		if(!this.getAccountData().affiliateCodes)
			this.getAccountData().affiliateCodes = []

		return this.getAccountData().affiliateCodes
	}

	this.getAffiliates = function(){

		console.log('affiliates',this.getAffiliateCodes())

		return _.unique(this.getAffiliateCodes()).map(function(code){return new Affiliate(code)}).filter(function(affiliate){
			return !affiliate.isDeleted && user.getAccount() == affiliate.owner
		})
	}

	this.getOrderAddrs = function(){
		if(!this.getAccountData().orderAddrs)
			this.getAccountData().orderAddrs = []

		return this.getAccountData().orderAddrs
	}

	this.getStoreAddrs = function(){
		if(!this.getAccountData().storeAddrs)
			this.getAccountData().storeAddrs = []

		return this.getAccountData().storeAddrs
	}

	this.getSubmarketAddrs = function(){
		if(!this.getAccountData().submarketAddrs)
			this.getAccountData().submarketAddrs = []

		return this.getAccountData().submarketAddrs
	}

	this.getKeypairsData = function(){
		if(!this.getAccountData().keypairsData)
			this.getAccountData().keypairsData = []

		return this.getAccountData().keypairsData
	}

	this.getKeypairs = function(){

		var keypairs = []

		this.getKeypairsData().forEach(function(keypairData){
			keypairs.push(new Keypair(keypairData))
		})
		
		return keypairs
	}

	this.fetchKeypair = function(){
		var deferred = $q.defer()
			,account = this.getAccount()
			,keypairs = this.getKeypairs()
		
		Key.fetch(account).then(function(key){
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
		keystore = null
		$rootScope.isLoggedIn = false
		window.location.hash = '/login'
	}

	this.register = function(password){
		this.password = password
		this.getData().seed = lightwallet.keystore.generateRandomSeed()
		this.save()
		this.init()
		window.location.hash = '/'
	}

	this.setDisplayCurrencies = function(){
		$rootScope.userCurrency = this.getCurrency()
		$rootScope.displayCurrencies = [$rootScope.userCurrency]

		if($rootScope.userCurrency!=='ETH')
			$rootScope.displayCurrencies.push('ETH')
	}

	this.login = function(password){
		try{
			this.data = JSON.parse(CryptoJS.AES.decrypt(this.getStorage(),password).toString(CryptoJS.enc.Utf8))
		}catch(e){
			console.error(e)
			return false
		}

		this.password = password
		this.init()
		return true;
	}

	this.verifyExistence = function(){
		return !! this.getStorage()
	}

	this.reset = function(){
		this.data = null
		this.setRootScopeVars()
		this.setStorage('')
		$rootScope.userExists = false
		this.logout()
	}

	this.save = function(){
		var dataEncrypted = CryptoJS.AES.encrypt(JSON.stringify(this.getData()), this.password)
		this.setStorage(dataEncrypted)
	}

	this.addKeypair = function(){
		var user = this
			,deferred = $q.defer()

		pgp.generateKeypair().then(function(keypair){
			user.getKeypairsData().push({
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

	this.addAffiliate = function(code){
		this.getAffiliateCodes().push(code)
		this.save()
	}

	this.addOrder = function(addr){
		this.getOrderAddrs().push(addr)
		$rootScope.orderAddrs = this.getOrderAddrs()
		this.save()
	}


	this.addStore = function(addr){
		this.getStoreAddrs().push(addr)
		$rootScope.storeAddrs = this.getStoreAddrs()
		this.save()
	}

	this.addSubmarket = function(addr){
		this.getSubmarketAddrs().push(addr)
		$rootScope.submarketAddrs = this.getSubmarketAddrs()
		this.save()

	}

	this.setRootScopeVars = function(){
		$rootScope.orderAddrs = this.getOrderAddrs()
		$rootScope.storeAddrs = this.getStoreAddrs()
		$rootScope.submarketAddrs = this.getSubmarketAddrs()
		this.save()
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

	this.setProvider = function(){
		web3.setProvider(new HookedWeb3Provider({
		  host: 'http://127.0.0.1:'+blockchain.rpcport,
		  transaction_signer: this.getKeystore()
		}));
	}

	this.init = function(){
		$rootScope.isLoggedIn = true
		this.setAccount(this.getAccount())
		this.setDisplayCurrencies()
		this.setProvider()
	}

})


})();