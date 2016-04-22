/* globals angular, contracts, web3 */

angular.module('app').factory('Store', ($q, utils, ticker, Key, txMonitor, AliasReg, StoreReg, Infosphered, Meta, Coinage, constants, filestore) => {

  function Store(addrOrAlias) {
    this.addr = utils.isAddr(addrOrAlias) ? addrOrAlias : AliasReg.getAddr(addrOrAlias)
    this.alias = utils.getAlias(this.addr)
    this.contract = this.contractFactory.at(this.addr)
    this.meta = new Meta(this)
    this.infosphered = new Infosphered(this.contract, {
      isOpen: 'bool',
      currency: 'bytes32',
      bufferCentiperun: 'uint',
      disputeSeconds: 'uint',
      minTotal: 'uint',
      affiliateFeeCentiperun: 'uint',
      metaHash: 'bytes32'
    })
    this.updatePromise = this.update()
  }

  Store.prototype.bytecode = Store.bytecode = contracts.Store.bytecode
  Store.prototype.runtimeBytecode = Store.runtimeBytecode = utils.runtimeBytecodes.Store
  Store.prototype.abi = Store.abi = contracts.Store.abi
  Store.prototype.contractFactory = Store.contractFactory = web3.eth.contract(Store.abi)

  Store.create = function createStore(
    owner,
    isOpen,
    currency,
    bufferCentiperun,
    disputeSeconds,
    minTotal,
    affiliateFeeCentiperun,
    meta,
    alias
  ) {

    console.log('create store', arguments)

    const metaHex = utils.convertObjectToHex(meta)
    const aliasHex = web3.toHex(alias)

    console.log('metaHex', metaHex)

    const metaHash = utils.sha3(metaHex, { encoding: 'hex' })

    console.log('metaHash', metaHash)

    const deferred = $q.defer()

    filestore.fetchMartyrCalls([metaHex]).then((calls) => {

      console.log('filestore', calls)
      console.log('alias', alias)

      calls.push({
        address: StoreReg.address,
        data: StoreReg.create.getData(
          owner,
          isOpen,
          currency,
          bufferCentiperun,
          disputeSeconds,
          minTotal,
          affiliateFeeCentiperun,
          metaHash,
          aliasHex
        )
      })

      const martyrData = utils.getMartyrData(calls)

      txMonitor.propose(
        'Create a New Store',
        web3.eth.sendTransaction,
        [{ data: martyrData }]
      ).then((txReciept) => {
        const contractAddress = utils.getContractAddressFromTxReceipt(txReciept)
        deferred.resolve(new Store(contractAddress))
      })

    return deferred.promise

  }

  Store.prototype.set = function setStore(infospheredData, metaData, productsData) {

    const deferred = $q.defer()
    const infospheredCalls = this.infosphered.getMartyrCalls(infospheredData)

    this.meta.fetchMartyrCalls(metaData).then((metaCalls) => {
      //const productCalls = this.getProductMartyrCalls(productsData)
      const allCalls = infospheredCalls.concat(metaCalls)
      const data = utils.getMartyrData(allCalls)

      txMonitor.propose('Update Store', web3.eth.sendTransaction, [{
        data: data,
        gas: web3.eth.estimateGas({ data: data }) * 4
      }]).then((txReciept) => {
        deferred.resolve(txReciept)
      }, (err) => {
        deferred.reject(err)
      })
    })

    return deferred.promise
  }

  Store.check = function checkStore(alias, meta) {

    utils.check({ alias: alias }, {
      alias: {
        presence: true,
        type: 'alias'
      }
    })

    utils.check(meta, {
      name: {
        presence: true,
        type: 'string'
      }, info: {
        type: 'string'
      }
    })

  }

  Store.estimateCreationGas = function estimateStoreCreationGas(alias, meta) {
    meta = typeof meta === 'string' ? meta : utils.convertObjectToHex(meta)

    return this.contractFactory.estimateGas(alias, meta, AliasReg.address, {
      data: Store.bytecode
    }) + AliasReg.claimAlias.estimateGas(alias)
  }


  Store.prototype.update = function updateStore() {

    const deferred = $q.defer()
    const store = this

    console.log(this)

<<<<<<< HEAD
    this.products = [] //this.getProducts()
=======
    this.products = this.getProducts()
>>>>>>> product-contracts
    this.transports = []
    this.reviews = []
    this.scoreCounts = []
    this.scoreCountsReversed = []
    this.scoreCountsSum = 0
    this.scoreCountsTotal = 0
    this.owner = this.contract.owner()
    this.key = new Key(this.owner)

    this.infosphered.update()

    this.currency = utils.toAscii(this.infosphered.data.currency)
    this.minTotal = new Coinage(this.infosphered.data.minTotal.div(constants.tera), this.currency)

    this.meta.update().then((meta) => {
      store.info = utils.sanitize(meta.data.info || '')
      deferred.resolve(store)
    }, (err) => {
      deferred.reject(err)
    })

    return deferred.promise
  }

  Store.prototype.getProducts = function getStoreProducts() {
<<<<<<< HEAD

    const products = []
    const productsLength = this.contract.getProductsLength()

    for (let i = 0; i < productsLength; i++) {
=======
    
    const products = []
    const productsLength = this.contract.getProductsLength()

    for (var i = 0; i < productsLength; i++) {
>>>>>>> product-contracts
      const args = [i].concat(this.contract.getFullProductParams(i))
      products.push(new (Function.prototype.bind.apply(Product, args)))
    }

    return products
  }

<<<<<<< HEAD
=======
  Store.prototype.getAddProductMartyrCalls = function getAddProductMartyrCalls(index, price, name, description) {
    const teraprice = web3.toBigNumber(price).times(constants.tera)
    return [{
      address: this.addr,
      data: this.contract.addProduct.getData(teraprice, title, description)
    }].concat(this.infosphered.getMartyrCalls({
      `p.${index}.n` : name,
      `p.${index}.d` : description
    }))
  }

>>>>>>> product-contracts
  function Review(result, store) {
    this.data = utils.convertHexToObject(result.args.data)
    this.orderAddr = result.args.orderAddr

    const reviewData = store.contract.getReview(result.args.orderAddr)
    this.score = reviewData[0].toNumber()
    this.timestamp = reviewData[1].toNumber()
  }

  function Product(index, isArchived, teraprice, title, description, currency) {
    angular.merge(this, { index, isArchived, teraprice, title, description })
    this.price = new Coinage(teraprice.div(constants.tera), currency)
    this.quantity = 0
  }

  function Transport(index, isArchived, teraprice, title, currency, userCurrency) {
    angular.merge(this, { index, isArchived, teraprice, title })
    this.price = new Coinage(teraprice.div(constants.tera), currency)
    const priceFormatted = utils.formatCurrency(this.price.in(userCurrency), userCurrency, 1)
    this.label = `${this.data.type} (${priceFormatted})`
  }

  return Store

})
