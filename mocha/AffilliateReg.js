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
let affiliateReg

before(() => {
  return web3TestPromise.then((_web3) => {
    web3 = _web3
  })
})

describe('AffiliateReg', () => {

  it('successfully instantiates', () => {
    return web3.eth.contract(contracts.AffiliateReg.abi).new.q({ data: contracts.AffiliateReg.bytecode }).then((_affiliateReg) => {
      affiliateReg = _affiliateReg
    }).should.be.fulfilled
  })

  it('has a non-zero address', () => {
    expect(affiliateReg.address).to.be.address
    expect(affiliateReg.address).to.not.be.zeros
  })

  it('should not have "aff" owner', () => {
    return web3.Q.all([
      expect(affiliateReg.getAffiliateOwner.q('aff')).to.eventually.be.address,
      expect(affiliateReg.getAffiliateOwner.q('aff')).to.eventually.be.zeros
    ])
  })

  it('should be able to claim "aff"', () => {
    return affiliateReg.setAffiliate.q('aff', web3.accounts[0], web3.accounts[1])
  })

  it('should have correct owner for "aff"', () => {
    return affiliateReg.getAffiliateOwner.q('aff').should.eventually.equal(web3.accounts[0])
  })

  it('should have correct coinbase for "aff"', () => {
    return affiliateReg.getAffiliateCoinbase.q('aff').should.eventually.equal(web3.accounts[1])
  })

})
