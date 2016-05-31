/* eslint no-unused-expressions: "off" */
/* globals describe, it, before, web3, contracts, expect */

"use strict";

let ordered

describe('ordered', () => {

  it('successfully instantiates', () => {
    return web3.eth.contract(contracts.ordered.abi).new.q({ data: contracts.ordered.bytecode }).then((_ordered) => {
      ordered = _ordered
    }).should.eventually.be.fulfilled
  })

  it('has a non-zero address', () => {
    expect(ordered.address).to.be.address
    expect(ordered.address).to.not.be.zeros
  })

  it('cannot set order addr from accounts[1]', () => {
    return ordered.setOrderRegAddr.q(web3.accounts[0], { from: web3.accounts[1] }).should.be.rejected
  })

  it('set order addr as accounts[0]', () => {
    return ordered.setOrderRegAddr.q(web3.accounts[0]).should.be.fulfilled
  })

  it('cannot add order addr from non order reg', () => {
    return ordered.addOrderAddr.q(1, { from: web3.accounts[1] }).should.be.rejected
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
