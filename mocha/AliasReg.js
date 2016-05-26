/* eslint no-unused-expressions: "off" */
/* globals describe, it */

const contracts = require('../modules/contracts.js')
const web3TestPromise = require('../modules/web3-test.js')
const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

chai.use(require('../modules/chaithereum.js'))

describe('AliasReg', () => {

  it('can be instantiated', (done) => {

    web3TestPromise.then((web3) => {

      web3.eth.contract(contracts.AliasReg.abi).new.q({ data: contracts.AliasReg.bytecode }).then((aliasReg) => {
        expect(aliasReg.address).to.be.address
        expect(aliasReg.address).to.be.zeros
        done()
      })
    })

  })

})
