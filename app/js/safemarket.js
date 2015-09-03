(function(){
	
	var safemarket = angular.module('safemarket',[])

	safemarket.service('safemarket',function($interval,$q){
		
		var safemarket = this

		this.getStorefronts = function(){
			var storefrontAddrs = Marketplace.getStorefrontAddrs()
				,storefronts = []

			storefrontAddrs.forEach(function(addr){
				try{
					storefronts.push(new Storefront(addr))
				}catch(e){
					console.warn('Could not decode storefront at',addr)
					console.warn(e)
				}
			})

			return storefronts
		}

		this.createStorefront = function(meta){


			var deferred = $q.defer()
				,metaHex = convertObjectToHex(meta)
				,txHex = web3.eth.sendTransaction(metaHex,{
					data:Storefront.code
					,gas:4000000
					,from:web3.eth.accounts[0]
					,to:StorefrontContract.add
				})

			safemarket.waitForTx(txHex).then(function(tx){
				deferred.resolve(tx)
			},function(){
				deferred.reject()
			})

			return deferred.promise
		}

		this.waitForTx = function waitForTx(txHex, duration, pause){
			console.log('waitForTx',txHex)

			var deferred = $q.defer()
				,duration = duration ? duration : (1000*60)
				,pause = pause ? pause : (1000*3)
				,timeStart = Date.now()
				,interval = $interval(function(){

					var tx = web3.eth.getTransaction(txHex)

					if(tx.blockNumber){
						$interval.cancel(interval)
						console.log('waitForTx:resolve',tx)
						deferred.resolve(tx)
					}

					if(Date.now() - timeStart > duration){
						$interval.cancel(interval)
						console.log('waitForTx:reject')
						deferred.reject()
					}

				},pause)

			return deferred.promise

		}

	})

	function Storefront(addr){
		this.contract = web3.eth.contract(StorefrontContractAbi).at(addr)
		this.update()
	}

	Storefront.code = Storefront.prototype.code =  web3.eth.getCode(StorefrontContract.address)

	Storefront.prototype.update = function(){
		this.meta = convertHexToObject(this.contract.getMeta())
	}

	function convertObjectToHex(object){
		var objectBytes = msgpack.pack(object);
		return '0x'+cryptocoin.convertHex.bytesToHex(objectBytes)
	}

	function convertHexToObject(hex){
		var objectBytes = cryptocoin.convertHex.hexToBytes(hex)
		return msgpack.unpack(objectBytes)
	}


}());
