/* globals angular, contracts, web3 */

angular.module('app').factory('Submarket', (utils, ticker, $q, Store, Key, Forum, txMonitor, AliasReg, SubmarketReg, Infosphered, Meta) => {

  function Submarket(addr, isDeep) {
    this.addr = addr
    this.isDeep = !!isDeep
    this.alias = utils.getAlias(addr)
    this.contract = this.contractFactory.at(addr)
    this.meta = new Meta(this.contract)
    this.infosphered = new Infosphered(this.contract, this.infospheredTypes)
    this.updatePromise = this.update()
  }

  window.Submarket = Submarket

  Submarket.prototype.bytecode = Submarket.bytecode = contracts.Submarket.bytecode
  Submarket.prototype.runtimeBytecode = Submarket.runtimeBytecode = utils.runtimeBytecodes.Submarket
  Submarket.prototype.abi = Submarket.abi = contracts.Submarket.abi
  Submarket.prototype.contractFactory = Submarket.contractFactory = web3.eth.contract(Submarket.abi)
  Submarket.prototype.infospheredTypes = Submarket.infospheredTypes = {
    isOpen: 'bool',
    currency: 'bytes32',
    minTotal: 'uint',
    escrowFeeCentiperun: 'uint'
  }

  Submarket.create = function createSubmarket(isOpen, currency, minTotal, escrowFeeCentiperun, meta, alias) {

    meta = utils.convertObjectToHex(meta)
    minTotal = web3.toBigNumber(minTotal)
    escrowFeeCentiperun = web3.toBigNumber(escrowFeeCentiperun)

    const deferred = $q.defer()

    txMonitor.propose(
      'Create a New Submarket',
      SubmarketReg.create,
      [isOpen, currency, minTotal, escrowFeeCentiperun, meta, alias]
    ).then((txReciept) => {
      const contractAddress = utils.getContractAddressFromTxReceipt(txReciept)
      deferred.resolve(new Submarket(contractAddress))
    })

    return deferred.promise
  }

  Submarket.check = function checkSubmarket(alias, meta) {

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
      }, storeAddrs: {
        exists: true,
        type: 'array',
        unique: true
      }
    })

    meta.storeAddrs.forEach((storeAddr) => {
      utils.check({
        addr: storeAddr
      }, {
        addr: {
          presence: true,
          type: 'address',
          addrOfContract: 'Store'
        }
      })

    })
  }


  Submarket.prototype.set = function setSubmarket(infospheredData, metaData) {

    const deferred = $q.defer()
    const infospheredCalls = this.infosphered.getMartyrCalls(infospheredData)
    const metaCalls = this.meta.getMartyrCalls(metaData)
    const allCalls = infospheredCalls.concat(metaCalls)
    const data = utils.getMartyrData(allCalls)

    txMonitor.propose('Update Submarket', web3.eth.sendTransaction, [{
      data: data,
      gas: web3.eth.estimateGas({ data: data }) * 4
    }]).then((txReciept) => {
      deferred.resolve(txReciept)
    }, (err) => {
      deferred.reject(err)
    })

    return deferred.promise
  }

  Submarket.prototype.getEvents = function getSubmarketEvents(eventName, fromBlock, toBlock) {
    const deferred = $q.defer()
    fromBlock = fromBlock || 0
    toBlock = toBlock || 'lastest'

    this.contract[eventName]({}, { fromBlock: fromBlock, toBlock: toBlock }).get((error, results) => {
      if (error) {
        deferred.reject(error)
      } else {
        deferred.resolve(results)
      }
    })

    return deferred.promise
  }


  Submarket.prototype.update = function updateSubmarket() {
    const deferred = $q.defer()
    const submarket = this

    this.owner = this.contract.owner()
    this.forumAddr = this.contract.forumAddr()

    this.stores = []
    this.forum = new Forum(this.forumAddr)

    this.infosphered.update()

    this.currency = utils.toAscii(this.infosphered.data.currency)

    this.meta.update().then((meta) => {

      submarket.info = utils.sanitize(meta.data.info || '')

      if (submarket.isDeep) {
        meta.data.storeAddrs.forEach((storeAddr) => {
          submarket.stores.push(new Store(storeAddr))
        })
      }

      deferred.resolve(submarket)
    })


    Key.fetch(this.owner).then((key) => {
      submarket.key = key
    })

    return deferred.promise
  }

  return Submarket

})
