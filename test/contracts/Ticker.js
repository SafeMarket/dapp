/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts.js')
const web3TestPromise = require('../modules/web3-test.js')
const chai = require('chai')
const expect = chai.expect

chai.use(require('../modules/chaithereum.js'))
chai.should()

let web3
let ticker

before(() => {
  return web3TestPromise.then((_web3) => {
    web3 = _web3
    chai.use(require('chai-bignumber')(web3.toBigNumber(0).constructor))
    chai.use(require('chai-as-promised'))
  })
})

describe('Ticker', () => {

  it('successfully instantiates', () => {
    return web3.eth.contract(contracts.Ticker.abi).new.q({ data: contracts.Ticker.bytecode }).then((_ticker) => {
      ticker = _ticker
    }, () => {
    }).should.eventually.be.fulfilled
  })

  it('has a non-zero address', () => {
    expect(ticker.address).to.be.address
    expect(ticker.address).to.not.be.zeros
  })


  it('can set prices', () => {
    return web3.Q.all([
      ticker.setPrice.q('P', 1),
      ticker.setPrice.q('N', 5),
      ticker.setPrice.q('D', 10)
    ])
  })

  it('can retreive prices', () => {
    return web3.Q.all([
      ticker.getPrice.q('P').should.eventually.bignumber.equal(1),
      ticker.getPrice.q('N').should.eventually.bignumber.equal(5),
      ticker.getPrice.q('D').should.eventually.bignumber.equal(10)
    ])
  })

  it('cannot set prices from non-owner', () => {
    return ticker.setPrice.q('P', 1, { from: web3.accounts[1] }).should.be.rejected
  })

  it('correctly converts', () => {
    return web3.Q.all([
      ticker.convert.q(1, 'P', 'P').should.eventually.bignumber.equal(1),
      ticker.convert.q(5, 'P', 'N').should.eventually.bignumber.equal(1),
      ticker.convert.q(5, 'P', 'D').should.eventually.bignumber.equal(0),
      ticker.convert.q(1, 'D', 'P').should.eventually.bignumber.equal(10),
      ticker.convert.q(1, 'P', 'X').should.eventually.be.rejected,
      ticker.convert.q(1, 'X', 'P').should.eventually.be.rejected
    ])
  })

  
})
