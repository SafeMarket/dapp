/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts.js')
const web3TestPromise = require('../modules/web3-test.js')
const chai = require('chai')
const expect = chai.expect

chai.use(require('../modules/chaithereum.js'))
chai.use(require('chai-as-promised'))
chai.should()

let web3
let aliasReg

before(() => {
  return web3TestPromise.then((_web3) => {
    web3 = _web3
  })
})

describe('AliasReg', () => {

  it('successfully instantiates', () => {
    return web3.eth.contract(contracts.AliasReg.abi).new.q({ data: contracts.AliasReg.bytecode }).then((_aliasReg) => {
      aliasReg = _aliasReg
    }).should.be.fulfilled
  })

  it('has a non-zero address', () => {
    expect(aliasReg.address).to.be.address
    expect(aliasReg.address).to.not.be.zeros
  })

  it('cannot claim a blank alias', () => {
    return aliasReg.claimAlias.q('').should.eventually.be.rejected
  })

  it('can claim "myalias"', () => {
    return aliasReg.claimAlias.q('myalias').should.eventually.be.fullfilled
  })

  it('can retreive address associated with "myalias"', () => {
    return aliasReg.getAddr.q('myalias').should.eventually.equal(web3.eth.defaultAccount)
  })
})
