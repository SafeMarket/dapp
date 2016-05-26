module.exports = function exportChainthereum(chai, utils) {

  /* address */
  chai.Assertion.addProperty('address', function addAddressProperty() {
    utils.expectType(this, ['string'])

    var obj = utils.flag(this, 'object')

    new chai.Assertion(obj).to.be.equal('fd0x')
    
  })

  /* zero bytes */
  utils.addProperty(chai.Assertion.prototype, 'zeros', function addZerosProperty() {
    this.assert(
      typeof this._obj === 'string'
      && this._obj.indexOf('0x') === 0
      && this._obj.replace('00', '').length === 3,
      'expected #{this} to be a string of 00 bytes',
      'expected #{this} to not a string of 00 bytes'
    )
  })

}
