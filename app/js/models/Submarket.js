/* globals angular, contracts, web3 */

angular.module('app').factory('Submarket', (utils, ticker, $q, Key, Forum, txMonitor, AliasReg, SubmarketReg, Infosphered, Meta, constants, Coinage, ipfs, ApprovesAliases) => {

  function Submarket(addrOrAlias) {
    console.log(this)
    this.addr = utils.isAddr(addrOrAlias) ? addrOrAlias : AliasReg.getAddr(addrOrAlias)
    this.alias = utils.getAlias(this.addr)
    this.contract = this.contractFactory.at(this.addr)
    this.infosphered = new Infosphered(this.contract, this.infospheredTypes)
    this.approvesAliases = new ApprovesAliases(this.contract)
    this.update()
  }
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

  Submarket.create = function createSubmarket(owner, isOpen, currency, escrowFeeTerabase, escrowFeeCentiperun, meta, alias, approvedAliases) {

    console.log('create')

    const file = new Buffer(JSON.stringify(meta))
    console.log('file', file)
    const fileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(file))
    console.log('fileHash', fileHash)
    const aliasHex = web3.toHex(alias)
    console.log('aliasHex', aliasHex)

    return ipfs.upload([file]).then(() => {

      return txMonitor.propose(
        'Create a New Submarket',
        SubmarketReg.create,
        [
          owner,
          isOpen,
          currency,
          escrowFeeTerabase,
          escrowFeeCentiperun,
          fileHash,
          aliasHex,
          approvedAliases.map(utils.toBytes32)
        ]
      ).then((txReciept) => {
        const contractAddress = utils.getContractAddressFromTxReceipt(txReciept)
        return new Submarket(contractAddress)
      })

    })

    
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


  Submarket.prototype.set = function set(infospheredData, approvedAliases, meta) {

    const file = utils.convertObjectToBuffer(meta)
    const fileHash = utils.convertMultihashToBytes32Hex(ipfs.hash(file))

    infospheredData.fileHash = fileHash

    const infospheredCalls = this.infosphered.getMartyrCalls(infospheredData)
    console.log('infospheredCalls', infospheredCalls)
    const approvesAliasesCalls = this.approvesAliases.getMartyrCalls(approvedAliases)
    console.log('approvesAliasesCalls', approvesAliasesCalls)
    const allCalls = infospheredCalls.concat(approvesAliasesCalls)
    console.log('allCalls', allCalls)

    if (allCalls.length === 0) {
      return $q.reject('No updates')
    }

    return ipfs.upload([file]).then(() => {
      return utils.fetchMartyrData(allCalls).then((martyrData) => {
        console.log('martyrData fetched')
        return txMonitor.propose('Update Submarket', web3.eth.sendTransaction, [{
          data: martyrData,
          gas: web3.eth.estimateGas({ data: martyrData }) * 4
        }])
      })
    })

  }

  Submarket.prototype.getEvents = function getSubmarketEvents(eventName, fromBlock, toBlock) {
    const deferred = $q.defer()
    fromBlock = fromBlock || 0
    toBlock = toBlock || 'latest'

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
    console.log('update safemarket')
    const deferred = $q.defer()

    this.updatePromise = deferred.promise

    this.owner = this.contract.owner()
    this.forumAddr = this.contract.forumAddr()

    this.forum = new Forum(this.forumAddr)

    this.infosphered.update()
    this.approvesAliases.update()

    this.currency = utils.toAscii(this.infosphered.data.currency)
    this.escrowFeeBase = new Coinage(this.infosphered.data.escrowFeeTerabase.div(constants.tera), this.currency)
    this.key = new Key(this.owner)

    ipfs.fetch(utils.convertBytes32HexToMultihash(this.infosphered.data.fileHash)).then((file) => {
      this.file = file
      console.log(this.file)
      this.meta = JSON.parse(file)
      this.info = utils.sanitize(this.meta.info || '')
      deferred.resolve(this)
    })

    return this.updatePromise
  }

  return Submarket

})
