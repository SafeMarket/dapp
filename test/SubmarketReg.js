/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts')
const chaithereum = require('chaithereum')

before(() => {
  return chaithereum.promise
})


describe('SubmarketReg', () => {

  let infosphere
  let aliasReg
  let orderReg
  let submarketReg
  let submarket

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
    return chaithereum.web3.eth.contract(contracts.SubmarketReg.abi).new.q({ data: contracts.SubmarketReg.bytecode }).then((_submarketReg) => {
      submarketReg = _submarketReg
    }).should.eventually.be.fulfilled
  })

  it('should set infosphere, alias reg, and order reg addr', () => {
    return chaithereum.web3.Q.all([
      submarketReg.setInfosphereAddr.q(infosphere.address).should.be.fulfilled,
      submarketReg.setAliasRegAddr.q(aliasReg.address).should.be.fulfilled
    ])
  })

  it('should correctly retreive infosphere, alias reg, and order reg addr', () => {
    return chaithereum.web3.Q.all([
      submarketReg.infosphereAddr.q().should.eventually.equal(infosphere.address),
      submarketReg.aliasRegAddr.q().should.eventually.equal(aliasReg.address)
    ])
  })

  it('should create a submarket', (done) => {

    submarketReg.Registration({}).watch((e, result) => {
      chaithereum.chai.expect(result.args.submarketAddr).to.be.address
      chaithereum.chai.expect(result.args.submarketAddr).to.not.be.zeros
      submarket = chaithereum.web3.eth.contract(contracts.Submarket.abi).at(result.args.submarketAddr)
      submarket.should.be.contract
      done(e)
    })

    submarketReg.create.q(
      chaithereum.account,
      true,
      'USD',
      10,
      5,
      fileHash,
      'submarketalias'
    )
  })

  describe('Submarket', () => {

    it('should have correct owner', () => {
      return submarket.owner.q().should.eventually.equal(chaithereum.account)
    })

    it('should have correct infosphere address', () => {
      return submarket.getInfosphereAddr.q().should.eventually.equal(infosphere.address)
    })

    it('should have correct infosphere values', () => {
      return chaithereum.web3.Q.all([
        infosphere.getBool.q(submarket.address, 'isOpen').should.eventually.equal(true),
        submarket.getBytes32.q('currency').should.eventually.be.ascii('USD'),
        submarket.getUint.q('escrowFeeTerabase').should.eventually.be.bignumber.equal(10),
        submarket.getUint.q('escrowFeeCentiperun').should.eventually.be.bignumber.equal(5),
        submarket.getBytes32.q('fileHash').should.eventually.be.equal(fileHash)
      ])
    })

    it('should have correct alias', () => {
      return chaithereum.web3.Q.all([
        aliasReg.getAlias.q(submarket.address).should.eventually.be.ascii('submarketalias'),
        aliasReg.getAddr.q('submarketalias').should.eventually.equal(submarket.address)
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
