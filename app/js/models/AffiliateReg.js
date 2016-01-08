(function(){

angular.module('app').factory('AffiliateReg',function($q,utils,CommentsGroup){

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

		AffiliateReg.prototype.claimAlias = function(alias, coinbase){
			var deferred = $q.defer()
			,txObject = {
				gas:this.contract.claimAlias.estimateGas(alias,coinbase)
				,gasPrice:web3.eth.gasPrice
				,from:web3.eth.accounts[0]
			},txHex = this.contract.claimAlias(alias,coinbase,txObject)
			,affiliateReg = thisz

			utils.waitForTx(txHex).then(function(tx){
				affiliateReg.update().then(function(){
					deferred.resolve(affiliateReg)
				})
			},function(error){
				deferred.reject(error)
			}).catch(function(error){
				console.error(error)
				deferred.reject(error)
			})

			return deferred.promise
		}

		AffiliateReg.prototype.update = function(){
			var deferred = $q.defer()

			this.addrToAliasMap = this.contract.addrToAliasMap()
			this.aliasToAddrMap = this.contract.aliasToAddrMap()
			deferred.resolve(this)

			return deferred.promise
		}

		return window.AffiliateReg

	})

})();