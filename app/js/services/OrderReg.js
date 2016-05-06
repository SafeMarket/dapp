/* globals angular, web3, contracts */

angular.module('app').service('orderReg', function orderRegService(utils) {
  this.contract = web3.eth.contract(contracts.OrderReg.abi).at(contracts.OrderReg.address)

  this.getAddrs = function getAddrs(startIndex, length) {
    const addrs = []
    const addrsLength = this.contract.getAddrsLength()
    const _startIndex = Math.max(addrsLength - 1 - startIndex, 0)
    const endIndex = Math.max(_startIndex - length, 0)

    for (let i = _startIndex; i >= endIndex; i --) {
      const addr = this.contract.getAddr(i)
      if (!utils.isAddr(addr)) {
        return addrs
      }
      addrs.push(addr)
    }

    return addrs
  }

  this.getAddrsByStoreAddr = function getAddrsByStoreAddr(storeAddr, startIndex, length) {
    const addrs = []
    const addrsLength = this.contract.getAddrsByStoreAddrLength(storeAddr)
    const _startIndex = Math.max(addrsLength - 1 - startIndex, 0)
    const endIndex = Math.max(_startIndex - length, 0)

    for (let i = _startIndex; i >= endIndex; i --) {
      const addr = this.contract.getAddrByStoreAddr(storeAddr, i)
      if (!utils.isAddr(addr)) {
        return addrs
      }
      addrs.push(addr)
    }

    return addrs
  }

  this.getAddrsBySubmarketAddr = function getAddrsBySubmarketAddr(submarketAddr, startIndex, length) {
    const addrs = []
    const addrsLength = this.contract.getAddrsBySubmarketAddrLength(submarketAddr)
    const _startIndex = Math.max(addrsLength - 1 - startIndex, 0)
    const endIndex = Math.max(_startIndex - length, 0)

    for (let i = _startIndex; i >= endIndex; i --) {
      const addr = this.contract.getAddrBySubmarketAddr(submarketAddr, i)
      if (!utils.isAddr(addr)) {
        return addrs
      }
      addrs.push(addr)
    }

    return addrs
  }
})
