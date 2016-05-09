/* globals angular, contracts, web3 */

angular.module('app').factory('Order', (utils, ticker, $q, Store, Submarket, Key, KeyGroup, txMonitor, user, orderReg, constants, Coinage, filestore) => {

  function Order(addr) {
    this.addr = addr
    this.contract = this.contractFactory.at(addr)
    this.update()
  }

  Order.prototype.bytecode = Order.bytecode = contracts.Order.bytecode
  Order.prototype.abi = Order.abi = contracts.Order.abi
  Order.prototype.contractFactory = Order.contractFactory = web3.eth.contract(Order.abi)

  Order.create = function createOrder(buyer, storeAddr, submarketAddr, affiliate, products, transportIndex, value) {

    const deferred = $q.defer()

    const _products = products.filter((product) => { return product.quantity > 0})
    const productIndexes = _products.map((product) => { return product.index })
    const productQuantities = _products.map((product) => { return product.quantity })

    txMonitor.propose(
      'Create a New Order',
      orderReg.contract.create,
      [buyer, storeAddr, submarketAddr, affiliate, productIndexes, productQuantities, transportIndex, 0, 0, { value: value }]
    ).then((txReciept) => {
      const contractAddress = utils.getContractAddressFromTxReceipt(txReciept)
      deferred.resolve(new Order(contractAddress))
    })

    return deferred.promise
  }

  Order.check = function checkOrder(buyer, storeAddr, submarketAddr, affiliate, meta) {

    utils.check(meta, {
      products: {
        presence: true,
        type: 'array'
      }, transport: {
        presence: true,
        type: 'object'
      }
    })

    meta.products.forEach((product) => {
      utils.check(product, {
        id: {
          presence: true,
          type: 'string',
          numericality: {
            integerOnly: true,
            greaterThanOrEqualTo: 0
          }
        }, name: {
          presence: true,
          type: 'string'
        }, price: {
          presence: true,
          type: 'string',
          numericality: {
            greaterThan: 0
          }
        }, quantity: {
          type: 'number',
          numericality: {
            integerOnly: true,
            greaterThanOrEqualTo: 0
          }
        }
      }, 'Product')
    })

    utils.check(meta.transport, {
      id: {
        presence: true,
        type: 'string',
        numericality: {
          integerOnly: true,
          greaterThanOrEqualTo: 0
        }
      }, type: {
        presence: true,
        type: 'string'
      }, price: {
        presence: true,
        type: 'string',
        numericality: {
          greaterThanOrEqualTo: 0
        }
      }
    }, 'Transport')

    utils.check({
      buyer: buyer,
      storeAddr: storeAddr,
      submarketAddr: submarketAddr,
      affiliate: affiliate
    }, {
      buyer: {
        presence: true,
        type: 'address'
      }, storeAddr: {
        presence: true,
        type: 'address'
      }, submarketAddr: {
        presence: true,
        type: 'address'
      }, affiliate: {
        presence: true,
        type: 'address'
      }
    })
  }

  Order.prototype.cancel = function cancelOrder() {
    return txMonitor.propose('Cancel this Order', this.contract.cancel, [])
  }

  Order.prototype.dispute = function disputeOrder() {
    return txMonitor.propose('Dispute this Order', this.contract.dispute, [])
  }

  Order.prototype.finalize = function finalizeOrder() {
    return txMonitor.propose('Finalize this Order', this.contract.finalize, [])
  }

  Order.prototype.resolve = function resolveOrder(buyerPercentage) {
    return txMonitor.propose('Resolve this Order', this.contract.resolve, [buyerPercentage])
  }


  Order.prototype.markAsShipped = function markOrderAsShipped() {
    return txMonitor.propose('Mark the Order as Shipped', this.contract.markAsShipped, [])
  }

  Order.prototype.update = function updateOrder() {

    const deferred = $q.defer()
    const storeAddr = this.contract.storeAddr()
    const submarketAddr = this.contract.submarketAddr()
    const promises = []

    this.updatePromise = deferred.promise
    this.buyer = this.contract.buyer()
    this.affiliate = this.contract.affiliate()
    this.store = new Store(storeAddr)
    this.storeCurrency = utils.toAscii(this.contract.storeCurrency())
    this.submarket = submarketAddr === constants.nullAddr ? null : new Submarket(submarketAddr)
    this.escrowFeeCentiperun = this.contract.escrowFeeCentiperun()
    this.affiliateFeeCentiperun = this.contract.affiliateFeeCentiperun()
    this.bufferCentiperun = this.contract.bufferCentiperun()
    this.escrowFeeAmount = new Coinage(this.contract.escrowFeeTeramount().div(constants.tera), this.storeCurrency)
    this.bufferAmount = new Coinage(this.contract.bufferTeramount().div(constants.tera), this.storeCurrency)
    this.total = new Coinage(this.contract.teratotal().div(constants.tera), this.storeCurrency)
    this.balance = web3.eth.getBalance(this.addr)
    this.status = this.contract.status().toNumber()
    this.blockNumber = this.contract.blockNumber()
    this.createdAt = web3.eth.getBlock(this.blockNumber).timestamp
    this.shippedAt = this.contract.shippedAt().toNumber()
    this.disputeSeconds = this.contract.disputeSeconds().toNumber()
    this.disputeDeadline = this.disputeSeconds + this.shippedAt

    const amounts = this.contract.getAmounts()

    this.buyerAmount = amounts[0]
    this.storeAmount = amounts[1]
    this.escrowAmount = amounts[2]
    this.affiliateAmount = amounts[3]

    this.receivedAtBlockNumber = this.contract.blockNumber()
    this.confirmations = this.blockNumber.minus(web3.eth.blockNumber).times('-1')
    this.confirmationsNeeded = this.balance.div(web3.toWei(5, 'ether')).ceil()

    this.products = this.getProducts()
    this.transport = new Transport(this)

    this.keys = {}
    this.productsTotalInStoreCurrency = web3.toBigNumber(0)

    this.keys.buyer = new Key(this.buyer)
    this.keys.storeOwner = this.store.key

    if (this.submarket) {
      this.submarket.updatePromise.then((submarket) => {
        this.keys.submarketOwner = submarket.key
      })
      promises.push(this.submarket.updatePromise)
    }


    let productsTotal = web3.toBigNumber(0)
    this.products.forEach((product) => {
      const subtotal = web3.toBigNumber(product.price.in(this.storeCurrency)).times(product.quantity)
      productsTotal = productsTotal.plus(subtotal)
    })

    this.productsTotal = new Coinage(productsTotal, this.storeCurrency)

    this.unpaid = this.total.in('WEI').minus(this.balance)
    this.receivedPerun = this.balance.div(this.total.in('WEI'))

    this.messages = this.getMessages()
    this.updates = this.getUpdates()
    this.messagesAndUpdates = this.messages.concat(this.updates)

    this.review = {
      blockNumber: this.contract.reviewBlockNumber(),
      isSet: this.contract.reviewBlockNumber().greaterThan(0),
      storeScore: this.contract.reviewStoreScore().toNumber(),
      submarketScore: this.contract.reviewSubmarketScore().toNumber(),
      fileHash: this.contract.reviewFileHash()
    }

    if (this.review.isSet) {
      this.review.timestamp = web3.eth.getBlock(this.review.blockNumber).timestamp
      const reviewPromise = filestore.fetchFile(this.review.fileHash).then((file) => {
        this.review.file = file
        const data = utils.convertHexToObject(file)
        this.review.text = data.text
      })
      promises.push(reviewPromise)
    }

    this.messages.forEach((message) => {
      promises.push(message.promise)
    })

    $q.all(promises).then(() => {
      deferred.resolve(this)
    })

    return deferred.promise
  }

  Order.prototype.getPks = function getPks() {
    return Object.keys(this.keys).map((role) => {
      return this.keys[role].pk
    })
  }

  Order.prototype.addMessage = function addOrderMessage(text) {
    const crystalHex = utils.encrypt(text, this.getPks(), user.getKeypair())
    const crystalHexHash = utils.sha3(crystalHex)
    const filestoreCalls = filestore.getMartyrCalls([crystalHex])
    const addMessageCalls = [{
      address: this.contract.address,
      data: this.contract.addMessage.getData(crystalHexHash, user.getAccount())
    }]
    const allCalls = filestoreCalls.concat(addMessageCalls)
    const martyrData = utils.getMartyrData(allCalls)
    return txMonitor.propose('Add a Message', web3.eth.sendTransaction, [{
      data: martyrData
    }])
  }

  Order.prototype.withdraw = function withdrawOrder(amount) {

    const deferred = $q.defer()
    const txHex = this.contract.withdraw(amount, {
      gas: this.contract.withdraw.estimateGas(amount) * 2
    })

    utils.waitForTx(txHex).then(() => {
      deferred.resolve()
    }, (error) => {
      deferred.reject(error)
    })

    return deferred.promise
  }

  Order.prototype.setReview = function leaveOrderReview(storeScore, submarketScore, text) {
    const dataHex = utils.convertObjectToHex({
      text: text
    })
    const dataHash = utils.sha3(dataHex)

    const filestoreCalls = filestore.getMartyrCalls([dataHex])
    const setReviewCalls = [{
      address: this.contract.address,
      data: this.contract.setReview.getData(storeScore, submarketScore, dataHash)
    }]
    const allCalls = filestoreCalls.concat(setReviewCalls)
    const martyrData = utils.getMartyrData(allCalls)

    return txMonitor.propose('Set a Review', web3.eth.sendTransaction, [{ data: martyrData }])
  }

  Order.prototype.getRoleForAddr = function getOrderRoleForAddr(addr) {
    const submarketOwner = this.submarket ? this.submarket.owner : constants.nullAddr

    switch (addr) {
      case this.buyer:
        return 'buyer'
      case this.store.owner:
        return 'storeOwner'
      case submarketOwner:
        return 'submarketOwner'
      default:
        return null
    }
  }

  Order.prototype.getMessages = function getMessages() {
    const messages = []
    const messagesLength = this.contract.getMessagesLength()

    for (let i = 0; i < messagesLength; i++) {
      messages.push(new Message(this, i))
    }

    return messages
  }

  Order.prototype.getUpdates = function getUpdates() {
    const updates = []
    const updatesLength = this.contract.getUpdatesLength()

    for (let i = 0; i < updatesLength; i++) {
      updates.push(new Update(this, i))
    }

    return updates
  }

  Order.byFilter = function byFilter(filter, startIndex, length) {
    let orderAddrs = []

    if (!filter) {
      orderAddrs = orderReg.getAddrs(startIndex, length)
    } else if (filter.storeAddr) {
      orderAddrs = orderReg.getAddrsByStoreAddr(filter.storeAddr, startIndex, length)
    } else if (filter.submarketAddr) {
      orderAddrs = orderReg.getAddrsBySubmarketAddr(filter.submarketAddr, startIndex, length)
    }

    const orders = orderAddrs.map((orderAddr) => {
      return new Order(orderAddr)
    })

    return orders
  }

  function Message(order, index) {
    this.order = order
    this.index = index
    this.updatePromise = this.update()
  }

  Message.prototype.update = function update() {
    const deferred = $q.defer()
    this.blockNumber = this.order.contract.getMessageBlockNumber(this.index)
    this.timestamp = web3.eth.getBlock(this.blockNumber).timestamp
    this.sender = this.order.contract.getMessageSender(this.index)
    this.role = this.order.getRoleForAddr(this.sender)
    this.fileHash = this.order.contract.getMessageFileHash(this.index)
    filestore.fetchFile(this.fileHash).then((file) => {
      this.file = file
      this.text = web3.toAscii(utils.convertBytesToHex(utils.decrypt(this.file, user.getKeypairs())))
      deferred.resolve(this)
    })
    return deferred.promise

  }

  function Update(order, index) {
    this.order = order
    this.index = index
    this.blockNumber = this.order.contract.getUpdateBlockNumber(this.index)
    this.timestamp = web3.eth.getBlock(this.blockNumber).timestamp
    this.sender = this.order.contract.getUpdateSender(this.index)
    this.role = this.order.getRoleForAddr(this.sender)
    this.status = this.order.contract.getUpdateStatus(this.index)
  }

  Update.prototype.isUpdate = true
  Update.prototype.isMessage = false
  Message.prototype.isUpdate = false
  Message.prototype.isMessage = true

  Order.prototype.getProducts = function getStoreProducts() {

    const products = []
    const productsLength = this.contract.getProductsLength()

    for (let i = 0; i < productsLength; i++) {
      products.push(new Product(this, i))
    }

    return products
  }

  function Product(order, index) {
    this.order = order
    this.index = index
    this.updatePromise = this.update()
  }

  Product.prototype.update = function update() {
    const deferred = $q.defer()
    this.teraprice = this.order.contract.getProductTeraprice(this.index)
    this.price = new Coinage(this.teraprice.div(constants.tera), this.order.storeCurrency)
    this.fileHash = this.order.contract.getProductFileHash(this.index)
    this.quantity = this.order.contract.getProductQuantity(this.index)
    filestore.fetchFile(this.fileHash).then((file) => {
      this.file = file
      const data = utils.convertHexToObject(file)
      this.name = data.name
      this.info = data.info
      this.img = data.img
      deferred.resolve(this)
    })
    return deferred.promise
  }

  function Transport(order) {
    this.order = order
    this.updatePromise = this.update()
  }

  Transport.prototype.update = function update() {
    const deferred = $q.defer()
    this.teraprice = this.order.contract.transportTeraprice()
    this.price = new Coinage(this.teraprice.div(constants.tera), this.order.storeCurrency)
    this.fileHash = this.order.contract.transportFileHash()
    filestore.fetchFile(this.fileHash).then((file) => {
      this.file = file
      const data = utils.convertHexToObject(file)
      this.name = data.name
      deferred.resolve(this)
    })
    return deferred.promise
  }

  return Order

})
