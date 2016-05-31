/* eslint no-unused-expressions: "off" */
/* globals describe, it, before */

"use strict";

const contracts = require('../modules/contracts')
const chaithereum = require('../modules/chaithereum')

before(() => {
  return chaithereum.promise
})

describe('AffiliateReg', () => {

  let affiliateReg

  it('successfully instantiates', () => {
    return chaithereum.web3.eth.contract(contracts.AffiliateReg.abi).new.q({ data: contracts.AffiliateReg.bytecode }).then((_affiliateReg) => {
      affiliateReg = _affiliateReg
    }).should.be.fulfilled
  })

  it('has a non-zero address', () => {
    chaithereum.chai.expect(affiliateReg.address).to.be.address
    chaithereum.chai.expect(affiliateReg.address).to.not.be.zeros
  })

  it('should not have "aff" owner', () => {
    return chaithereum.web3.Q.all([
      chaithereum.chai.expect(affiliateReg.getAffiliateOwner.q('aff')).to.eventually.be.address,
      chaithereum.chai.expect(affiliateReg.getAffiliateOwner.q('aff')).to.eventually.be.zeros
    ])
  })

  it('should be able to claim "aff"', () => {
    return affiliateReg.setAffiliate.q('aff', chaithereum.accounts[0], chaithereum.accounts[1])
  })

  it('should have correct owner for "aff"', () => {
    return affiliateReg.getAffiliateOwner.q('aff').should.eventually.equal(chaithereum.accounts[0])
  })

  it('should have correct coinbase for "aff"', () => {
    return affiliateReg.getAffiliateCoinbase.q('aff').should.eventually.equal(chaithereum.accounts[1])
  })

})
