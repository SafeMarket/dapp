(function(){

angular.module('app').factory('AffiliateReg',function($q,utils,txMonitor){

    function AffiliateReg(){
			this.addr = AffiliateReg.address
			this.contract = web3.eth.contract(contracts.AffiliateReg.abi).at(contracts.AffiliateReg.address)
		}

		AffiliateReg.prototype.code = AffiliateReg.code = contracts.AffiliateReg.code
	  AffiliateReg.prototype.abi = AffiliateReg.abi = contracts.AffiliateReg.abi
		AffiliateReg.prototype.contractFactory = AffiliateReg.contractFactory = web3.eth.contract(AffiliateReg.abi)

		window.AffiliateReg = new AffiliateReg()

		AffiliateReg.prototype.claimCode = function(code, coinbase){
			var deferred = $q.defer()
      ,txObject = {
        gas:this.contract.claimCode.estimateGas(code,coinbase)
        ,gasPrice:web3.eth.gasPrice
        ,from:web3.eth.accounts[0]
      }

      txMonitor.propose(
    		'claim a new Affiliate Code',
    		this.contract.claimCode,
    		[code,coinbase,txObject]
    	).then(function(txReciept){
    		deferred.resolve(txReciept.contractAddress)
    	})

    	return deferred.promise
		}

		AffiliateReg.prototype.update = function(){
			var deferred = $q.defer()

      this.addrToOwnerMap = this.contract.addrToOwnerMap()
			this.addrToCodeMap = this.contract.addrToCodeMap()
			this.codeToAddrMap = this.contract.codeToAddrMap()
			deferred.resolve(this)

			return deferred.promise
		}

		return window.AffiliateReg

	})

})();