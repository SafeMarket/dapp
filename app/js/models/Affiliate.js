angular.module('app').factory('Affiliate',function(AffiliateReg,txMonitor,$q,growl,utils){
	function Affiliate(code){
		this.code = code
		this.update()
	}

	Affiliate.create = function(code,owner,coinbase){
		return txMonitor.propose('Create an Affiliate',AffiliateReg.addAffiliate,[code,owner,coinbase])
	}

	Affiliate.prototype.update = function(){
		var affiliateParams = AffiliateReg.getAffiliateParams(this.code)
		this.isDeleted = !AffiliateReg.getIsCodeTaken(this.code)
		this.owner = affiliateParams[0]
		this.coinbase = affiliateParams[1]
	}

	Affiliate.prototype.set = function(owner,coinbase){
		return txMonitor.propose('Edit an Affiliate',AffiliateReg.setAffilliate,[this.code,owner,coinbase])
	}

	Affiliate.prototype.delete = function(){
		return txMonitor.propose('Delete an Affiliate',AffiliateReg.abandonAffiliate,[this.code])
	}

	return Affiliate
});