/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts')
const chaithereum = require('../modules/chaithereum')

before(() => {
  return chaithereum.promise
})

describe('AliasReg', () => {

  let aliasReg

  it('successfully instantiates', () => {
    return chaithereum.web3.eth.contract(contracts.AliasReg.abi).new.q({ data: contracts.AliasReg.bytecode }).then((_aliasReg) => {
      aliasReg = _aliasReg
    }).should.be.fulfilled
  })

  it('has a non-zero address', () => {
    chaithereum.chai.expect(aliasReg.address).to.be.address
    chaithereum.chai.expect(aliasReg.address).to.not.be.zeros
  })

  it('cannot claim a blank alias', () => {
    return aliasReg.claimAlias.q('').should.eventually.be.rejected
  })

  it('can claim "myalias"', () => {
    return aliasReg.claimAlias.q('myalias').should.eventually.be.fullfilled
  })

  it('can retreive address associated with "myalias"', () => {
    return aliasReg.getAddr.q('myalias').should.eventually.equal(chaithereum.web3.eth.defaultAccount)
  })
})
