/* globals angular, blockchain, lightwallet, web3, _, CryptoJS, HookedWeb3Provider, nacl */

angular.module('app').service('user', function userService($q, $rootScope, words, Key, modals, growl, Affiliate, utils) {

  const user = this
  let keystore

  this.getSeed = function getSeed() {

    if (blockchain.env === 'development') {
      this.data.seed = 'gasp quote useless purity isolate truly scout baby rule nest bridge february'
    }

    return this.data.seed
  }

  this.getKeystore = function getKeystore() {

    if (keystore) {
      return keystore
    }

    const seed = this.getSeed()
    const password = this.password

    if (!seed) {
      throw new Error('Seed not set')
    }

    if (!password) {
      throw new Error('Password not set')
    }

    keystore = new lightwallet.keystore(seed, password)

    keystore.passwordProvider = function passwordProvider(callback) {
      callback(null, password)
    }

    keystore.generateNewAddress(password, 20)

    return keystore
  }

  this.getAccounts = function getAccounts() {

    return this.getKeystore().getAddresses().map((addr) => {
      return utils.hexify(addr)
    })

  }

  this.getData = function getData() {
    if (!this.data) {
      this.data = {}
    }

    return this.data
  }

  this.getAccount = function getAccount() {
    if (!this.getData().account) {
      this.getData().account = this.getAccounts()[0]
    }

    return this.getData().account
  }

  this.setAccount = function setAccount(account) {
    web3.eth.defaultAccount = $rootScope.account = this.getData().account = account
  }

  this.getCurrency = function getCurrency() {
    if (!this.getData().currency) {
      this.getData().currency = 'USD'
    }

    return this.getData().currency
  }

  this.setCurrency = function setCurrency(currency) {
    this.getData().currency = currency
    this.setDisplayCurrencies()
  }

  this.getHiddenCommentIds = function getHiddenCommentIds() {
    if (!this.getData().hiddenCommentIds) {
      this.getData().hiddenCommentIds = []
    }

    return this.getData().hiddenCommentIds
  }

  this.setHiddenCommentIds = function setHiddenCommentIds(hiddenCommentIds) {
    this.getData().hiddenCommentIds = hiddenCommentIds
  }

  this.getBalance = function getBalance() {
    return web3.eth.getBalance(this.getAccount())
  }

  this.getAccountsData = function getAccountsData() {
    if (!this.getData().accounts) {
      this.getData().accounts = {}
    }

    return this.getData().accounts
  }

  this.getAccountData = function getAccountsData() {
    const account = this.getAccount()

    if (!this.getAccountsData()[account]) {
      this.getAccountsData()[account] = {}
    }

    return this.getAccountsData()[account]
  }

  this.getAffiliateCodes = function getAffiliateCodes() {
    if (!this.getAccountData().affiliateCodes) {
      this.getAccountData().affiliateCodes = []
    }

    return this.getAccountData().affiliateCodes
  }

  this.getAffiliates = function getAffiliates() {
    return _.unique(this.getAffiliateCodes()).map((code) => {
      return new Affiliate(code)
    }).filter((affiliate) => {
      return !affiliate.isDeleted && user.getAccount() === affiliate.owner
    })
  }

  this.getOrderAddrs = function getOrderAddrs() {
    if (!this.getAccountData().orderAddrs) {
      this.getAccountData().orderAddrs = []
    }

    return this.getAccountData().orderAddrs
  }

  this.getStoreAddrs = function getStoreAddrs() {
    if (!this.getAccountData().storeAddrs) {
      this.getAccountData().storeAddrs = []
    }

    return this.getAccountData().storeAddrs
  }

  this.getSubmarketAddrs = function getSubmarketAddrs() {
    if (!this.getAccountData().submarketAddrs) {
      this.getAccountData().submarketAddrs = []
    }

    return this.getAccountData().submarketAddrs
  }

  this.getKeypairs = function getKeypairs() {
    if (!this.getAccountData().keypairs) {
      this.getAccountData().keypairs = []
    }

    return this.getAccountData().keypairs
  }

  this.getKeypair = function getKeypair() {

    const account = this.getAccount()
    const keypairs = this.getKeypairs()
    const key = new Key(account)

    return _.find(keypairs, (keypair) => {
      return _.isEqual(keypair.pk, key.pk)
    })

  }

  this.getStorage = function getStorage() {
    return localStorage.getItem('user')
  }

  this.setStorage = function setStorage(string) {
    localStorage.setItem('user', string)
  }

  this.logout = function logout() {
    this.password = null
    keystore = null
    $rootScope.isLoggedIn = false
    window.location.hash = '/login'
  }

  this.register = function register(password) {
    this.password = password
    this.getData().seed = lightwallet.keystore.generateRandomSeed()
    this.save()
    this.init()
    window.location.hash = '/'
  }

  this.setDisplayCurrencies = function setDisplayCurrencies() {
    $rootScope.userCurrency = this.getCurrency()
    $rootScope.displayCurrencies = _.uniq([this.getCurrency(), 'ETH'])
  }

  this.login = function login(password) {

    try {
      this.data = JSON.parse(CryptoJS.AES.decrypt(this.getStorage(), password).toString(CryptoJS.enc.Utf8))
    } catch (e) {
      return false
    }

    this.password = password
    this.init()
    return true

  }

  this.verifyExistence = function verifyExistence() {
    return !! this.getStorage()
  }

  this.reset = function reset() {
    this.data = null
    this.setStorage('')
    $rootScope.userExists = false
    this.logout()
  }

  this.save = function save() {
    this.setStorage(CryptoJS.AES.encrypt(JSON.stringify(this.getData()), this.password))
  }

  this.addKeypair = function addKeypair() {

    const boxKeypair = nacl.box.keyPair()
    const keypair = {
      label: words.generateWordPair(),
      pk: Array.from(boxKeypair.publicKey),
      sk: Array.from(boxKeypair.secretKey),
      timestamp: utils.getTimestamp()
    }

    user.getKeypairs().push(keypair)
    user.save()

    return keypair

  }

  this.addAffiliate = function addAffiliate(code) {
    this.getAffiliateCodes().push(code)
    this.save()
  }

  this.addOrder = function addOrder(addr) {
    this.getOrderAddrs().push(addr)
    $rootScope.orderAddrs = this.getOrderAddrs()
    this.save()
  }


  this.addStore = function addStore(addr) {
    this.getStoreAddrs().push(addr)
    $rootScope.storeAddrs = this.getStoreAddrs()
    this.save()
  }

  this.addSubmarket = function addSubmarket(addr) {
    this.getSubmarketAddrs().push(addr)
    $rootScope.submarketAddrs = this.getSubmarketAddrs()
    this.save()

  }

  this.setRootScopeVars = function setRootScopeVars() {
    $rootScope.orderAddrs = this.getOrderAddrs()
    $rootScope.storeAddrs = this.getStoreAddrs()
    $rootScope.submarketAddrs = this.getSubmarketAddrs()
    this.save()
  }

  this.deleteKeypair = function deleteKeypair(index) {
    user.setKeypairs(this.getKeypairs().splice(index, 1))
  }

  this.verifyKeypair = function verifyKeypair() {

    const currentKey = this.getKeypair()

    if (!currentKey) {
      growl.addErrorMessage('You need to set a primary keypair in the settings menu')
      throw new Error('Primary keypair not set')
    }

  }

  this.setProvider = function setProvider() {
    web3.setProvider(new HookedWeb3Provider({
      host: `http://127.0.0.1:${blockchain.rpcport}`,
      transaction_signer: this.getKeystore()
    }))
  }

  this.init = function init() {
    $rootScope.isLoggedIn = true
    this.setAccount(this.getAccount())
    this.setDisplayCurrencies()
    this.setProvider()
    this.setRootScopeVars()
  }

})
