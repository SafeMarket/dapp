/* globals angular */

angular.module('app').factory('Affiliate', (AffiliateReg, txMonitor) => {

  function Affiliate(code) {
    this.code = code
    this.update()
  }

  Affiliate.create = function createAffiliate(code, owner, coinbase) {
    return txMonitor.propose('Create an Affiliate', AffiliateReg.addAffiliate, [code, owner, coinbase])
  }

  Affiliate.prototype.update = function updateAffiliate() {
    const affiliateParams = AffiliateReg.getAffiliateParams(this.code)
    this.isDeleted = !AffiliateReg.getIsCodeTaken(this.code)
    this.owner = affiliateParams[0]
    this.coinbase = affiliateParams[1]
  }

  Affiliate.prototype.set = function setAffiliate(owner, coinbase) {
    return txMonitor.propose('Edit an Affiliate', AffiliateReg.setAffilliate, [this.code, owner, coinbase])
  }

  Affiliate.prototype.delete = function deleteAffiliate() {
    return txMonitor.propose('Delete an Affiliate', AffiliateReg.abandonAffiliate, [this.code])
  }

  return Affiliate

})
