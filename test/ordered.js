/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts')
const chaithereum = require('chaithereum')

before(() => {
  return chaithereum.promise
})

describe('ordered', () => {

  let ordered

  it('successfully instantiates', () => {
    return chaithereum.web3.eth.contract(contracts.ordered.abi).new.q({ data: contracts.ordered.bytecode }).should.eventually.be.contract.then((_ordered) => {
      ordered = _ordered
    })
  })

  it('cannot set order addr from accounts[1]', () => {
    return ordered.setOrderReg.q(chaithereum.accounts[0], { from: chaithereum.accounts[1] }).should.be.rejected
  })

  it('set order addr as accounts[0]', () => {
    return ordered.setOrderReg.q(chaithereum.accounts[0]).should.be.fulfilled
  })

  it('cannot add order addr from non order reg', () => {
    return ordered.addOrderAddr.q(1, { from: chaithereum.accounts[1] }).should.be.rejected
  })

  it('can add order addr from order reg', () => {
    return ordered.addOrderAddr.q(1).should.be.fulfilled
  })

  it('should retreive correct order addrs count', () => {
    return ordered.getOrderAddrsCount.q().should.eventually.be.bignumber.equal(1)
  })

  it('should retreive correct order addr', () => {
    return ordered.getOrderAddr.q(0).should.eventually.be.bignumber.equal(1)
  })

})
