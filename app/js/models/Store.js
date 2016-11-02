/* globals angular, contracts, web3 */

angular.module('app').factory('Store', ($q, utils, ticker, Key, txMonitor, AliasReg, StoreReg, Infosphered, Meta, Coinage, constants, ipfs, ApprovesAliases) => {

  function Store(addrOrAlias) {
    console.log(this)

    this.addr = utils.isAddr(addrOrAlias) ? addrOrAlias : AliasReg.getAddr(addrOrAlias)
    this.alias = utils.getAlias(this.addr)
    this.contract = this.contractFactory.at(this.addr)
    this.infosphered = new Infosphered(this.contract, {
      isOpen: 'bool',
      currency: 'bytes32',
      bufferCentiperun: 'uint',
      disputeSeconds: 'uint',
      minProductsTeratotal: 'uint',
      affiliateFeeCentiperun: 'uint',
      fileHash: 'bytes32'
    })
    this.approvesAliases = new ApprovesAliases(this.contract)
    this.update()
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
    minProductsTeratotal,
    affiliateFeeCentiperun,
    meta,
    alias,
    productsData,
    transportsData,
    approvedAliases
  ) {

    const storeFile = utils.convertObjectToBuffer(meta)
    const storeFileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(storeFile))
    const aliasHex = web3.toHex(alias)

    const files = [storeFile]

    const productParams = []
    const transportParams = []

    productsData.forEach((productData) => {
      const productFile = Store.getProductFile(productData)
      const productFileHash = ipfs.hash(productFile)
      files.push(productFile)

      productParams.push(
        productData.isActive,
        utils.toBytes32(productData.price.in(currency).times(constants.tera)),
        utils.toBytes32(productData.units),
        utils.convertMultihashToBytes32Hex(productFileHash)
      )
    })

    transportsData.forEach((transportData) => {
      const transportFile = Store.getTransportFile(transportData)
      const transportFileHash = ipfs.hash(transportFile)
      files.push(transportFile)
      transportParams.push(
        transportData.isActive,
        utils.toBytes32(transportData.price.in(currency).times(constants.tera)),
        utils.convertMultihashToBytes32Hex(transportFileHash)
      )
    })

    return ipfs.upload(files).then((result) => {
      return txMonitor.propose(
        'Create a New Store',
        StoreReg.create,
        [
          owner,
          isOpen,
          currency,
          bufferCentiperun,
          disputeSeconds,
          minProductsTeratotal,
          affiliateFeeCentiperun,
          storeFileHash,
          aliasHex,
          productParams,
          transportParams,
          approvedAliases.map(utils.toBytes32)
        ]
      ).then((txReciept) => {
        const contractAddress = utils.getContractAddressFromTxReceipt(txReciept)
        return new Store(contractAddress)
      })
    })

  }

  Store.prototype.set = function setStore(infospheredData, meta, productsData, transportsData, approvedAliases) {

    console.log('approvedAliases', approvedAliases)

    const file = utils.convertObjectToBuffer(meta)
    const fileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(file))

    infospheredData.fileHash = fileHash

    const infospheredCalls = this.infosphered.getMartyrCalls(infospheredData)

    const productCalls = this.getProductMartyrCalls(productsData)
    const transportCalls = this.getTransportMartyrCalls(transportsData)
    const approvedAliasesCalls = this.approvesAliases.getMartyrCalls(approvedAliases)
    const allCalls = infospheredCalls.concat(productCalls).concat(transportCalls).concat(approvedAliasesCalls)
    console.log(allCalls)

    const productFiles = productsData.map((productData) => { return Store.getProductFile(productData) })
    const transportFiles = transportsData.map((transportData) => { return Store.getTransportFile(transportData) })
    const files = [file].concat(productFiles).concat(transportFiles)

    if (allCalls.length === 0) {
      return $q.reject(new Error('No updates have been made'))
    }

    return ipfs.upload(files).then(() => {
      return utils.fetchMartyrData(allCalls).then((martyrData) => {
        return txMonitor.propose('Update Store', web3.eth.sendTransaction, [{
          data: martyrData,
          gas: web3.eth.estimateGas({ data: martyrData }) * 4
        }])
      })
    })

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
      },
      base: {
        presence: true,
        type: 'string'
      },
      info: {
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


  Store.prototype.update = function update() {

    console.log('update store')

    const deferred = $q.defer()
    const store = this
    const promises = []

    this.updatePromise = deferred.promise

    this.owner = this.contract.owner()
    this.key = new Key(this.owner)

    this.infosphered.update()
    this.approvesAliases.update()
    this.currency = utils.toAscii(this.infosphered.data.currency)
    this.minProductsTotal = new Coinage(this.infosphered.data.minProductsTeratotal.div(constants.tera), this.currency)

    this.products = this.getProducts()
    this.transports = this.getTransports()
    this.submarkets = []

    const fileFetchPromise = ipfs.fetch(utils.convertBytes32HexToMultihash(this.infosphered.data.fileHash)).then((file) => {
      this.file = file
      this.meta = utils.convertBytesToObject(file)
      store.info = utils.sanitize(this.meta.info || '')
    })

    promises.push(fileFetchPromise)
    this.products.forEach((product) => {
      promises.push(product.updatePromise)
    })

    $q.all(promises).then(() => {
      deferred.resolve(store)
    }, (err) => {
      deferred.reject(err)
    })

    return deferred.promise
  }

  Store.prototype.getProducts = function getStoreProducts() {

    const products = []
    const productsLength = this.contract.getProductsLength()

    for (let i = 0; i < productsLength; i++) {
      products.push(new Product(this, i))
    }

    return products
  }

  Store.prototype.getProductMartyrCalls = function getProductMartyrCalls(productsData) {

    const calls = []

    productsData.forEach((productData) => {

      if (productData.index === undefined) {
        calls.push.apply(calls, this.getAddProductMartyrCalls(productData))
      } else {
        calls.push.apply(calls, this.getSetProductMartyrCalls(productData))
      }
    })

    return calls
  }

  Store.prototype.getAddProductMartyrCalls = function getAddProductMartyrCalls(productData) {

    const teraprice = productData.price.in(this.currency).times(constants.tera)
    const file = Store.getProductFile(productData)
    const fileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(file))

    return [{
      address: this.contract.address,
      data: this.contract.addProduct.getData(teraprice, productData.units, fileHash)
    }]

  }

  Store.prototype.getSetProductMartyrCalls = function getSetProductMartyrCalls(productData) {

    const product = new Product(this, productData.index)
    const teraprice = productData.price.in(this.currency).times(constants.tera)
    const file = Store.getProductFile(productData)
    const fileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(file))

    const calls = []

    if (product.isActive !== productData.isActive) {
      calls.push({
        address: this.contract.address,
        data: this.contract.setProductIsActive.getData(productData.index, productData.isActive)
      })
    }

    if (!product.teraprice.equals(teraprice)) {
      calls.push({
        address: this.contract.address,
        data: this.contract.setProductTeraprice.getData(productData.index, teraprice)
      })
    }

    if (!product.units.equals(productData.units)) {
      calls.push({
        address: this.contract.address,
        data: this.contract.setProductUnits.getData(productData.index, productData.units)
      })
    }

    if (product.fileHash !== fileHash) {
      calls.push({
        address: this.contract.address,
        data: this.contract.setProductFileHash.getData(productData.index, fileHash)
      })
    }

    return calls

  }

  Store.getProductFile = function getProductFile(productData) {
    return utils.convertObjectToBuffer({
      name: productData.name,
      info: productData.info,
      imgs: productData.imgs
    })
  }

  Store.prototype.getTransports = function getStoreTransports() {

    const transports = []
    const transportsLength = this.contract.getTransportsLength()

    for (let i = 0; i < transportsLength; i++) {
      transports.push(new Transport(this, i))
    }

    return transports
  }

  Store.prototype.getTransportMartyrCalls = function getTransportMartyrCalls(transportsData) {

    const calls = []

    transportsData.forEach((transportData) => {

      if (transportData.index === undefined) {
        calls.push.apply(calls, this.getAddTransportMartyrCalls(transportData))
      } else {
        calls.push.apply(calls, this.getSetTransportMartyrCalls(transportData))
      }
    })

    return calls
  }

  Store.prototype.getAddTransportMartyrCalls = function getAddTransportMartyrCalls(transportData) {

    const teraprice = transportData.price.in(this.currency).times(constants.tera)
    const file = Store.getTransportFile(transportData)
    const fileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(file))

    return [{
      address: this.contract.address,
      data: this.contract.addTransport.getData(teraprice, fileHash)
    }]

  }

  Store.prototype.getSetTransportMartyrCalls = function getSetTransportMartyrCalls(transportData) {

    const transport = new Transport(this, transportData.index)
    const teraprice = transportData.price.in(this.currency).times(constants.tera)
    const file = Store.getTransportFile(transportData)
    const fileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(file))

    const calls = []

    if (transport.isActive !== transportData.isActive) {
      calls.push({
        address: this.contract.address,
        data: this.contract.setTransportIsActive.getData(transportData.index, transportData.isActive)
      })
    }

    if (!transport.teraprice.equals(teraprice)) {
      calls.push({
        address: this.contract.address,
        data: this.contract.setTransportTeraprice.getData(transportData.index, teraprice)
      })
    }

    if (transport.fileHash !== fileHash) {
      calls.push({
        address: this.contract.address,
        data: this.contract.setTransportFileHash.getData(transportData.index, fileHash)
      })
    }

    return calls

  }

  Store.getTransportFile = function getTransportFile(transportData) {
    return utils.convertObjectToBuffer({
      name: transportData.name,
      to: transportData.isGlobal ? null : transportData.to
    })
  }

  Store.prototype.getOrders = function getOrders() {
    const orders = []

  }

  function Review(result, store) {
    this.data = utils.convertHexToObject(result.args.data)
    this.orderAddr = result.args.orderAddr

    const reviewData = store.contract.getReview(result.args.orderAddr)
    this.score = reviewData[0].toNumber()
    this.timestamp = reviewData[1].toNumber()
  }

  function Product(store, index) {
    this.store = store
    this.index = index
    this.update()
    this.quantity = 0
  }

  Product.prototype.update = function update() {
    this.isActive = this.store.contract.getProductIsActive(this.index)
    this.teraprice = this.store.contract.getProductTeraprice(this.index)
    this.units = this.store.contract.getProductUnits(this.index)
    this.price = new Coinage(this.teraprice.div(constants.tera), this.store.currency)
    this.fileHash = this.store.contract.getProductFileHash(this.index)
    this.updatePromise = ipfs.fetch(utils.convertBytes32HexToMultihash(this.fileHash)).then((file) => {
      console.log(file)
      this.file = file
      const data = JSON.parse(file)
      console.log(data)
      this.name = data.name
      this.info = data.info
      this.imgs = data.imgs || []
    })
    return this.updatePromise
  }

  function Transport(store, index) {
    this.store = store
    this.index = index
    this.update()
    this.quantity = 0
  }

  Transport.prototype.update = function update() {
    const deferred = $q.defer()
    this.updatePromise = deferred.promise
    this.isActive = this.store.contract.getTransportIsActive(this.index)
    this.teraprice = this.store.contract.getTransportTeraprice(this.index)
    this.price = new Coinage(this.teraprice.div(constants.tera), this.store.currency)
    this.fileHash = this.store.contract.getTransportFileHash(this.index)
    ipfs.fetch(utils.convertBytes32HexToMultihash(this.fileHash)).then((file) => {
      this.file = file
      const data = JSON.parse(file)
      this.name = data.name
      this.to = data.to
      this.isGlobal = !data.to
      deferred.resolve(this)
    })
    return this.updatePromise
  }

  return Store

})
