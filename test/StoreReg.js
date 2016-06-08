/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts')
const chaithereum = require('chaithereum')

before(() => {
  return chaithereum.promise
})


describe('storeReg', () => {

  let infosphere
  let aliasReg
  let orderReg
  let storeReg
  let store

  const fileHash = chaithereum.web3.sha3('file')

  before(() => {
    return chaithereum.web3.Q.all([
      chaithereum.web3.eth.contract(contracts.Infosphere.abi).new.q({
        data: contracts.Infosphere.bytecode
      }).should.eventually.be.contract.then((_infosphere) => {
        infosphere = _infosphere
      }),
      chaithereum.web3.eth.contract(contracts.AliasReg.abi).new.q({
        data: contracts.AliasReg.bytecode
      }).should.eventually.be.contract.then((_aliasReg) => {
        aliasReg = _aliasReg
      }),
      chaithereum.web3.eth.contract(contracts.OrderReg.abi).new.q({
        data: contracts.OrderReg.bytecode
      }).should.eventually.be.contract.then((_orderReg) => {
        orderReg = _orderReg
      })
    ])
  })

  it('successfully instantiates', () => {
    return chaithereum.web3.eth.contract(contracts.StoreReg.abi).new.q({ data: contracts.StoreReg.bytecode }).should.eventually.be.contract.then((_storeReg) => {
      storeReg = _storeReg
    })
  })

  it('should set infosphere, alias reg, and order reg addr', () => {
    return chaithereum.web3.Q.all([
      storeReg.setInfosphereAddr.q(infosphere.address).should.be.fulfilled,
      storeReg.setAliasRegAddr.q(aliasReg.address).should.be.fulfilled,
      storeReg.setOrderRegAddr.q(orderReg.address).should.be.fulfilled
    ])
  })

  it('should correctly retreive infosphere, alias reg, and order reg addr', () => {
    return chaithereum.web3.Q.all([
      storeReg.infosphereAddr.q().should.eventually.equal(infosphere.address),
      storeReg.aliasRegAddr.q().should.eventually.equal(aliasReg.address),
      storeReg.orderRegAddr.q().should.eventually.equal(orderReg.address)
    ])
  })

  it('should create a store', (done) => {

    storeReg.Registration({}).watch((e, result) => {
      store = chaithereum.web3.eth.contract(contracts.Store.abi).at(result.args.storeAddr)
      store.should.be.contract
      done(e)
    })

    storeReg.create.q(
      chaithereum.account,
      true,
      'USD',
      10,
      60,
      1,
      3,
      fileHash,
      'storealias',
      [1, 2, 3, 4, 5, 6].map(toBytes32),
      [1, 2, 3, 4].map(toBytes32),
      [1, 2].map(toBytes32)
    )
  })

  describe('store', () => {

    it('should have correct owner', () => {
      return store.owner.q().should.eventually.equal(chaithereum.account)
    })

    it('should have correct infosphere address', () => {
      return store.getInfosphereAddr.q().should.eventually.equal(infosphere.address)
    })

    it('should have correct infosphere values', () => {
      return chaithereum.web3.Q.all([
        infosphere.getBool.q(store.address, 'isOpen').should.eventually.equal(true),
        store.getBytes32.q('currency').should.eventually.be.ascii('USD'),
        store.getUint.q('bufferCentiperun').should.eventually.be.bignumber.equal(10),
        store.getUint.q('disputeSeconds').should.eventually.be.bignumber.equal(60),
        store.getUint.q('minProductsTeratotal').should.eventually.be.bignumber.equal(1),
        store.getUint.q('affiliateFeeCentiperun').should.eventually.bignumber.be.equal(3),
        store.getBytes32.q('fileHash').should.eventually.be.equal(fileHash)
      ])
    })

    it('should have correct alias', () => {
      return chaithereum.web3.Q.all([
        aliasReg.getAlias.q(store.address).should.eventually.be.ascii('storealias'),
        aliasReg.getAddr.q('storealias').should.eventually.equal(store.address)
      ])
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

    it('should have added transport correctly', () => {
      return chaithereum.web3.Q.all([
        store.getTransportsLength.q().should.eventually.be.bignumber.equal(3),
        store.getTransportIsActive.q(2).should.eventually.be.true,
        store.getTransportTeraprice.q(2).should.eventually.be.bignumber.equal(5),
        store.getTransportFileHash.q(2).should.eventually.be.bignumber.equal(6)
      ])
    })

  })

})

function toBytes32(thing) {
  const hex = chaithereum.web3.toHex(thing)
  const hexWithout0x = hex.replace('0x', '')
  const missingZeros = '0'.repeat(66 - hex.length)
  return `0x${missingZeros}${hexWithout0x}`
}
