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

    AffiliateReg.prototype.claimCode = function(code, account){
      var deferred = $q.defer()

      var message = 'Create a New Affiliate Code'
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

      if(parseInt(affiliateReg.contract.codeToOwnerMap(code)) !== 0) {
        throw 'this code is already registered'
      }
      if(parseInt(affiliateReg.contract.addrToCodeMap(account)) !== 0) {
        throw 'you already have a code for that account'
      }
    }

    AffiliateReg.prototype.changeAffiliate = function(code, account){
      var deferred = $q.defer()

      var message = 'Update an Affiliate Code'

      txMonitor.propose(
        message,
        this.contract.changeAffiliate,
        [code,account]
      ).then(function(txReciept){
        deferred.resolve(txReciept.contractAddress)
      })

      return deferred.promise
    }
    AffiliateReg.prototype.changeAffiliate.check = function(code, account) {
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

      if(affiliateReg.contract.codeToOwnerMap(code) !== user.data.account) {
        throw 'you do not own this code'
      }
      if(parseInt(affiliateReg.contract.addrToCodeMap(account)) !== 0) {
        throw 'this account is already registered'
      }
    }

    AffiliateReg.prototype.releaseCode = function(code){
      var deferred = $q.defer()

      var message = 'Delete Your Affiliate Code'

      txMonitor.propose(
        message,
        this.contract.releaseCode,
        [code]
      ).then(function(txReciept){
        deferred.resolve(txReciept.contractAddress)
      })

      return deferred.promise
    }
    AffiliateReg.prototype.releaseCode.check = function(code) {
      var affiliateReg=window.AffiliateReg
      utils.check({
        code:code
      },{
        code:{
          presence:true,
          type:'string'
        }
      })

      if(affiliateReg.contract.codeToOwnerMap(code) !== user.data.account) {
        throw 'you do not own this code'
      }
    }

    return window.AffiliateReg

  })

})();