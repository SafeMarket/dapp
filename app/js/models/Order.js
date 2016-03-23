/* globals angular, contracts, web3 */

angular.module('app').factory('Order', (utils, ticker, $q, Store, Submarket, Key, KeyGroup, PgpMessageWrapper, txMonitor, user, OrderReg, constants, Coinage) => {

  function Order(addr) {
    this.addr = addr
    this.contract = this.contractFactory.at(addr)
    this.updatePromise = this.update()
  }

  window.Order = Order

  Order.prototype.bytecode = Order.bytecode = contracts.Order.bytecode
  Order.prototype.abi = Order.abi = contracts.Order.abi
  Order.prototype.contractFactory = Order.contractFactory = web3.eth.contract(Order.abi)

  Order.create = function createOrder(buyer, storeAddr, submarketAddr, affiliate, meta, value) {

    const deferred = $q.defer()
    const store = new Store(storeAddr)
    const parties = [web3.eth.defaultAccount, store.owner]

    meta = utils.convertObjectToHex(meta)

    if (submarketAddr !== constants.nullAddr) {
      const submarket = new Submarket(submarketAddr)
      const submarketOwner = submarket.owner
      parties.push(submarketOwner)
    }

    const keyGroup = new KeyGroup(parties)

    keyGroup.promise.then(() => {

      keyGroup.encrypt(meta).then((pgpMessage) => {

        const _meta = web3.fromAscii(pgpMessage.packets.write())

        txMonitor.propose(
          'Create a New Order',
          OrderReg.create,
          [buyer, storeAddr, submarketAddr, affiliate, 0, 0, _meta, { value: value }]
        ).then((txReciept) => {
          const contractAddress = utils.getContractAddressFromTxReceipt(txReciept)
          deferred.resolve(new Order(contractAddress))
        })
      }, (error) => {
        deferred.reject(error)
      })

    }, (error) => {
      deferred.reject(error)
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
    const order = this
    const storeAddr = this.contract.storeAddr()
    const submarketAddr = this.contract.submarketAddr()

    this.buyer = this.contract.buyer()
    this.affiliate = this.contract.affiliate()
    this.store = new Store(storeAddr)
    this.submarket = submarketAddr === constants.nullAddr ? null : new Submarket(submarketAddr)
    this.escrowFeeCentiperun = this.contract.escrowFeeCentiperun()
    this.affiliateFeeCentiperun = this.contract.affiliateFeeCentiperun()
    this.balance = web3.eth.getBalance(this.addr)
    this.received = this.contract.getReceived()
    this.status = this.contract.status().toNumber()
    this.createdAtBlockNumber = this.contract.createdAtBlockNumber()
    this.createdAt = web3.eth.getBlock(this.createdAtBlockNumber).timestamp
    this.shippedAt = this.contract.shippedAt().toNumber()
    this.disputeSeconds = this.contract.disputeSeconds().toNumber()
    this.disputeDeadline = this.disputeSeconds + this.shippedAt

    const amounts = this.contract.getAmounts()

    this.buyerAmount = amounts[0]
    this.storeAmount = amounts[1]
    this.escrowAmount = amounts[2]
    this.affiliateAmount = amounts[3]

    this.receivedAtBlockNumber = this.contract.receivedAtBlockNumber()
    this.confirmations = this.receivedAtBlockNumber.minus(web3.eth.blockNumber).times('-1').toNumber()
    this.confirmationsNeeded = this.received.div(web3.toWei(5, 'ether')).ceil().toNumber()

    this.messages = []
    this.updates = []
    this.keys = {}
    this.productsTotalInStoreCurrency = web3.toBigNumber(0)

    Key.fetch(this.buyer).then((key) => {
      order.keys.buyer = key
    })

    Key.fetch(this.store.owner).then((key) => {
      order.keys.storeOwner = key
    })

    if (this.submarket) {
      order.submarket.updatePromise.then((submarket) => {
        Key.fetch(submarket.owner).then((key) => {
          order.keys.submarketOwner = key
        })
      })
    }

    order.contract.Meta({}, { fromBlock: 0, toBlock: 'latest' }).get((error, results) => {

      if (error) {
        return deferred.reject(error)
      }

      if (results.length === 0) {
        return deferred.reject(new Error('no results found'))
      }

      const metaPgpMessageWrapper = new PgpMessageWrapper(web3.toAscii(results[results.length - 1].args.meta))

      user.decrypt(metaPgpMessageWrapper)

      order.meta = utils.convertHexToObject(metaPgpMessageWrapper.text)

      let productsTotalInOrderCurrency = web3.toBigNumber(0)
      order.meta.products.forEach((product) => {
        const subtotal = web3.toBigNumber(product.price).times(product.quantity)
        productsTotalInOrderCurrency = productsTotalInOrderCurrency.plus(subtotal)
      })

      order.productsTotal = new Coinage(productsTotalInOrderCurrency, order.store.currency)
      order.transportPrice = new Coinage(order.meta.transport.price, order.store.currency)

      const totalInStoreCurrency =
        order.productsTotal.in(order.store.currency)
          .plus(order.transportPrice.in(order.store.currency))
          .times(order.escrowFeeCentiperun.div(100).plus(1))

      order.total = new Coinage(totalInStoreCurrency, order.store.currency)
      order.unpaid = order.total.in('WEI').minus(order.received)
      order.receivedPerun = order.received.div(order.total.in('WEI'))

      order.contract.Message({}, { fromBlock: 0, toBlock: 'latest' }).get((_error, _results) => {

        _results.forEach((result) => {
          const timestamp = web3.eth.getBlock(result.blockNumber).timestamp
          order.messages.push(new Message(result.args.sender, web3.toAscii(result.args.text), timestamp, order))
        })

        order.contract.Update({}, { fromBlock: 0, toBlock: 'latest' }).get((__error, __results) => {
          __results.forEach((result) => {
            const timestamp = web3.eth.getBlock(result.blockNumber).timestamp
            order.updates.push(new Update(result.args.sender, result.args.status.toNumber(), timestamp, order))
          })

          deferred.resolve(order)
        })

      })

    })


    return deferred.promise

  }

  Order.prototype.addMessage = function addOrderMessage(pgpMessage) {
    const ciphertext = pgpMessage.packets.write()
    return txMonitor.propose('Add a Message', this.contract.addMessage, [ciphertext])
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

  Order.prototype.leaveReview = function leaveOrderReview(score, text) {
    const dataHex = utils.convertObjectToHex({
      text: text
    })

    return txMonitor.propose('Leave a Review', this.store.contract.leaveReview, [this.addr, score, dataHex])
  }

  Order.prototype.getRoleForAddr = function getOrderRoleForAddr(addr) {
    switch (addr) {
      case this.buyer:
        return 'buyer'
      case this.store.owner:
        return 'storeOwner'
      case this.submarket.owner:
        return 'submarketOwner'
      default:
        return null
    }
  }

  function Message(sender, ciphertext, timestamp, order) {

    this.sender = sender
    this.from = order.getRoleForAddr(sender)
    this.ciphertext = ciphertext
    this.pgpMessageWrapper = new PgpMessageWrapper(ciphertext)
    this.timestamp = timestamp
    this.text = this.pgpMessageWrapper.text

  }

  function Update(sender, status, timestamp, order) {

    this.sender = sender
    this.from = order.getRoleForAddr(sender)
    this.status = status
    this.timestamp = timestamp

  }

  Update.prototype.isUpdate = true
  Update.prototype.isMessage = false
  Message.prototype.isUpdate = false
  Message.prototype.isMessage = true

  return Order

})
