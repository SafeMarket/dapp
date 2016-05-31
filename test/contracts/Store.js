/* eslint no-unused-expressions: "off" */
/* globals describe, it, before, web3, contracts, expect */

"use strict";

let store

describe('store', () => {

  it('successfully instantiates', () => {
    return web3.eth.contract(contracts.Store.abi).new.q({ data: contracts.Store.bytecode }).then((_store) => {
      store = _store
    }).should.eventually.be.fulfilled
  })

  it('has a non-zero address', () => {
    expect(store.address).to.be.address
    expect(store.address).to.not.be.zeros
  })

})
