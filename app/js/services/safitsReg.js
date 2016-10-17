/* globals angular, web3, contracts */

angular.module('app').service('safitsReg', function safitsReg($q, utils) {

  this.contract = web3.eth.contract(contracts.SafitsReg.abi).at(contracts.SafitsReg.address)

  this.getLogs = function getLogs(holderAddr) {

    const logs = []
    const period = this.contract.getPeriod().toNumber()

    const holderParams = this.contract.getHolderParams(holderAddr)
    const holderPeriod0 = holderParams[0]

    if (holderPeriod0.equals(0)) {
      return null
    }

    let i = 0

    while (holderPeriod0.plus(i).lessThanOrEqualTo(period)) {
      logs.push(new Log(this, holderAddr, holderPeriod0.plus(i)))
      i++
    }

    return logs
  }

  function Log(_safitsReg, holderAddr, period) {

    this.period = period

    const regLogParams = _safitsReg.contract.getRegLogParams(period)
    const holderLogParams = _safitsReg.contract.getHolderLogParams(holderAddr, period)

    this.reg = {
      isFinalized: regLogParams[0],
      weiReceived: regLogParams[1],
      safitsSupply: regLogParams[3]
    }

    this.holder = {
      isFinalized: holderLogParams[0],
      safitsDelta: holderLogParams[1].minus(holderLogParams[2]),
      safitsBalance: holderLogParams[3]
    }

  }
})
