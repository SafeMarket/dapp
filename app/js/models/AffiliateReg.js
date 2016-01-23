(function(){

  angular.module('app').factory('AffiliateReg',function($q,user,utils,txMonitor){

    function AffiliateReg(){
      this.addr = AffiliateReg.address
      this.contract = web3.eth.contract(contracts.AffiliateReg.abi).at(contracts.AffiliateReg.address)
    }

    AffiliateReg.prototype.code = AffiliateReg.code = contracts.AffiliateReg.code
    AffiliateReg.prototype.abi = AffiliateReg.abi = contracts.AffiliateReg.abi
    AffiliateReg.prototype.contractFactory = AffiliateReg.contractFactory = web3.eth.contract(AffiliateReg.abi)

    window.AffiliateReg = new AffiliateReg()

    AffiliateReg.prototype.claimCode = function(code, account, newAffiliateCode){
      var deferred = $q.defer()

      var message = newAffiliateCode?'Create a New Affiliate Code':'Update an Affiliate Code'
      txMonitor.propose(
        message,
        this.contract.claimCode,
        [code,account]
      ).then(function(txReciept){
        deferred.resolve(txReciept.contractAddress)
      })

      return deferred.promise
    }
    AffiliateReg.prototype.claimCode.check = function(code, account) {
      var affiliateReg=window.AffiliateReg
      utils.check({
        code:code,
        account:account
      },{
        code:{
          presence:true,
          type:'string'
        },
        account: {
          presence:true,
          type:'address'
        }
      })

      if(parseInt(affiliateReg.contract.codeToOwnerMap(code)) !== 0 && parseInt(affiliateReg.contract.codeToOwnerMap(code)) != user.data.account) {
        throw 'this code is taken by another account'
      }
    }

    return window.AffiliateReg

  })

})();