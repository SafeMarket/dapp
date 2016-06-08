/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts')
const chaithereum = require('chaithereum')

before(() => {
  return chaithereum.promise
})

describe('store', () => {

  let store

  it('successfully instantiates with blank params', () => {
    return chaithereum.web3.eth.contract(contracts.Store.abi).new.q([], [], [], { data: contracts.Store.bytecode }).should.eventually.be.contract.then((_store) => {
      store = _store
    }).should.eventually.be.fulfilled
  })

  it('successfully instantiates with non-blank params', () => {
    return chaithereum.web3.eth.contract(contracts.Store.abi).new.q(
      [1, 2, 3, 4, 5, 6].map(toBytes32),
      [1, 2, 3, 4].map(toBytes32),
      [1, 2].map(toBytes32),
      { data: contracts.Store.bytecode }
    ).then((_store) => {
      store = _store
    }).should.eventually.be.fulfilled
  })

  it('should have correct products length', () => {
    return store.getProductsLength.q().should.eventually.be.bignumber.equal(2)
  })

  it('should have correct products', () => {
    return chaithereum.web3.Q.all([
      store.getProductsLength.q().should.eventually.be.bignumber.equal(2),
      store.getProductIsActive.q(0).should.eventually.be.true,
      store.getProductTeraprice.q(0).should.eventually.be.bignumber.equal(1),
      store.getProductUnits.q(0).should.eventually.be.bignumber.equal(2),
      store.getProductFileHash.q(0).should.eventually.be.bignumber.equal(3),
      store.getProductIsActive.q(1).should.eventually.be.true,
      store.getProductTeraprice.q(1).should.eventually.be.bignumber.equal(4),
      store.getProductUnits.q(1).should.eventually.be.bignumber.equal(5),
      store.getProductFileHash.q(1).should.eventually.be.bignumber.equal(6),
      store.getProductIsActive.q(2).should.eventually.be.rejected
    ])
  })

  it('should have correct transports', () => {
    return chaithereum.web3.Q.all([
      store.getTransportsLength.q().should.eventually.be.bignumber.equal(2),
      store.getTransportIsActive.q(0).should.eventually.be.true,
      store.getTransportTeraprice.q(0).should.eventually.be.bignumber.equal(1),
      store.getTransportFileHash.q(0).should.eventually.be.bignumber.equal(2),
      store.getTransportIsActive.q(1).should.eventually.be.true,
      store.getTransportTeraprice.q(1).should.eventually.be.bignumber.equal(3),
      store.getTransportFileHash.q(1).should.eventually.be.bignumber.equal(4),
      store.getProductIsActive.q(2).should.eventually.be.rejected
    ])
  })

  it('should have correct approved aliases', () => {
    return chaithereum.web3.Q.all([
      store.getApprovedAliasesLength.q().should.eventually.be.bignumber.equal(2),
      store.getApprovedAlias.q(0).should.eventually.be.bignumber.equal(1),
      store.getApprovedAlias.q(1).should.eventually.be.bignumber.equal(2)
    ])
  })

  it('should be able to add a product', () => {
    return store.addProduct.q.apply(store, [7, 8, 9].map(toBytes32)).should.be.fulfilled
  })

  it('should have added product correctly', () => {
    return chaithereum.web3.Q.all([
      store.getProductsLength.q().should.eventually.be.bignumber.equal(3),
      store.getProductIsActive.q(2).should.eventually.be.true,
      store.getProductTeraprice.q(2).should.eventually.be.bignumber.equal(7),
      store.getProductUnits.q(2).should.eventually.be.bignumber.equal(8),
      store.getProductFileHash.q(2).should.eventually.be.bignumber.equal(9)
    ])
  })

  it('should be able to add a transport', () => {
    return store.addTransport.q.apply(store, [5, 6].map(toBytes32)).should.be.fulfilled
  })

  it('should have added product correctly', () => {
    return chaithereum.web3.Q.all([
      store.getTransportsLength.q().should.eventually.be.bignumber.equal(3),
      store.getTransportIsActive.q(2).should.eventually.be.true,
      store.getTransportTeraprice.q(2).should.eventually.be.bignumber.equal(5),
      store.getTransportFileHash.q(2).should.eventually.be.bignumber.equal(6)
    ])
  })

})

function toBytes32(thing) {
  const hex = chaithereum.web3.toHex(thing)
  const hexWithout0x = hex.replace('0x', '')
  const missingZeros = '0'.repeat(66 - hex.length)
  return `0x${missingZeros}${hexWithout0x}`
}
