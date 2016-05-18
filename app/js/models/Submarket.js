/* globals angular, contracts, web3 */

angular.module('app').factory('Submarket', (utils, ticker, $q, Store, Key, Forum, txMonitor, AliasReg, SubmarketReg, Infosphered, Meta, filestore, constants, Coinage) => {

  function Submarket(addrOrAlias) {
    this.addr = utils.isAddr(addrOrAlias) ? addrOrAlias : AliasReg.getAddr(addrOrAlias)
    this.alias = utils.getAlias(this.addr)
    this.contract = this.contractFactory.at(this.addr)
    this.infosphered = new Infosphered(this.contract, this.infospheredTypes)
    this.update()
  }

  window.Submarket = Submarket

  Submarket.prototype.bytecode = Submarket.bytecode = contracts.Submarket.bytecode
  Submarket.prototype.runtimeBytecode = Submarket.runtimeBytecode = utils.runtimeBytecodes.Submarket
  Submarket.prototype.abi = Submarket.abi = contracts.Submarket.abi
  Submarket.prototype.contractFactory = Submarket.contractFactory = web3.eth.contract(Submarket.abi)
  Submarket.prototype.infospheredTypes = Submarket.infospheredTypes = {
    isOpen: 'bool',
    currency: 'bytes32',
    escrowFeeTerabase: 'uint',
    escrowFeeCentiperun: 'uint',
    fileHash: 'bytes32'
  }

  Submarket.create = function createSubmarket(owner, isOpen, currency, escrowFeeTerabase, escrowFeeCentiperun, meta, alias) {

    const metaHex = utils.convertObjectToHex(meta)
    const aliasHex = web3.toHex(alias)
    const metaHash = utils.sha3(metaHex, { encoding: 'hex' })

    const deferred = $q.defer()

    const calls = filestore.getMartyrCalls([metaHex]).concat([{
      address: SubmarketReg.address,
      data: SubmarketReg.create.getData(
        owner,
        isOpen,
        currency,
        escrowFeeTerabase,
        escrowFeeCentiperun,
        metaHash,
        aliasHex
      )
    }])

    utils.fetchMartyrData(calls).then((martyrData) => {

      txMonitor.propose(
        'Create a New Submarket',
        web3.eth.sendTransaction,
        [{ data: martyrData }]
      ).then((txReciept) => {
        const contractAddress = utils.getContractAddressFromTxReceipt(txReciept)
        deferred.resolve(new Submarket(contractAddress))
      })

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
      }
    })

    // meta.storeAddrs.forEach((storeAddr) => {
    //   utils.check({
    //     addr: storeAddr
    //   }, {
    //     addr: {
    //       presence: true,
    //       type: 'address',
    //       addrOfContract: 'Store'
    //     }
    //   })

    // })
  }


  Submarket.prototype.set = function setSubmarket(infospheredData, meta) {

    const deferred = $q.defer()

    const metaCalls = []
    const file = utils.convertObjectToHex(meta)
    const fileHash = utils.sha3(file)

    infospheredData.fileHash = fileHash

    const infospheredCalls = this.infosphered.getMartyrCalls(infospheredData)

    if (this.infosphered.data.fileHash !== fileHash) {
      metaCalls.push.apply(metaCalls, filestore.getMartyrCalls([file]))
    }

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

    this.updatePromise = deferred.promise

    this.owner = this.contract.owner()
    this.forumAddr = this.contract.forumAddr()

    this.stores = []
    this.forum = new Forum(this.forumAddr)

    this.infosphered.update()

    this.currency = utils.toAscii(this.infosphered.data.currency)
    this.escrowFeeBase = new Coinage(this.infosphered.data.escrowFeeTerabase.div(constants.tera), this.currency)
    this.key = new Key(this.owner)

    filestore.fetchFile(this.infosphered.data.fileHash).then((file) => {
      this.file = file
      this.meta = utils.convertHexToObject(file)
      this.info = utils.sanitize(this.meta.info || '')
      deferred.resolve(this)
    })
  }

  return Submarket

})
