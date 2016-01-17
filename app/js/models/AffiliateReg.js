(function(){

angular.module('app').factory('AffiliateReg',function($q,utils,txMonitor){

    var oldAffiliateReg = window.AffiliateReg
    function AffiliateReg(){
			this.addr = oldAffiliateReg.address
			this.contract = oldAffiliateReg
		}

		AffiliateReg.prototype.code = AffiliateReg.code = '0x'+contractDB.AffiliateReg.compiled.code
		AffiliateReg.prototype.runtimeBytecode = AffiliateReg.runtimeBytecode = utils.runtimeBytecodes.AffiliateReg
		AffiliateReg.prototype.abi = AffiliateReg.abi = contractDB.AffiliateReg.compiled.info.abiDefinition
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