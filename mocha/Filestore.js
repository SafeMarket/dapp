/* eslint no-unused-expressions: "off" */
/* globals describe, it, before, beforeEach */

"use strict";

const contracts = require('../modules/contracts.js')
const web3TestPromise = require('../modules/web3-test.js')
const chai = require('chai')
const expect = chai.expect

chai.use(require('../modules/chaithereum.js'))
chai.should()

let web3
let filestore
let file = '0x02'
let fileHash
let blockNumber

before(() => {
  return web3TestPromise.then((_web3) => {
    web3 = _web3
    fileHash = web3.sha3(file, { encoding: 'hex' })
    chai.use(require('chai-bignumber')(web3.toBigNumber(0).constructor))
    chai.use(require('chai-as-promised'))
  })
})

describe('Filestore', () => {

  beforeEach(() => {
    return web3.eth.getBlockNumber.q().then((_blockNumber) => {
      blockNumber = _blockNumber
    })
  })

  it('successfully instantiates', () => {
    return web3.eth.contract(contracts.Filestore.abi).new.q({ data: contracts.Filestore.bytecode }).then((_filestore) => {
      filestore = _filestore
    }).should.be.fulfilled
  })

  it('has a non-zero address', () => {
    expect(filestore.address).to.be.address
    expect(filestore.address).to.not.be.zeros
  })

  it('can store file', (done) => {
    filestore.Store({ fileHash: fileHash }).watch((e, result) => {
      expect(result.args.file).to.equal(file)
      done()
    })
    filestore.store.q(file).should.be.fulfilled
  })

  it('can retreive file block number', () => {
    return filestore.getBlockNumber.q(fileHash).should.eventually.bignumber.equal(blockNumber)
  })

})
