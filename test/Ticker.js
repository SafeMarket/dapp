/* eslint no-unused-expressions: "off" */
/* globals describe, it, before, beforeEach */

"use strict";

const contracts = require('../modules/contracts')
const chaithereum = require('chaithereum')

before(() => {
  return chaithereum.promise
})

describe('Ticker', () => {

  let ticker

  it('successfully instantiates', () => {
    return chaithereum.web3.eth.contract(contracts.Ticker.abi).new.q({ data: contracts.Ticker.bytecode }).should.eventually.be.contract.then((_ticker) => {
      ticker = _ticker
    })
  })

  it('can set prices', () => {
    return chaithereum.web3.Q.all([
      ticker.setPrice.q('P', 1),
      ticker.setPrice.q('N', 5),
      ticker.setPrice.q('D', 10)
    ])
  })

  it('can retreive prices', () => {
    return chaithereum.web3.Q.all([
      ticker.getPrice.q('P').should.eventually.bignumber.equal(1),
      ticker.getPrice.q('N').should.eventually.bignumber.equal(5),
      ticker.getPrice.q('D').should.eventually.bignumber.equal(10)
    ])
  })

  it('cannot set prices from non-owner', () => {
    return ticker.setPrice.q('P', 1, { from: chaithereum.accounts[1] }).should.be.rejected
  })

  it('correctly converts', () => {
    return chaithereum.web3.Q.all([
      ticker.convert.q(1, 'P', 'P').should.eventually.bignumber.equal(1),
      ticker.convert.q(5, 'P', 'N').should.eventually.bignumber.equal(1),
      ticker.convert.q(5, 'P', 'D').should.eventually.bignumber.equal(0),
      ticker.convert.q(1, 'D', 'P').should.eventually.bignumber.equal(10),
      ticker.convert.q(1, 'P', 'X').should.eventually.be.rejected,
      ticker.convert.q(1, 'X', 'P').should.eventually.be.rejected
    ])
  })

})
